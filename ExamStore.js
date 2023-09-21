import { mediaCodecs, createWebRtcTransport } from './mediasoupServer.js';
import { getSocketServerInstance } from './serverStore.js';
/**
 * examSessions = {
 *    examSessionId: {
 *        router,
 *        participants: {
 *            userId: {
 *                user
 *            },
 *        },
 *    },
 * }
 */
const examSessions = new Map();
/**
 * transports = {
 *                transportId: {
 *                    user,
 *                    transport,
 *                    isProducer,
 *                    examSessionId,
 *                },
 * }
 */
const transports = new Map();
/**
 * producers = {
 *               producerId: {
 *                  user
 *                  producer,
 *                  examSessionId,
 *             },
 * }
 */
const producers = new Map();
const consumers = new Map();

const handleNewExamSession = async (
  { examSessionId, socket, worker },
  callback
) => {
  let router;
  let participants = new Map();
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
    // console.log(examSessions.get(examSessionId).router.id);
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
        appData: {
          audio: false,
          video: false,
          screen: false,
        },
      },
    });

    transports.set(transport.id, {
      user: socket.user,
      transport,
      isProducer,
      examSessionId,
    });
    // console.log(transports.get(transport.id));
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

      console.log(producer.appData);

      producers.set(producer.id, {
        user: socket.user,
        producer,
        examSessionId,
      });
      // console.log(appData);
      // console.log(
      //   socket.user.firstName + ' is producing ' + kind + ' to ' + examSessionId
      // );
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
      console.log(producer.id);
      callback({ id: producer.id });
    }
  } catch (error) {
    console.log(error);
    callback({ error });
  }
};
const handlePauseProducer = async (
  { examSessionId, producerId, socket },
  cb
) => {
  if (
    producers.has(producerId) &&
    producers.get(producerId).examSessionId === examSessionId
  ) {
    producers.get(producerId).producer.pause();
    console.log('pausing producer: ', producerId);
    cb({ isPaused: true });
  } else {
    cb({ isPaused: false });
  }
};
const handleLeaveExamSession = async ({ examSessionId, socket }) => {};
const handleDisconnect = async ({ socket }) => {};
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
  handlePauseProducer,
  handleLeaveExamSession,
  handleDisconnect,
  handleCreateExamSessionConsumerTransport,
};
