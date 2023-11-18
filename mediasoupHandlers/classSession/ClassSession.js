import { createWebRtcTransport } from '../../mediasoupServer.js';
import { ClassSessionParticipants } from './ClassSessionParticipants.js';
export class ClassSes {
  constructor(router, classSessionId, io) {
    this.router = router;
    this.classSessionId = classSessionId;
    this.io = io;
    this.participants = new Map();
    this.setRouter(router);
  }

  setRouter(router) {
    this.router = router;
    this.router.on('workerclose', () => {
      console.log('router closed so transport closed');
      this.router.close();
    });
    this.router.observer.on('close', () => {
      console.log('router closed');
    });
  }

  addParticipant(socket, callback) {
    try {
      this.participants.set(
        socket.userId,
        new ClassSessionParticipants(this.classSessionId, socket)
      );
      console.log('participant added');
      callback({
        rtpCapabilities: this.router.rtpCapabilities,
        peers: this.getTransportProducers(socket),
      });
    } catch (error) {
      console.log(error);
      callback({ error: 'Fail to get rtpCapabilities' });
    }
  }
  async addTransport(isProducer, callback, socket, userId) {
    try {
      const transport = await createWebRtcTransport(this.router);
      if (isProducer) {
        console.log(socket.userId);
        this.participants.get(socket.userId).setProducerTransport(transport);
        this.informParticipants(socket);
      } else {
        this.participants
          .get(socket.userId)
          .addConsumerTransport(userId, transport);
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
      callback({ error: 'Fail to create transport' });
    }
  }

  async connectProducerTransport(dtlsParameters, socket) {
    try {
      const participant = this.participants.get(socket.userId);
      if (participant?.producerTransport) {
        await this.participants
          .get(socket.userId)
          .producerTransport.connect({ dtlsParameters });
      }
    } catch (error) {
      console.log(error);
    }
  }
  async connectConsumerTransport(dtlsParameters, userId, socket) {
    try {
      const participant = this.participants.get(socket.userId);
      if (participant.consumerTransports.has(userId)) {
        await participant.consumerTransports
          .get(userId)
          .connect({ dtlsParameters });
      }
    } catch (error) {
      console.log(error);
    }
  }
  async addProducer({ kind, rtpParameters, appData }, callback, socket) {
    try {
      const participant = this.participants.get(socket.userId);
      const producer = await participant.producerTransport.produce({
        kind,
        rtpParameters,
        appData,
      });
      participant.addProducer(producer);
      this.informParticipantsOnNewProducer(socket, producer.id);
      callback({ id: producer.id });
    } catch (error) {
      console.log(error);
    }
  }
  async addConsumer({ rtpCapabilities, producerId, userId }, callback, socket) {
    try {
      if (
        this.router.canConsume({
          producerId,
          rtpCapabilities,
        })
      ) {
        console.log('User Id', userId);
        console.log('Socket user Id', socket.userId);
        const participant = this.participants.get(socket.userId);
        const consumerTransport = participant.consumerTransports.get(userId);
        const consumer = await consumerTransport.consume({
          producerId,
          rtpCapabilities,
          paused: true,
        });
        participant.addConsumer(consumer);
        callback({
          serverParams: {
            producerId,
            id: consumer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            producerAppData: this.getProducerAppData(userId, producerId),
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
  getProducerAppData(userId, producerId) {
    try {
      const participant = this.participants.get(userId);
      const producer = participant.producers.get(producerId);
      return producer.appData;
    } catch (error) {
      console.log(error);
      return {};
    }
  }
  async closeProducer(producerId, socket, callback) {
    try {
      const participant = this.participants.get(socket.userId);
      if (participant?.producers.has(producerId)) {
        await participant.producers.get(producerId).close();
        callback({ closed: true });
        return;
      }
      callback({ closed: false });
    } catch (error) {
      callback({ closed: false });
      console.log(error);
    }
  }
  async pauseProducer(producerId, socket, callback) {
    try {
      const participant = this.participants.get(socket.userId);
      if (participant?.producers.has(producerId)) {
        await participant.producers.get(producerId).pause();
        callback({ paused: true });
        return;
      }
      callback({ paused: false });
    } catch (error) {
      callback({ paused: false });
      console.log(error);
    }
  }
  async resumeProducer(producerId, socket, callback) {
    try {
      const participant = this.participants.get(socket.userId);
      if (participant?.producers.has(producerId)) {
        await participant.producers.get(producerId).resume();
        callback({ resumed: true });
        return;
      }
      callback({ resumed: false });
    } catch (error) {
      callback({ resumed: false });
      console.log(error);
    }
  }
  async resumeConsumer(consumerId, socket) {
    try {
      const participant = this.participants.get(socket.userId);
      if (participant?.consumers.has(consumerId)) {
        await participant.consumers.get(consumerId).resume();
      }
    } catch (error) {
      console.log(error);
    }
  }

  getTransportProducers(socket) {
    const producerTransportIds = {};
    this.participants.forEach((participant, key) => {
      const producerIds = [];
      if (key !== socket.userId) {
        participant.producers.forEach((producer) => {
          producerIds.push(producer.id);
        });
        producerTransportIds[participant.producerTransport.id] = {
          producerIds,
          user: participant.socket.user,
        };
      }
    });
    return producerTransportIds;
  }

  informParticipants(socket) {
    this.participants.forEach((participant, key) => {
      if (key !== socket.userId) {
        participant.socket.emit('newCSPeer', {
          classSessionId: this.classSessionId,
          user: socket.user,
        });
      }
    });
  }
  informParticipantsOnNewProducer(socket, producerId) {
    this.participants.forEach((participant, key) => {
      if (key !== socket.userId) {
        participant.socket.emit('newCSProducer', {
          classSessionId: this.classSessionId,
          userId: socket.userId,
          producerId,
        });
      }
    });
  }
  removeParticipant(socket) {
    try {
      const participant = this.participants.get(socket.userId);
      if (participant?.producerTransport) {
        participant.producerTransport.close();
      }
      participant.consumerTransports.forEach((transport) => {
        transport.close();
      });
      this.participants.delete(socket.userId);
      this.informParticipantsOnParticipantLeave(socket);
    } catch (error) {
      console.log(error);
    }
  }
  informParticipantsOnParticipantLeave(socket) {
    try {
      this.participants.forEach((participant) => {
        if (participant.consumerTransports.has(socket.userId)) {
          participant.consumerTransports.get(socket.userId).close();
          participant.consumerTransports.delete(socket.userId);
          participant.socket.emit('closeCSCT', {
            classSessionId: this.classSessionId,
            userId: socket.userId,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
  shareScreen(socket) {
    console.log(`share screen ${socket.userId}`)
    try {
      this.participants.forEach((participant, key) => {
        if (key !== socket.userId) {
          participant.socket.emit('newCSScreen', {
            classSessionId: this.classSessionId,
            userId: socket.userId,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
  stopScreenShare(socket) {
    console.log(`stop screen share ${socket.userId}`)
    try {
      this.participants.forEach((participant, key) => {
        if (key !== socket.userId) {
          participant.socket.emit('closeCSScreen', {
            classSessionId: this.classSessionId,
            userId: socket.userId,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
   }
}
