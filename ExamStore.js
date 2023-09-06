import { mediaCodecs, createWebRtcTransport } from './mediasoupServer.js';

const examSessions = new Map();
const transports = new Map();
const producers = new Map();
const consumers = new Map();



const handleNewExamSession = async (
  { examSessionId, socket, worker },
  callback
) => {
  let router;
  let participants = new Map(); // Change participants to be a Map
  try {
    if (examSessions.has(examSessionId)) {
      router = examSessions.get(examSessionId).router;
      participants = examSessions.get(examSessionId).participants || new Map();
    } else {
      router = await worker.createRouter({ mediaCodecs });
    }

    // Create a new participant object
    const newParticipant = {
      user: socket.user,
    };

    participants.set(socket.userId, newParticipant);

    examSessions.set(examSessionId, {
      router,
      participants,
    });
    callback({ rtpCapabilities: router.rtpCapabilities });
    console.log(examSessions.get(examSessionId).router.id);
  } catch (error) {
    console.log(error);
    callback({ error: error.message });
  }
};

const handleCreateExamSessionTransport = async (
  examSessionId,
  isProducer,
  callback,
  socket
) => {
  try {
    const router = examSessions.get(examSessionId).router;
    const transport = await createWebRtcTransport(router);
    callback({
      serverParams: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
    });

    transports.set(transport.id, {
      user: socket.user,
      transport,
      isProducer,
    });
    console.log(transports.get(transport.id));
    transports.get(transport.id).transport.on('routerclose', () => {
      console.log('router closed so transport closed');
    });
  } catch (error) {
    console.log(error);
    callback({
      serverParams: {
        error,
      },
    });
  }
};

const handleExamSessionOnProducerConnect = async ({
  dtlsParameters,
  examSessionId,
  producerTransportId,
}) => {
  try {
    if (examSessions.has(examSessionId)) {
      transports.get(producerTransportId).transport.connect({ dtlsParameters });
    }
  } catch (error) {
    console.log('transport failed to connect');
    console.log(error);
  }
};
const handleExamSessionOnProducerProduce = async (
  { examSessionId, kind, rtpParameters, appData, producerTransportId },
  socket,
  callback
) => {
  try {
    if (examSessions.has(examSessionId)) {
      const producer = await transports
        .get(producerTransportId)
        .transport.produce({
          kind,
          rtpParameters,
          appData,
        });

      producers.set(producer.id, {
        user: socket.user,
        producer,
        examSessionId,
      });
      producers.get(producer.id).producer.on('transportclose', () => {
        console.log('transport closed so producer closed');
      });
      producers.get(producer.id).producer.observer.on('pause', () => {
        console.log('producer paused');
      });
      producers.get(producer.id).producer.observer.on('resume', () => {
        console.log('producer resumed');
      });
      producers.get(producer.id).producer.observer.on('close', () => {
        console.log('producer closed');
      });
      callback({ id: producer.id });
    }
  } catch (error) {
    console.log(error);
    callback({ error });
  }
};

const handleCreateExamSessionConsumerTransport = async (
  examSessionId,
  isProducer,
  callback,
  socket
) => {};

export {
  handleNewExamSession,
  handleCreateExamSessionTransport,
  handleExamSessionOnProducerConnect,
  handleExamSessionOnProducerProduce,
};
