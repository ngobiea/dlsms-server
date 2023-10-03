export class Participant {
  constructor(examSessionId, socket) {
    this.socket = socket;
    this.user = socket.user;
    this.examSessionId = examSessionId;
    this.producerTransport = null;
    this.studentConsumerTransport = null;
    this.consumerTransports = new Map();
    this.producers = new Map();
    this.consumers = new Map();
  }
  setProducerTransport(transport) {
    this.producerTransport = transport;
    this.producerTransport.on('routerclose', () => {
      console.log('router closed so transport closed');
    });
  }

  setStudentConsumerTransport(transport) {
    this.studentConsumerTransport = transport;
    console.log('student added consumer transport');
    this.studentConsumerTransport.on('routerclose', () => {
      console.log('router closed so transport closed');
    });
  }

  addConsumerTransport(transport) {
    this.consumerTransports.set(transport.id, transport);
    console.log('tutor added consumer transport');
    this.consumerTransports.get(transport.id).on('routerclose', () => {
      console.log('router closed so transport closed');
    });
    // if (this.user.role === 'student') {
    //   this.socket.emit('newStudent', {});
    // }
  }

  addProducer(producer) {
    this.producers.set(producer.id, producer);
    this.producers.get(producer.id).on('transportclose', () => {
      console.log('transport closed so producer closed');
    });

    this.producers.get(producer.id).observer.on('pause', () => {
      console.log('producer paused');
    });
    this.producers.get(producer.id).observer.on('resume', () => {
      console.log('producer resumed');
    });
    this.producers.get(producer.id).observer.on('close', () => {
      console.log('producer closed');
    });
  }

  addConsumer(consumer) {
    this.consumers.set(consumer.id, consumer);
    this.consumers.get(consumer.id).on('transportclose', () => {
      console.log('transport closed so consumer closed');
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
    });

    this.consumers.get(consumer.id).on('producerresume', () => {
      console.log('associated producer resume so consumer resume');
    });

    this.consumers.get(consumer.id).on('score', () => {
      console.log('associated producer closed so consumer closed');
    });

    this.consumers.get(consumer.id).on('layerschange', () => {
      console.log('consumer paused');
    });
  }
}
