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
    this.dualTutor = null;
    this.io = io;
    this.ackResponseTimeout = 15000;
  }

  /** */
  setRouter(router) {
    this.router = router;
    this.router.on('workerclose', () => {
      console.log('worker closed so router closed');
      this.router.close();
    });
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
      const newStudent = new Participant(this.examSessionId, socket);
      this.students.set(socket.userId, newStudent);
      console.log('new student added to exam session');
      AWS.createFolderInBucket(
        process.env.EXAM_RECORD_BUCKET,
        `${socket.userId}/${this.examSessionId}`
      );
      callback({
        rtpCapabilities: this.router.rtpCapabilities,
      });
    } catch (error) {
      callback({ error });
      console.log(error);
    }
  }
  /** */

  setTutor(socket, callback) {
    this.tutor = new Participant(this.examSessionId, socket, null);
    console.log('tutor starts monitoring session');
    callback({ rtpCapabilities: this.router.rtpCapabilities });
  }

  /** */
  async addTransport(isProducer, userId, callback, socket) {
    try {
      const transport = await createWebRtcTransport(this.router);
      if (socket.user.role === 'student') {
        if (isProducer) {
          const studentInSession = new StudentExamSession({
            student: socket.userId,
            examSession: this.examSessionId,
          });
          await studentInSession.save();
          const ExamSessionInDB = await ExamSession.findById(this.examSessionId);
          ExamSessionInDB.students.push(studentInSession._id);
          await ExamSessionInDB.save();

          this.students.get(socket.userId).setSessionId(studentInSession._id);
          this.students.get(socket.userId).setProducerTransport(transport);
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
      this.tutor.socket.emit('newESStudent', {
        examSessionId: this.examSessionId,
        user: socket.user,
      });
    }
  }

  /** */
  informTutorOnNewProducer(socket, producerId) {
    if (this.tutor) {
      this.tutor.socket.emit('newESSProducer', {
        examSessionId: this.examSessionId,
        userId: socket.userId,
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
        user: student.socket.user,
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
    const studentId = socket.userId;
    try {
      if (this.students.has(studentId)) {
        const student = this.students.get(studentId);
        student.socket
          .timeout(this.ackResponseTimeout)
          .emit('ESOpen', (error) => {
            if (error) {
              this.finallyRemoveStudent(studentId);
            } else {
              console.log('Exam Session open');
            }
          });
      } else {
        console.log('student not found in exam session');
      }
    } catch (error) {
      console.log(error);
    }
  }
  /** */
  async finallyRemoveStudent(studentId) {
    try {
      const student = this.students.get(studentId);
      if (student.producerTransport) {
        student.producerTransport.close();
      }
      if (student.sConsumerTransport) {
        student.sConsumerTransport.close();
        student.sConsumerTransport = null;
      }
      const file = await AWS.completeMultipartUpload(
        process.env.EXAM_RECORD_BUCKET,
        student.bucketKey,
        student.uploadId
      );
      const studentInSession = await StudentExamSession.findById(
        student.sessionId
      );
      student.endTime = Date.now();
      if (file) {
        studentInSession.examSessionRecording = {
          name: file.Key,
          bucketName: file.Bucket,
          location: file.Location,
          mimetype: 'video/webm',
          key: file.Key,
        };
      }
      await studentInSession.save();
      this.students.delete(studentId);
      console.log('student removed from exam session');
      this.removeStudentConsumerTransport(studentId);
    } catch (error) {}
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
        this.tutor.socket.emit('closeESCT', {
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
        if (this.tutor) {
          this.tutor.socket.emit('ESviolation', {
            examSessionId: this.examSessionId,
            user: socket.user,
            violation,
          });
        }
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
        bHistory.forEach((history) => {
          studentInSession.browsingHistory.push(history);
          if (this.tutor) {
            this.tutor.socket.emit('BH', {
              examSessionId: this.examSessionId,
              user: socket.user,
              history,
            });
          }
        });
        await studentInSession.save();
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
