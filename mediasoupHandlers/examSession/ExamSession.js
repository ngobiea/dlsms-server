import { createWebRtcTransport } from '../../mediasoupServer.js';
import ExamSession from '../../model/ExamSession.js';
import StudentExamSession from '../../model/StudentExamSession.js';
import { Participant } from './Participants.js';
import { AWS } from '../../util/aws/AWS.js';
export class ExamSes {
  constructor(router, examSessionId, io) {
    this.setRouter(router);
    this.examSessionId = examSessionId;
    this.students = new Map();
    this.tutor = null;
    this.io = io;
  }

  /** */
  setRouter(router) {
    this.router = router;
  }
  /** */
  getRouter() {
    return this.router;
  }

  //
  addUser(socket, callback) {
    if (socket.user.role === 'student') {
      this.addStudents(socket, callback);
    } else if (socket.user.role === 'tutor') {
      this.setTutor(socket, callback);
    }
  }

  /** */
  async addStudents(socket, callback) {
    try {
      const examSession = await ExamSession.findById(
        this.examSessionId
      ).populate('students');
      let studentInSession;
      if (examSession?.status === 'ongoing') {
        studentInSession = examSession.students.find(
          (student) => student.studentId.toString() === socket.userId
        );
        if (!studentInSession) {
          const student = new StudentExamSession({
            studentId: socket.userId,
            examSessionId: this.examSessionId,
          });
          const sessionId = await student.save();
          examSession.students.push(student._id);
          await examSession.save();
          const newStudent = new Participant(
            this.examSessionId,
            this.io,
            socket.user,
            sessionId._id.toString()
          );
          this.students.set(socket.user._id.toString(), newStudent);
          console.log('new student added to exam session');
          AWS.createFolderInBucket(
            process.env.EXAM_RECORD_BUCKET,
            `${socket.userId}/${this.examSessionId}/`
          );
          callback({
            rtpCapabilities: this.router.rtpCapabilities,
            status: examSession.status,
          });
        } else {
          console.log('student already left exam session');
          callback({
            status: 'studentEnded',
          });
        }
      } else if (examSession?.status === 'ended') {
        console.log('exam session has ended');
        callback({
          status: examSession.status,
        });
      } else if (examSession?.status === 'pending') {
        console.log('exam session has not started yet');
        callback({
          status: examSession.status,
        });
      }
    } catch (error) {
      callback({ error });
      console.log(error);
    }
  }
  /** */

  setTutor(socket, callback) {
    const newTutor = new Participant(this.examSessionId, this.io, socket.user);
    this.tutor = newTutor;
    console.log('tutor starts monitoring session');
    callback({ rtpCapabilities: this.router.rtpCapabilities });
  }

  /** */
  async addTransport(isProducer, userId, callback, socket) {
    try {
      const transport = await createWebRtcTransport(this.router);
      if (socket.user.role === 'student') {
        if (isProducer) {
          this.students
            .get(socket.user._id.toString())
            .setProducerTransport(transport);
          this.informTutor(socket);

          this.students
            .get(socket.userId.toString())
            .setBucketKey(
              `${socket.userId}/${this.examSessionId}/vid-${new Date()
                .getTime()
                .toString()}.webm`
            );

          this.students
            .get(socket.userId)
            .setUploadId(
              await AWS.createMultipartUpload(
                process.env.EXAM_RECORD_BUCKET,
                this.students.get(socket.userId).bucketKey
              )
            );
        } else {
          this.students
            .get(socket.user._id.toString())
            .setsConsumerTransport(transport);
        }
      } else if (socket.user.role === 'tutor') {
        if (isProducer) {
          this.tutor.setProducerTransport(transport);
        } else {
          this.tutor.addConsumerTransport(transport, userId);
        }
      }
      callback({
        serverParams: {
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        },
      });
    } catch (error) {
      console.log(error);
      callback({
        serverParams: {
          error,
        },
      });
    }
  }
  /** */

