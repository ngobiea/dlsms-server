import { mediaCodecs } from '../../mediasoupServer.js';
import { ExamSession } from './ExamSession.js';

export class ExamStore {
  constructor() {
    this.examSessions = new Map();
  }

  async joinExamSession({ examSessionId }, callback, socket, worker) {
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

  async createTransport({ examSessionId, isProducer }, callback, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        await this.examSessions
          .get(examSessionId)
          .addTransport(isProducer, callback, socket);
      } else {
        console.log('Exam session does not exist');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async connectProducerTransport({ dtlsParameters, examSessionId }, socket) {
    try {
      if (this.examSessions.has(examSessionId)) {
        await this.examSessions
          .get(examSessionId)
          .connectProducerTransport(dtlsParameters, socket);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async producerTransportOnProduce(
    { examSessionId, kind, rtpParameters, appData },
    callback,
    socket
  ) {
    try {
      if (this.examSessions.has(examSessionId)) {
        await this.examSessions
          .get(examSessionId)
          .addProducer({ kind, rtpParameters, appData }, callback, socket);
      }
    } catch (error) {
      console.log(error);
      callback({ error });
    }
  }

  async connectConsumerTransport(
    { examSessionId, dtlsParameters, consumerTransportId },
    socket
  ) {
    try {
      if (this.examSessions.has(examSessionId)) {
        await this.examSessions
          .get(examSessionId)
          .connectConsumerTransport(
            dtlsParameters,
            consumerTransportId,
            socket
          );
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getStudentPTIds({ examSessionId }, callback) {
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

  async consumeTransport(
    { examSessionId, rtpCapabilities, producerId, consumerTransportId },
    callback,
    socket
  ) {
    try {
      if (this.examSessions.has(examSessionId)) {
        await this.examSessions.get(examSessionId).addConsumer(
          {
            rtpCapabilities,
            producerId,
            consumerTransportId,
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
        // if (this.examSessions.get(examSessionId).users.size === 0) {
        //   this.examSessions.get(examSessionId).close();
        //   this.examSessions.delete(examSessionId);
        // }
      }
    } catch (error) {
      console.log(error);
    }
  }

  disconnectSocket(socket) {
    try {
      this.examSessions.forEach((examSession) => {
        examSession.removeUser(socket);
        // if (examSession.users.size === 0) {
        //   examSession.close();
        //   this.examSessions.delete(examSession.examSessionId);
        // }
      });
    } catch (error) {
      console.log(error);
    }
  }
}
