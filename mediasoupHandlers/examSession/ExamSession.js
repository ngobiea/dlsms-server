import { createWebRtcTransport } from '../../mediasoupServer.js';
import ExamSession from '../../model/ExamSession.js';
import StudentExamSession from '../../model/StudentExamSession.js';
import { Participant } from './Participants.js';
import { AWS } from '../../util/aws/AWS.js';
export class ExamSes {
  constructor(router, examSessionId, io) {
    this.router = router;
    this.examSessionId = examSessionId;
    this.students = new Map();
    this.tutor = null;
    this.tutor2 = null;
    this.dualTutor = null;
    this.io = io;
    this.ackResponseTimeout = 15000;
    this.setRouter(router);
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
  addStudents(socket, callback) {
    try {
      const newStudent = new Participant(this.examSessionId, socket);
      this.students.set(socket.userId, newStudent);
      console.log('new student added to exam session');
      // AWS.createFolderInBucket(
      //   process.env.EXAM_RECORD_BUCKET,
      //   `${socket.userId}/${this.examSessionId}`
      // );
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
    this.tutor = new Participant(this.examSessionId, socket);
    console.log('tutor starts monitoring session');
    callback({ rtpCapabilities: this.router.rtpCapabilities });
  }

  /** */
  async addTransport(userId, callback, socket) {
    try {
      const transport = await createWebRtcTransport(this.router);
      if (socket.user.role === 'student') {
        this.students.get(socket.userId).setProducerTransport(transport);
        this.informTutor(socket);
        this.students
          .get(socket.userId.toString())
          .setBucketKey(
            `${socket.userId}/${this.examSessionId}/vid-${new Date()
              .getTime()
              .toString()}.webm`
          );
      } else if (socket.user.role === 'tutor') {
        this.tutor.addConsumerTransport(transport, userId);
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

  async informStudent(isProducer, studentId, callback, socket) {
    try {
      const transport = await createWebRtcTransport(this.router);
      if (isProducer) {
        this.tutor2.setProducerTransport(transport);
      } else {
        this.tutor2.addConsumerTransport(transport, studentId);
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
  // async addStudentToDB(examSessionId, socket, callback) {
  //   try {
  //     const producerTransport = this.students.get(
  //       socket.userId
  //     ).producerTransport;
  //     if (!producerTransport) {
  //       callback({ error: 'producer transport not found' });
  //       return;
  //     }
  //     const studentInSession = await StudentExamSession.findOne({
  //       student: socket.userId,
  //       examSession: examSessionId,
  //     });
  //     console.log(studentInSession);
  //     if (studentInSession) {
  //       callback({ error: 'Session Already Ended' });
  //       return;
  //     }
  //     const newStudentInSession = new StudentExamSession({
  //       student: socket.userId,
  //       examSession: examSessionId,
  //     });
  //     await newStudentInSession.save();
  //     const ExamSessionInDB = await ExamSession.findById(examSessionId);
  //     if (ExamSessionInDB?.status === 'ended') {
  //       callback({ error: 'Exam Session Ended' });
  //       return;
  //     }
  //     ExamSessionInDB.students.push(newStudentInSession._id);
  //     await ExamSessionInDB.save();
  //     this.students.get(socket.userId).setSessionId(newStudentInSession._id);
  //     // this.students
  //     //   .get(socket.userId)
  //     //   .setUploadId(
  //     //     await AWS.createMultipartUpload(
  //     //       process.env.EXAM_RECORD_BUCKET,
  //     //       this.students.get(socket.userId).bucketKey
  //     //     )
  //     //   );
  //     callback({ success: true });
  //   } catch (error) {
  //     callback({ error: 'Error adding student to exam session' });
  //     console.log(error);
  //   }
  // }

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
      const student = this.students.get(socket.user._id.toString());
      producer = await student.producerTransport.produce({
        kind,
        rtpParameters,
        appData,
      });
      student.addProducer(producer);
      this.informTutorOnNewProducer(socket, producer.id);
      this.students.set(socket.user._id.toString(), student);
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
    if (this.tutor2) {
      this.tutor2.socket.emit('oneProducer', {
        examSessionId: this.examSessionId,
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
          producerAppData: this.getProducerAppData(userId, producerId),
          userData: this.getStudentData(userId),
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
  getProducerAppData(userId, producerId) {
    try {
      return this.students.get(userId).producers.get(producerId).appData;
    } catch (error) {
      console.log(error);
      return {};
    }
  }
  /** */
  getStudentData(userId) {
    try {
      return this.students.get(userId).socket.user;
    } catch (error) {
      console.log(error);
      return {};
    }
  }
  /** */
  closeProducer(producerId, socket, callback) {
    console.log(socket.user);
    try {
      if (socket.user.role === 'student') {
        console.log('student closing producer');
        this.students
          .get(socket.user._id.toString())
          .producers.get(producerId)
          .close();
        this.students
          .get(socket.user._id.toString())
          .producers.delete(producerId);
        callback({ closed: true });
      } else if (socket.user.role === 'tutor') {
        console.log('tutor closing producer');
        this.tutor2.producers.get(producerId).close();
        this.tutor2.producers.delete(producerId);
        callback({ closed: true });
      }
    } catch (error) {
      console.log(error);
      callback({ closed: false });
    }
  }

  /** */
  async pauseProducer(producerId, socket, callback) {
    try {
      if (socket.user.role === 'student') {
        await this.students
          .get(socket.user._id.toString())
          .producers.get(producerId)
          .pause();
        callback({ paused: true });
        return;
      } else if (socket.user.role === 'tutor') {
        await this.tutor2.producers.get(producerId).pause();
      }
    } catch (error) {
      console.log(error);
    }
  }

  /** */
  async resumeProducer(producerId, socket, callback) {
    try {
      if (socket.user.role === 'student') {
        await this.students
          .get(socket.userId)
          .producers.get(producerId)
          .resume();
        callback({ resumed: true });
      } else if (socket.user.role === 'tutor') {
        await this.tutor2.producers.get(producerId).resume();
        callback({ resumed: true });
      }
    } catch (error) {
      callback({ resumed: false });
      console.log(error);
    }
  }

  /** */
  removeUser(socket) {
    try {
      if (socket.user.role === 'student') {
        this.removeStudent(socket);
      } else if (socket.user.role === 'tutor') {
        this.removeTutor(socket);
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
      const uploadId = student.uploadId;
      if (student.producerTransport) {
        student.producerTransport.close();
      }
      if (student.sConsumerTransport) {
        student.sConsumerTransport.close();
        student.sConsumerTransport = null;
      }
      if (!uploadId) {
        console.log('upload id not found');
        // return;
      }
      // const file = await AWS.completeMultipartUpload(
      //   process.env.EXAM_RECORD_BUCKET,
      //   student.bucketKey,
      //   student.uploadId
      // );
      // const studentInSession = await StudentExamSession.findById(
      //   student.sessionId
      // );
      // student.endTime = Date.now();
      // if (file) {
      //   studentInSession.examSessionRecording = {
      //     name: file.Key,
      //     bucketName: file.Bucket,
      //     location: file.Location,
      //     mimetype: 'video/webm',
      //     key: file.Key,
      //   };
      // }
      // await studentInSession.save();
      this.students.delete(studentId);
      console.log('student removed from exam session');
      this.removeStudentConsumerTransport(studentId);
    } catch (error) {}
  }
  /** */
  removeTutor(socket) {
    try {
      if (this.tutor2) {
        this.tutor2.producerTransport.close();
        this.tutor2.consumerTransports.forEach((transport, key) => {
          this.informStudentsOnTutorLeave(transport, key, socket);
        });
        this.tutor2 = null;
      } else if (this.tutor) {
        this.tutor.socket
          .timeout(this.ackResponseTimeout)
          .emit('ESOpen', (error) => {
            if (error) {
              this.tutor.consumerTransports.forEach((transport) => {
                transport.close();
              });
            } else {
              console.log('Exam Session open');
            }
          });
        console.log('tutor not found in exam session');
      }
    } catch (error) {
      console.log(error);
    }
  }
  informStudentsOnTutorLeave(transport, userId, socket) {
    try {
      transport.close();
      this.students.get(userId).socket.emit('closeESCT', {
        examSessionId: this.examSessionId,
        userId: socket.userId,
      });
    } catch (error) {
      console.log(error);
    }
  }
  endStudentSession(examSessionId, studentId) {
    const student = this.students.get(studentId);
    if (student) {
      student.socket.emit('endExamSession', { examSessionId, studentId });
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
        // const studentInSession = await StudentExamSession.findById(
        //   student.sessionId
        // );
        // studentInSession.violations.push(violation);
        // await studentInSession.save();
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
        // const studentInSession = await StudentExamSession.findById(
        //   student.sessionId
        // );
        bHistory.forEach((history) => {
          // studentInSession.browsingHistory.push(history);
          if (this.tutor) {
            this.tutor.socket.emit('BH', {
              examSessionId: this.examSessionId,
              user: socket.user,
              history,
            });
          }
        });
        // await studentInSession.save();
      }
    } catch (error) {
      console.log(error);
    }
  }

  /** */
  async uploadChunk(index, chuck, socket) {
    try {
      console.log('uploading chunk');
      const uploadId = this.students.get(socket.userId).uploadId;
      if (!uploadId) {
        console.log('upload id not found');
        return;
      }
      // await AWS.uploadPart(
      //   process.env.EXAM_RECORD_BUCKET,
      //   this.students.get(socket.userId).bucketKey,
      //   this.students.get(socket.userId).uploadId,
      //   index,
      //   chuck
      // );
    } catch (error) {
      console.log(error);
    }
  }
  /** */
  setTutor2(studentId, callback, socket) {
    this.tutor2 = new Participant(this.examSessionId, socket);
    console.log('tutor joining student session');
    callback({
      rtpCapabilities: this.router.rtpCapabilities,
      student: this.getStudentProducerTransportIds(studentId),
    });
  }
  /** */
  getStudentProducerTransportIds(studentId) {
    const producerTransportIds = {};
    if (this.students.has(studentId)) {
      const producerIds = [];
      this.students.get(studentId).producers.forEach((producer) => {
        producerIds.push(producer.id);
      });
      producerTransportIds[this.students.get(studentId).producerTransport.id] =
        {
          producerIds,
          student: this.students.get(studentId).socket.user,
        };
      return producerTransportIds;
    } else {
      return {};
    }
  }
  /** */
  async addOneToOneTP(isProducer, callback, socket, userId) {
    try {
      const transport = await createWebRtcTransport(this.router);
      if (socket.user.role === 'tutor') {
        if (isProducer) {
          this.tutor2.setProducerTransport(transport);
          this.informOneStudent(socket.user, userId);
        } else {
          this.tutor2.addConsumerTransport(transport, userId);
        }
      } else if (socket.user.role === 'student') {
        this.students
          .get(socket.user._id.toString())
          .addConsumerTransport(transport, userId);
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
      callback({ serverParams: { error: 'Fail to create transport' } });
    }
  }

  informOneStudent(tutor, userId) {
    if (this.students.has(userId)) {
      this.students.get(userId).socket.emit('tutor', {
        examSessionId: this.examSessionId,
        user: tutor,
      });
    }
  }
  async connectOneToOnePT(dtlsParameters) {
    try {
      if (this.tutor2?.producerTransport) {
        await this.tutor2.producerTransport.connect({ dtlsParameters });
      }
    } catch (error) {
      console.log(error);
    }
  }
  async addOneToOneProducer(
    { kind, rtpParameters, appData, userId },
    callback
  ) {
    try {
      const producer = await this.tutor2.producerTransport.produce({
        kind,
        rtpParameters,
        appData,
      });
      this.tutor2.addProducer(producer);
      this.informOneStudentOnProducer(producer.id, userId);
      callback({ id: producer.id });
    } catch (error) {
      console.log(error);
    }
  }
  informOneStudentOnProducer(producerId, userId) {
    if (this.students.has(userId)) {
      this.students.get(userId).socket.emit('tutorProducer', {
        examSessionId: this.examSessionId,
        producerId,
      });
    }
  }
  async connectOneToOneCT(dtlsParameters, userId, socket) {
    try {
      if (socket.user.role === 'student') {
        await this.students
          .get(socket.userId)
          .consumerTransports.get(userId)
          .connect({ dtlsParameters });
      } else if (socket.user.role === 'tutor') {
        await this.tutor2.consumerTransports
          .get(userId)
          .connect({ dtlsParameters });
      }
    } catch (error) {
      console.log(error);
    }
  }
  async addOneToOneConsumer(
    { rtpCapabilities, producerId, userId },
    callback,
    socket
  ) {
    const serverParams = {};
    try {
      if (this.router.canConsume({ producerId, rtpCapabilities })) {
        if (socket.user.role === 'tutor') {
          const consumer = await this.tutor2.consumerTransports
            .get(userId)
            .consume({
              producerId,
              rtpCapabilities,
              paused: true,
            });
          this.tutor2.addConsumer(consumer);
          serverParams.id = consumer.id;
          serverParams.kind = consumer.kind;
          serverParams.rtpParameters = consumer.rtpParameters;
          serverParams.producerAppData = this.getProducerAppData(
            userId,
            producerId
          );
          serverParams.userData = this.getStudentData(userId);
        } else if (socket.user.role === 'student') {
          const consumer = await this.students
            .get(socket.userId)
            .consumerTransports.get(userId)
            .consume({
              producerId,
              rtpCapabilities,
              paused: true,
            });
          this.students.get(socket.user._id.toString()).addConsumer(consumer);
          serverParams.id = consumer.id;
          serverParams.kind = consumer.kind;
          serverParams.rtpParameters = consumer.rtpParameters;
          serverParams.producerAppData =
            this.tutor2.producers.get(producerId).appData;
          serverParams.userData = this.tutor2.socket.user;
        }
        callback({ serverParams });
      } else {
        callback({ serverParams: { error: 'cannot consume' } });
      }
    } catch (error) {
      console.log(error);
      callback({ serverParams: { error } });
    }
  }
  async resumeOneToOneConsumer(consumerId, socket) {
    try {
      if (socket.user.role === 'tutor') {
        await this.tutor2.consumers.get(consumerId).resume();
      } else if (socket.user.role === 'student') {
        await this.students
          .get(socket.userId)
          .consumers.get(consumerId)
          .resume();
      }
    } catch (error) {
      console.log(error);
    }
  }
}