  async connectProducerTransport(dtlsParameters, socket) {
    try {
      if (socket.user.role === 'student') {
        await this.students
          .get(socket.user._id.toString())
          .producerTransport.connect({ dtlsParameters });
      } else if (socket.user.role === 'tutor') {
        await this.tutor.producerTransport.connect({ dtlsParameters });
      }
    } catch (error) {
      console.log('transport failed to connect');
      console.log(error);
    }
  }
  /** */
  async connectConsumerTransport(dtlsParameters, userId, socket) {
    try {
      if (socket.user.role === 'student') {
        await this.students
          .get(socket.user._id.toString())
          .sConsumerTransport.connect({ dtlsParameters });
      } else if (socket.user.role === 'tutor') {
        await this.tutor.consumerTransports
          .get(userId)
          .connect({ dtlsParameters });
      }
    } catch (error) {
      console.log('transport failed to connect');
      console.log(error);
    }
  }

  /** */
  async addProducer({ kind, rtpParameters, appData }, callback, socket) {
    let producer;
    try {
      if (socket.user.role === 'student') {
        const student = this.students.get(socket.user._id.toString());
        producer = await student.producerTransport.produce({
          kind,
          rtpParameters,
          appData,
        });

        student.addProducer(producer);
        this.informTutorOnNewProducer(socket, producer.id);
        this.students.set(socket.user._id.toString(), student);
      } else if (socket.user.role === 'tutor') {
        producer = await this.tutor.producerTransport.produce({
          kind,
          rtpParameters,
          appData,
        });
        this.tutor.addProducer(producer);
      }

      callback({ id: producer.id });
    } catch (error) {
      console.log(error);
      callback({ error });
    }
  }
  /** */
  informTutor(socket) {
    if (this.tutor) {
      this.io.emit('newESStudent', {
        examSessionId: this.examSessionId,
        user: socket.user,
      });
    }
  }

  /** */
  informTutorOnNewProducer(socket, producerId) {
    if (this.tutor) {
      this.io.emit('newESSProducer', {
        examSessionId: this.examSessionId,
        userId: socket.user._id.toString(),
        producerId,
      });
    }
  }

  /** */
  getStudentsProducerTransportIds() {
    const producerTransportIds = {};
    this.students.forEach((student) => {
      const producerIds = [];
      student.producers.forEach((producer) => {
        producerIds.push(producer.id);
      });
      producerTransportIds[student.producerTransport.id] = {
        producerIds,
        user: student.user,
      };
    });
    return producerTransportIds;
  }

  /** */
  async addConsumer({ rtpCapabilities, producerId, userId }, callback, socket) {
    try {
      if (
        this.router.canConsume({
          producerId,
          rtpCapabilities,
        }) &&
        socket.user.role === 'tutor'
      ) {
        const consumer = await this.tutor.consumerTransports
          .get(userId)
          .consume({
            producerId,
            rtpCapabilities,
            paused: true,
          });

        this.tutor.addConsumer(consumer);
        const serverParams = {
          id: consumer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          producerAppData: this.getProducerAppData(producerId),
          userData: this.getStudentData(producerId),
        };
        callback({ serverParams });
      }
    } catch (error) {
      console.log(error);
      callback({ serverParams: { error } });
    }
  }
  /** */
  async resumeConsumer(consumerId, socket) {
    try {
      if (socket.user.role === 'tutor') {
        await this.tutor.consumers.get(consumerId).resume();
      }
    } catch (error) {
      console.log(error);
    }
  }
  /** */
  getProducerAppData(producerId) {
    let producerAppData;
    this.students.forEach((student) => {
      if (student.producers.has(producerId)) {
        producerAppData = student.producers.get(producerId).appData;
      }
    });
    return producerAppData;
  }
  /** */
  getStudentData(producerId) {
    let studentData;
    this.students.forEach((student) => {
      if (student.producers.has(producerId)) {
        studentData = student.producers.get(producerId).user;
      }
    });
    return studentData;
  }
  /** */
  removeConsumer(consumerId, socket) {
    try {
      if (socket.user.role === 'tutor') {
        this.tutor.consumers.get(consumerId).close();
        this.tutor.consumers.delete(consumerId);
      }
    } catch (error) {
      console.log(error);
    }
  }
  /** */
  closeProducer(producerId, socket, callback) {
    console.log(socket.user);
    try {
      if (socket.user.role === 'student') {
        console.log('student closing producer');
        console.log(
          this.students
            .get(socket.user._id.toString())
            .producers.get(producerId).appData
        );
        this.students
          .get(socket.user._id.toString())
          .producers.get(producerId)
          .close();
        this.students
          .get(socket.user._id.toString())
          .producers.delete(producerId);
      } else if (socket.user.role === 'tutor') {
        console.log('tutor closing producer');
        this.tutor.producers.get(producerId).close();
        this.tutor.producers.delete(producerId);
      }

      callback({ producerId });
    } catch (error) {
      console.log(error);
    }
  }

