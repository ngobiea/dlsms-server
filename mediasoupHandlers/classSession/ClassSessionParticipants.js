export class ClassSessionParticipants {
  constructor(classSessionId, socket) {
    this.socket = socket;
    this.classSessionId = classSessionId;
    this.producerTransport = null;
    this.consumerTransports = new Map();
    this.producers = new Map();
    this.consumers = new Map();
  }

  setProducerTransport(producerTransport) {
    this.producerTransport = producerTransport;
    this.producerTransport.on('routerclose', () => {
      console.log('router closed so transport close');
      this.producerTransport.close();
      this.producerTransport = null;
    });
  }

  addConsumerTransport(userId, consumerTransport) {
    this.consumerTransports.set(userId, consumerTransport);
    this.consumerTransports.get(userId).on('routerclose', () => {
      console.log('router closed so transport closed');
      this.consumerTransports.get(userId).close();
      this.consumerTransports.delete(userId);
    });
  }
  addProducer(producer) {
    console.log('new producer ' + producer.id + ' added');
    this.producers.set(producer.id, producer);

    this.producers.get(producer.id).on('transportclose', () => {
      console.log('transport closed so producer closed');
      this.producers.get(producer.id).close();
      this.producers.delete(producer.id);
    });

    this.producers.get(producer.id).observer.on('pause', () => {
      console.log('producer ' + producer.id + ' paused');
      this.producers.get(producer.id).pause();
    });

    this.producers.get(producer.id).observer.on('resume', () => {
      console.log('producer ' + producer.id + ' resumed');
      this.producers.get(producer.id).resume();
    });

    this.producers.get(producer.id).observer.on('close', () => {
      console.log('producer ' + producer.id + ' closed');
      this.producers.get(producer.id).close();
      this.producers.delete(producer.id);
    });
  }

  addConsumer(consumer) {
    this.consumers.set(consumer.id, consumer);
    this.consumers.get(consumer.id).on('transportclose', () => {
      console.log('consumer transport closed');
      this.consumers.get(consumer.id).close();
      this.consumers.delete(consumer.id);
    });

    this.consumers.get(consumer.id).on('producerpause', () => {
      console.log('associated producer pause so consumer pause');
      this.socket.emit('pauseCSConsumer', {
        classSessionId: this.classSessionId,
        consumerId: consumer.id,
      });
      this.consumers.get(consumer.id).pause();
    });

    this.consumers.get(consumer.id).on('producerresume', () => {
      console.log('associated producer resume so consumer resume');
      this.socket.emit('resumeCSConsumer', {
        classSessionId: this.classSessionId,
        consumerId: consumer.id,
      });
      this.consumers.get(consumer.id).resume();
    });

    this.consumers.get(consumer.id).on('producerclose', () => {
      console.log('associated producer closed so consumer closed');
      this.socket.emit('closeCSConsumer', {
        classSessionId: this.classSessionId,
        consumerId: consumer.id,
      });
      this.consumers.get(consumer.id).close();
      this.consumers.delete(consumer.id);
    });
  }
}
