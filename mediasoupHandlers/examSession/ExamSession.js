import { createWebRtcTransport } from '../../mediasoupServer.js';
import { Participant } from './Participants.js';
export class ExamSession {
  constructor(router, examSessionId) {
    this.setRouter(router);
    this.examSessionId = examSessionId;
    this.students = new Map();
    this.tutor = null;
  }

  /** */
  setRouter(router) {
    this.router = router;
  }

  /** */
  getRouter() {
    return this.router;
  }

  //
  addUser(socket) {
    if (socket.user.role === 'student') {
      this.addStudents(socket);
    } else if (socket.user.role === 'tutor') {
      this.setTutor(socket);
    }
  }
  /** */
  addStudents(socket) {
    const newStudent = new Participant(this.examSessionId, socket);
    this.students.set(socket.user._id.toString(), newStudent);
    console.log('new student added to exam session');
  }
  /** */

  setTutor(socket) {
    const newTutor = new Participant(this.examSessionId, socket);
    this.tutor = newTutor;
    console.log('tutor starts monitoring session');
  }

  /** */
  async addTransport(isProducer, callback, socket) {
    try {
      const transport = await createWebRtcTransport(this.router);
      if (socket.user.role === 'student') {
        if (isProducer) {
          this.students
            .get(socket.user._id.toString())
            .setProducerTransport(transport);
          this.informTutor(socket);
        } else {
          this.students
            .get(socket.user._id.toString())
            .setStudentConsumerTransport(transport);
        }
      } else if (socket.user.role === 'tutor') {
        if (isProducer) {
          this.tutor.setProducerTransport(transport);
        } else {
          this.tutor.addConsumerTransport(transport);
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
  async connectConsumerTransport(dtlsParameters, consumerTransportId, socket) {
    try {
      if (socket.user.role === 'student') {
        await this.students
          .get(socket.user._id.toString())
          .studentConsumerTransport.connect({ dtlsParameters });
      } else if (socket.user.role === 'tutor') {
        await this.tutor.consumerTransports
          .get(consumerTransportId)
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
        userId: socket.user._id.toString(),
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
        user: student.user,
      };
    });
    return producerTransportIds;
  }
  /** */
  async addConsumer(
    { rtpCapabilities, producerId, consumerTransportId },
    callback,
    socket
  ) {
    try {
      if (
        this.router.canConsume({
          producerId,
          rtpCapabilities,
        }) &&
        socket.user.role === 'tutor'
      ) {
        const consumer = await this.tutor.consumerTransports
          .get(consumerTransportId)
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
  async removeConsumer(consumerId, socket) {
    try {
      if (socket.user.role === 'tutor') {
        await this.tutor.consumers.get(consumerId).close();
        this.tutor.consumers.delete(consumerId);
      }
    } catch (error) {
      console.log(error);
    }
  }
  /** */
  async closeProducer(producerId, socket, callback) {
    console.log(socket.user);
    try {
      if (socket.user.role === 'student') {
        console.log('student closing producer');
        await this.students
          .get(socket.user._id.toString())
          .producers.get(producerId)
          .close();
        this.students
          .get(socket.user._id.toString())
          .producers.delete(producerId);
      } else if (socket.user.role === 'tutor') {
        console.log('tutor closing producer');
        await this.tutor.producers.get(producerId).close();
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
  removeStudent(socket) {
    try {
      this.students.get(socket.user._id.toString()).producerTransport.close();

      this.students.delete(socket.user._id.toString());
      console.log('student removed from exam session');
    } catch (error) {
      console.log(error);
    }
  }
  /** */
  async removeTutor() {
    try {
      await this.tutor.producerTransport.close();
      this.tutor.consumerTransports.forEach((transport) => {
        transport.close();
      });
      this.tutor = null;
      console.log('tutor removed from exam session');
    } catch (error) {
      console.log(error);
    }
  }
}