  /** */
  async pauseProducer(producerId, socket) {
    try {
      if (socket.user.role === 'student') {
        await this.students
          .get(socket.user._id.toString())
          .producers.get(producerId)
          .pause();
      } else if (socket.user.role === 'tutor') {
        await this.tutor.producers.get(producerId).pause();
      }
    } catch (error) {
      console.log(error);
    }
  }

  /** */
  removeUser(socket) {
    try {
      if (socket.user.role === 'student') {
        this.removeStudent(socket);
      } else if (socket.user.role === 'tutor') {
        this.removeTutor();
      }
    } catch (error) {
      console.log(error);
    }
  }
  /** */
  async removeStudent(socket) {
    const studentId = socket.user._id.toString();
    try {
      if (this.students.has(studentId)) {
        const student = this.students.get(studentId);
        if (student.producerTransport) {
          student.producerTransport.close();
        }
        if (student.sConsumerTransport) {
          student.sConsumerTransport.close();
          student.sConsumerTransport = null;
        }
        this.removeStudentConsumerTransport(studentId);

        setTimeout(async () => {
          const file = await AWS.completeMultipartUpload(
            process.env.EXAM_RECORD_BUCKET,
            student.bucketKey,
            student.uploadId
          );
          const studentInSession = await StudentExamSession.findById(
            student.sessionId
          );
          if (file) {
            studentInSession.examSessionRecording = {
              name: file.Key,
              bucketName: file.Bucket,
              location: file.Location,
              mimetype: 'video/webm',
              key: file.Key,
            };
            await studentInSession.save();
          }
          this.students.delete(studentId);
          console.log('student removed from exam session');
        }, 300000);
      } else {
        console.log('student not found in exam session');
      }
    } catch (error) {
      console.log(error);
    }
  }
  /** */
  checkExamSessionWindow(socket) {
    let returnStatus = false;
    this.io.emit(
      'ESWopen',
      {
        examSessionId: this.examSessionId,
        userId: socket.userId,
      },
      (isESWopen) => {
        returnStatus = isESWopen;
      }
    );
    return returnStatus;
  }
  /** */
  removeTutor() {
    try {
      if (this.tutor) {
        if (this.tutor.producerTransport) {
          this.tutor.producerTransport.close();
        }
        this.tutor.consumerTransports.forEach((transport) => {
          transport.close();
        });
        this.tutor = null;
        console.log('tutor removed from exam session');
      }
    } catch (error) {
      console.log(error);
    }
  }

  removeStudentConsumerTransport(studentId) {
    try {
      if (this.tutor?.consumerTransports.has(studentId)) {
        this.tutor.consumerTransports.get(studentId).close();
        this.tutor.consumerTransports.delete(studentId);
        console.log('student consumer transport removed from exam session');
        this.io.emit('closeESCT', {
          examSessionId: this.examSessionId,
          userId: studentId,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  /** */
  async reportViolation(violation, socket) {
    try {
      if (this.students.has(socket.userId)) {
        const student = this.students.get(socket.userId);
        const studentInSession = await StudentExamSession.findById(
          student.sessionId
        );
        studentInSession.violations.push(violation);
        await studentInSession.save();
        this.io.emit('ESviolation', {
          examSessionId: this.examSessionId,
          user: socket.user,
          violation,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  /** */
  async updateBrowsingHistory(bHistory, socket) {
    try {
      if (this.students.has(socket.userId)) {
        const student = this.students.get(socket.userId);
        const studentInSession = await StudentExamSession.findById(
          student.sessionId
        );
        studentInSession.browsingHistory.push(bHistory);
        await studentInSession.save();
        this.io.emit('BH', {
          examSessionId: this.examSessionId,
          user: socket.user,
          bHistory,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  /** */
  async uploadChunk(index, chuck, socket) {
    try {
      console.log('uploading chunk');
      await AWS.uploadPart(
        process.env.EXAM_RECORD_BUCKET,
        this.students.get(socket.userId).bucketKey,
        this.students.get(socket.userId).uploadId,
        index,
        chuck
      );
    } catch (error) {
      console.log(error);
    }
  }
}
