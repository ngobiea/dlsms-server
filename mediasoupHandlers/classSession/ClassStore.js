<<<<<<< HEAD
import { mediaCodecs } from '../../mediasoupServer.js';
import { ClassSes } from './ClassSession.js';
import ClassSession from '../../model/ClassSession.js';

export class ClassStore {
  constructor() {
    this.classSessions = new Map();
    this.io = null;
  }
  setIO(io) {
    this.io = io;
  }
  async getClassStatus({ classSessionId }, callback) {
    try {
      const classSession = await ClassSession.findById(classSessionId);
      if (classSession) {
        callback({ status: classSession.status });
      } else {
        callback({ error: 'invalid' });
      }
    } catch (error) {
      callback({ error: 'invalid' });
      console.log(error);
    }
  }
  async joinClassSession({ classSessionId }, callback, socket, worker, io) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).addParticipant(socket, callback);
        console.log('joining existing class session:', classSessionId);
      } else {
        const router = await worker.createRouter({ mediaCodecs });
        const classSession = new ClassSes(router, classSessionId, io);
        classSession.addParticipant(socket, callback);
        this.classSessions.set(classSessionId, classSession);
        console.log('joining new class session:', classSessionId);
      }
    } catch (error) {
      console.log(error);
      callback({ error });
    }
  }

  async addStudentToDB({ classSessionId }, callback, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).addStudentToDB(callback, socket);
      } else {
        console.log('classSession not found ATS');
      }
    } catch (error) {
      console.log(error);
    }
  }
  createTransport({ classSessionId, isProducer, userId }, callback, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .addTransport(isProducer, callback, socket, userId);
      } else {
        callback({ error: 'classSession not found CT' });
      }
    } catch (error) {
      console.log(error);
      callback({ error });
    }
  }
  connectProducerTransport({ classSessionId, dtlsParameters }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .connectProducerTransport(dtlsParameters, socket);
      } else {
        console.log('classSession not found CPT');
      }
    } catch (error) {
      console.log(error);
    }
  }
  connectConsumerTransport({ classSessionId, dtlsParameters, userId }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .connectConsumerTransport(dtlsParameters, userId, socket);
      } else {
        console.log('classSession not found CCT');
      }
    } catch (error) {
      console.log(error);
    }
  }
  producerTransportOnProduce(
    { classSessionId, kind, rtpParameters, appData },
    callback,
    socket
  ) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .addProducer({ kind, rtpParameters, appData }, callback, socket);
      } else {
        console.log('classSession not found PTP');
      }
    } catch (error) {
      console.log(error);
    }
  }
  consumerTransportOnConsume(
    { classSessionId, rtpCapabilities, producerId, userId },
    callback,
    socket
  ) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .addConsumer(
            { rtpCapabilities, producerId, userId },
            callback,
            socket
          );
      } else {
        console.log('classSession not found CTC');
      }
    } catch (error) {
      console.log(error);
    }
  }
  resumeConsumer({ classSessionId, consumerId }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .resumeConsumer(consumerId, socket);
      } else {
        console.log('classSession not found RC');
      }
    } catch (error) {
      console.log(error);
    }
  }
  closeProducer({ classSessionId, producerId }, callback, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .closeProducer(producerId, socket, callback);
      } else {
        console.log('classSession not found CP');
      }
    } catch (error) {
      console.log(error);
    }
  }
  pauseProducer({ classSessionId, producerId }, callback, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .pauseProducer(producerId, socket, callback);
      } else {
        console.log('classSession not found PP');
      }
    } catch (error) {
      console.log(error);
    }
  }
  resumeProducer({ classSessionId, producerId }, callback, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .resumeProducer(producerId, socket, callback);
      } else {
        console.log('classSession not found RP');
      }
    } catch (error) {
      console.log(error);
    }
  }
  shareScreen({ classSessionId }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).shareScreen(socket);
      } else {
        console.log('classSession not found SS');
      }
    } catch (error) {
      console.log(error);
    }
  }
  stopScreenShare({ classSessionId }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).stopScreenShare(socket);
      } else {
        console.log('classSession not found SSS');
      }
    } catch (error) {
      console.log(error);
    }
  }
  verify({ classSessionId, verify }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).verify(verify, socket);
      } else {
        console.log('classSession not found V');
      }
    } catch (error) {
      console.log(error);
    }
  }
  record({ classSessionId, state }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).record(state, socket);
      } else {
        console.log('classSession not found R');
      }
    } catch (error) {
      console.log(error);
    }
  }
  endClassSession({ classSessionId }, callback, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .endClassSession(callback, socket);
      } else {
        console.log('classSession not found ECS');
      }
    } catch (error) {
      console.log(error);
    }
  }
  leaveClassSession({ classSessionId }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).removeParticipant(socket);
      } else {
        console.log('classSession not found LCS');
      }
    } catch (error) {
      console.log(error);
    }
  }
  disconnectSocket(socket) {
    try {
      this.classSessions.forEach((classSession) => {
        classSession.removeParticipant(socket);
        if (classSession.participants.size === 0) {
          classSession.router.close();
          this.classSessions.delete(classSession.classSessionId);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}
=======
import { mediaCodecs } from '../../mediasoupServer.js';
import { ClassSes } from './ClassSession.js';
import ClassSession from '../../model/ClassSession.js';

export class ClassStore {
  constructor() {
    this.classSessions = new Map();
    this.io = null;
  }
  setIO(io) {
    this.io = io;
  }
 async getClassStatus({ classSessionId }, callback) {
    try {
      const classSession = await ClassSession.findById(classSessionId);
      if (classSession) {
        callback({ status: classSession.status });
      } else {
        callback({ error: 'invalid' });
      }
    } catch (error) {
      callback({ error: 'invalid' });
      console.log(error);
    }
  }
  async joinClassSession({ classSessionId }, callback, socket, worker, io) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).addParticipant(socket, callback);
        console.log('joining existing class session:', classSessionId);
      } else {
        const router = await worker.createRouter({ mediaCodecs });
        const classSession = new ClassSes(router, classSessionId, io);
        classSession.addParticipant(socket, callback);
        this.classSessions.set(classSessionId, classSession);
        console.log('joining new class session:', classSessionId);
      }
    } catch (error) {
      console.log(error);
      callback({ error });
    }
  }

  async addStudentToDB({ classSessionId }, callback, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).addStudentToDB(callback, socket);
      } else {
        console.log('classSession not found ATS');
      }
    } catch (error) {
      console.log(error);
    }
  }
  createTransport({ classSessionId, isProducer, userId }, callback, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .addTransport(isProducer, callback, socket, userId);
      } else {
        callback({ error: 'classSession not found CT' });
      }
    } catch (error) {
      console.log(error);
      callback({ error });
    }
  }
  connectProducerTransport({ classSessionId, dtlsParameters }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .connectProducerTransport(dtlsParameters, socket);
      } else {
        console.log('classSession not found CPT');
      }
    } catch (error) {
      console.log(error);
    }
  }
  connectConsumerTransport({ classSessionId, dtlsParameters, userId }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .connectConsumerTransport(dtlsParameters, userId, socket);
      } else {
        console.log('classSession not found CCT');
      }
    } catch (error) {
      console.log(error);
    }
  }
  producerTransportOnProduce(
    { classSessionId, kind, rtpParameters, appData },
    callback,
    socket
  ) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .addProducer({ kind, rtpParameters, appData }, callback, socket);
      } else {
        console.log('classSession not found PTP');
      }
    } catch (error) {
      console.log(error);
    }
  }
  consumerTransportOnConsume(
    { classSessionId, rtpCapabilities, producerId, userId },
    callback,
    socket
  ) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .addConsumer(
            { rtpCapabilities, producerId, userId },
            callback,
            socket
          );
      } else {
        console.log('classSession not found CTC');
      }
    } catch (error) {
      console.log(error);
    }
  }
  resumeConsumer({ classSessionId, consumerId }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .resumeConsumer(consumerId, socket);
      } else {
        console.log('classSession not found RC');
      }
    } catch (error) {
      console.log(error);
    }
  }
  closeProducer({ classSessionId, producerId }, callback, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .closeProducer(producerId, socket, callback);
      } else {
        console.log('classSession not found CP');
      }
    } catch (error) {
      console.log(error);
    }
  }
  pauseProducer({ classSessionId, producerId }, callback, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .pauseProducer(producerId, socket, callback);
      } else {
        console.log('classSession not found PP');
      }
    } catch (error) {
      console.log(error);
    }
  }
  resumeProducer({ classSessionId, producerId }, callback, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .resumeProducer(producerId, socket, callback);
      } else {
        console.log('classSession not found RP');
      }
    } catch (error) {
      console.log(error);
    }
  }
  leaveClassSession({ classSessionId }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).removeParticipant(socket);
      } else {
        console.log('classSession not found LCS');
      }
    } catch (error) {
      console.log(error);
    }
  }
  disconnectSocket(socket) {
    try {
      this.classSessions.forEach((classSession) => {
        classSession.removeParticipant(socket);
        if (classSession.participants.size === 0) {
          classSession.router.close();
          this.classSessions.delete(classSession.classSessionId);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
  shareScreen({ classSessionId }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).shareScreen(socket);
      } else {
        console.log('classSession not found SS');
      }
    } catch (error) {
      console.log(error);
    }
  }
  stopScreenShare({ classSessionId }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).stopScreenShare(socket);
      } else {
        console.log('classSession not found SSS');
      }
    } catch (error) {
      console.log(error);
    }
  }
  verify({ classSessionId, verify }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).verify(verify, socket);
      } else {
        console.log('classSession not found V');
      }
    } catch (error) {
      console.log(error);
    }
  }
  record({ classSessionId, state }, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions.get(classSessionId).record(state, socket);
      } else {
        console.log('classSession not found R');
      }
    } catch (error) {
      console.log(error);
    }
  }
  endClassSession({ classSessionId }, callback, socket) {
    try {
      if (this.classSessions.has(classSessionId)) {
        this.classSessions
          .get(classSessionId)
          .endClassSession(callback, socket);
      } else {
        console.log('classSession not found ECS');
      }
    } catch (error) {
      console.log(error);
    }
  }
}
>>>>>>> e23f8c2e82f3ef458a99065a0f7e8b9e0a7ccfd0
