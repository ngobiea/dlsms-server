export class Participant {
  constructor(examSessionId, socket) {
    this.socket = socket;
    this.examSessionId = examSessionId;
    this.producerTransport = null;
    this.consumerTransports = new Map();
    this.producers = new Map();
    this.consumers = new Map();
    this.bucketKey = null;
    this.uploadId = null;
    this.sessionId = null;
  }
  //
  setBucketKey(bucketKey) {
    this.bucketKey = bucketKey;
  }
  //
  setUploadId(uploadId) {
    this.uploadId = uploadId;
  }
  //
  setSessionId(sessionId) {
    this.sessionId = sessionId;
  }
  //
  setProducerTransport(transport) {
    this.producerTransport = transport;
    this.producerTransport.on('routerclose', () => {
      console.log('router closed so transport close');
      this.producerTransport.close();
    });
  }

  addConsumerTransport(transport, userId) {
    this.consumerTransports.set(userId, transport);
    console.log('tutor added consumer transport');
    this.consumerTransports.get(userId).on('routerclose', () => {
      console.log('router closed so transport closed');

      this.consumerTransports.get(userId).close();
    });
    this.consumerTransports.get(userId).observer.on('close', () => {
      console.log('consumer transport closed');
    });
  }

  addProducer(producer) {
    this.producers.set(producer.id, producer);
    this.producers.get(producer.id).on('transportclose', () => {
      console.log('transport closed so producer closed');
      this.producers.get(producer.id).close();
      this.producers.delete(producer.id);
    });

    this.producers.get(producer.id).observer.on('pause', () => {
      console.log('producer paused');
      this.producers.get(producer.id).pause();
    });
    this.producers.get(producer.id).observer.on('resume', () => {
      console.log('producer resumed');
      this.producers.get(producer.id).resume();
    });
    this.producers.get(producer.id).observer.on('close', () => {
      console.log('producer closed');
    });
  }

  addConsumer(consumer) {
    this.consumers.set(consumer.id, consumer);
    this.consumers.get(consumer.id).on('transportclose', () => {
      console.log('transport closed so consumer closed');
      this.consumers.get(consumer.id).close();
      this.consumers.delete(consumer.id);
    });

    this.consumers.get(consumer.id).on('producerclose', () => {
      console.log('associated producer closed so consumer closed');
      this.socket.emit('closeESConsumer', {
        examSessionId: this.examSessionId,
        consumerId: consumer.id,
      });
      this.consumers.get(consumer.id).close();
      this.consumers.delete(consumer.id);
    });

    this.consumers.get(consumer.id).on('producerpause', () => {
      console.log('associated producer pause so consumer pause');
      this.socket.emit('pauseESConsumer', {
        examSessionId: this.examSessionId,
        consumerId: consumer.id,
      });
      this.consumers.get(consumer.id).pause();
    });

    this.consumers.get(consumer.id).on('producerresume', () => {
      console.log('associated producer resume so consumer resume');
      this.socket.emit('resumeESConsumer', {
        examSessionId: this.examSessionId,
        consumerId: consumer.id,
      });
    });
  }
}
