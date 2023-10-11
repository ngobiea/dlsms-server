import { mediaCodecs } from '../../mediasoupServer.js';
import { ExamSes } from './ExamSession.js';

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
      if (this.examSessions.has(examSessionId)) {
        this.examSessions.get(examSessionId).addUser(socket, callback);
        console.log('joining existing exam session:', examSessionId);
      } else {
        const router = await worker.createRouter({ mediaCodecs });
        const examSession = new ExamSes(router, examSessionId, io);
        examSession.addUser(socket, callback);
        this.examSessions.set(examSessionId, examSession);
        console.log('joining new exam session:', examSessionId);
      }
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

        if (!examSession.tutor && examSession.students.size === 0) {
          console.log('closing router');
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

  reportViolation({ examSessionId, violation }, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions.get(examSessionId).reportViolation(violation, socket);
      }
    } catch (error) {
      console.log(error);
    }
  }
  focusExamQuestionWindow({ examSessionId }, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions.get(examSessionId).focusExamQuestionWindow(socket);
      }
    } catch (error) {
      console.log(error);
    }
  }

  minimizeExamQuestionWindow({ examSessionId }, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions.get(examSessionId).minimizeExamQuestionWindow(socket);
      }
    } catch (error) {
      console.log(error);
    }
  }

  maximizeExamQuestionWindow({ examSessionId }, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions.get(examSessionId).maximizeExamQuestionWindow(socket);
      }
    } catch (error) {
      console.log(error);
    }
  }

  uploadChunk({ examSessionId, index, chunk }, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions.get(examSessionId).uploadChunk(index, chunk, socket);
      }
    } catch (error) {
      console.log(error);
    }
  }
  updateBrowsingHistory({ examSessionId, bHistory }, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        this.examSessions
          .get(examSessionId)
          .updateBrowsingHistory(bHistory, socket);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
