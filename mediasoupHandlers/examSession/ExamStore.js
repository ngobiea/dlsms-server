import { mediaCodecs } from '../../mediasoupServer.js';
import { ExamSession } from './ExamSession.js';

export class ExamStore {
  constructor() {
    this.io = null;
    this.examSessions = new Map();
  }
  setIO(io) {
    this.io = io;
    console.log('io set');
    this.io.emit('hello', 'world');
  }

  async joinExamSession({ examSessionId }, callback, socket, worker, io) {
    try {
      let router;
      let examSession;
      if (this.examSessions.has(examSessionId)) {
        router = this.examSessions.get(examSessionId).getRouter();
        examSession = this.examSessions.get(examSessionId);
        examSession.addUser(socket);
        this.examSessions.set(examSessionId, examSession);
      } else {
        router = await worker.createRouter({ mediaCodecs });
        examSession = new ExamSession(router, examSessionId);
        examSession.addUser(socket);
        this.examSessions.set(examSessionId, examSession);
      }
      callback({ rtpCapabilities: router.rtpCapabilities });
    } catch (error) {
      console.log(error);
      callback({ error });
    }
  }

  createTransport({ examSessionId, isProducer, userId }, callback, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions
          .get(examSessionId)
          .addTransport(isProducer, userId, callback, socket);
      } else {
        console.log('Exam session does not exist');
      }
    } catch (error) {
      console.log(error);
    }
  }

  connectProducerTransport({ dtlsParameters, examSessionId }, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions
          .get(examSessionId)
          .connectProducerTransport(dtlsParameters, socket);
      }
    } catch (error) {
      console.log(error);
    }
  }

  producerTransportOnProduce(
    { examSessionId, kind, rtpParameters, appData },
    callback,
    socket
  ) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions
          .get(examSessionId)
          .addProducer({ kind, rtpParameters, appData }, callback, socket);
      }
    } catch (error) {
      console.log(error);
      callback({ error });
    }
  }

  connectConsumerTransport({ examSessionId, dtlsParameters, userId }, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions
          .get(examSessionId)
          .connectConsumerTransport(dtlsParameters, userId, socket);
      }
    } catch (error) {
      console.log(error);
    }
  }

  getStudentPTIds({ examSessionId }, callback) {
    try {
      if (this.examSessions.has(examSessionId)) {
        const producerTransportIds = this.examSessions
          .get(examSessionId)
          .getStudentsProducerTransportIds();
        callback({ producerTransportIds });
      }
    } catch (error) {
      console.log(error);
    }
  }

  consumeTransport(
    { examSessionId, rtpCapabilities, producerId, userId },
    callback,
    socket
  ) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions.get(examSessionId).addConsumer(
          {
            rtpCapabilities,
            producerId,
            userId,
          },
          callback,
          socket
        );
      }
    } catch (error) {
      console.log(error);
      callback(error);
    }
  }

  eSConsumeResume({ examSessionId, consumerId }, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions.get(examSessionId).resumeConsumer(consumerId, socket);
      }
    } catch (error) {
      console.log(error);
    }
  }

  closeProducer({ examSessionId, producerId }, callback, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions
          .get(examSessionId)
          .closeProducer(producerId, socket, callback);
      }
    } catch (error) {
      console.log(error);
    }
  }
  pauseProducer({ examSessionId, producerId }, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions.get(examSessionId).pauseProducer(producerId, socket);
      }
    } catch (error) {
      console.log(error);
    }
  }
  leaveExamSession({ examSessionId }, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions.get(examSessionId).removeUser(socket);
      }
    } catch (error) {
      console.log(error);
    }
  }

  disconnectSocket(socket) {
    try {
      this.examSessions.forEach((examSession) => {
        examSession.removeUser(socket);
        // console.log(examSession);
        if (examSession.tutor && examSession.students.size === 0) {
          examSession.getRouter().close();
          this.examSessions.delete(examSession.examSessionId);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  endExamSession({ examSessionId, socket }) {
    if (this.examSessions.has(examSessionId) && socket.user.role === 'tutor') {
      this.examSessions.get(examSessionId).getRouter().close();
      this.examSessions.delete(examSessionId);
    }
  }
}
