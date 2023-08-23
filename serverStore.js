import { mediaCodecs, createWebRtcTransport } from './mediasoupServer';
const connectedUsers = new Map();

let io = null;
let rooms = {};
let classSessions = {};
let participants = {};
let transports = [];
let producers = [];
let consumers = [];

const setSocketServerInstance = (ioInstance) => {
  io = ioInstance;
};

const getSocketServerInstance = () => {
  return io;
};

const addNewConnectedUser = ({ socketId, userId }) => {
  connectedUsers.set(socketId, { userId });
  // console.log('new connected users');
  // console.log(connectedUsers);
};

const removeConnectedUser = (socketId) => {
  if (connectedUsers.has(socketId)) {
    connectedUsers.delete(socketId);
    console.log('new connected users');
    console.log(connectedUsers);
  }
};

const getActiveConnections = (userId) => {
  const activeConnections = [];

  connectedUsers.forEach(function (value, key) {
    if (value.userId === userId) {
      activeConnections.push(key);
    }
  });

  return activeConnections;
};

const getOnlineUsers = () => {
  const onlineUsers = [];

  connectedUsers.forEach((value, key) => {
    onlineUsers.push({ socketId: key, userId: value.userId });
  });

  return onlineUsers;
};

const addNewClassSession = async (sessionId, userId, worker) => {
  let router;

  let people = [];
  if (classSessions[sessionId]) {
    router = classSessions[sessionId].router;
    people = classSessions[sessionId].participants || [];
  } else {
    router = await worker.createRouter({ mediaCodecs });
  }
  console.log(`Router Id: ${router.id}`);
  console.log(`No of participants: ${people.length}`);
  classSessions[sessionId] = {
    router,
    participants: [...people, userId],
  };
  return router;
};
const addNewParticipantsToRoom = (socket, userId, sessionId) => {
  participants[userId] = {
    socket,
    sessionId,
    transports: [],
    producers: [],
    consumers: [],
  };
};

const handleCreateWebRtcTransport = async ({ consumer }, callback, socket) => {
  const sessionId = participants[socket.userId].sessionId;
  const router = classSessions[sessionId].router;
  createWebRtcTransport(router)
    .then((transport) => {
      callback({
        serverParams: {
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        },
      });
      addTransport(transport, sessionId, consumer);
    })
    .catch((error) => {
      console.log(error);
    });
};

const handleGetProducers = (callback, socket) => {
  const sessionId = participants[socket.userId];

  let producersList = [];
  producers.forEach((producerData) => {
    if (
      producerData.userId !== socket.userId &&
      producerData.sessionId === sessionId
    ) {
      producersList = [...producersList, producerData.producer.id];
    }
  });

  callback({ producersList });
};
const addTransport = (transport, sessionId, consumer, socket) => {
  transports = [
    ...transports,
    { userId: socket.userId, transport, sessionId, consumer },
  ];
  participants[socket.userId] = {
    ...participants[socket.userId],
    transports: [...participants[socket.userId], transport.id],
  };
};
const addProducer = (producer, sessionId, socket) => {
  producers = [...producers, { userId: socket.userId, producer, sessionId }];
  participants[socket.userId] = {
    ...participants[socket.userId],
    producers: [...participants[socket.userId], producer.id],
  };
};
const addConsumer = (consumer, sessionId, socket) => {
  consumers = [...consumers, { userId: socket.userId, consumer, sessionId }];
  participants[socket.userId] = {
    ...participants[socket.userId],
    consumers: [...participants[socket.userId], consumer.id],
  };
};
const informConsumers = (sessionId, userId, id) => {
  console.log(`just joined id:${id} to session:${sessionId} as ${userId}`);
  producers.forEach((producerData) => {
    if (producerData.sessionId == sessionId && producerData.userId !== userId) {
      const producerSocket = participants[producerData.userId].socket;
      producerSocket.emit('new-producer', { producerId: id });
    }
  });
};
const getTransport = (userId) => {
  const [producerTransport] = transports.filter(
    (transport) => transport.userId === userId && !transport.consumer
  );
  return producerTransport.transport;
};
const handleTransportProduct = async (producer, socket, callback) => {
  const { sessionId } = participants[socket.userId];
  addProducer(producer, sessionId, socket);
  informConsumers(sessionId, socket.userId, producer.id);
  console.log('Producer ID: ', producer.id, producer.kind);
  producer.on('transportclose', () => {
    console.log('producer transport close');
    producer.close();
  });

  callback({
    id: producer.id,
    producerExist: producers.length > 1 ? true : false,
  });
};

const handleTransportRecvConnect = async (
  dtlsParameters,
  serverConsumerTransportId
) => {
  const consumerTransport = transports.find((transportData) => {
    transportData.consumer &&
      transportData.transport.id === serverConsumerTransportId;
  }).transport;
  await consumerTransport.connect({ dtlsParameters });
};

const handleConsume = async (
  { rtpCapabilities, remoteProducerId, serverConsumerTransportId, socket },
  callback
) => {
  try {
    const { sessionId } = participants[socket.userId];
    const router = classSessions[sessionId].router;
    let consumerTransport = transports.find(
      (transportData) =>
        transportData.transport.id === serverConsumerTransportId
    ).transport;

    if (router.canConsume({ producerId: remoteProducerId, rtpCapabilities })) {
      const consumer = await consumerTransport.consume({
        producerId: remoteProducerId,
        rtpCapabilities,
        paused: true,
      });

      consumer.on('transportclose', () => {
        console.log('transport close from consumer');
        consumer.close();
      });

      consumer.on('producerclose', () => {
        console.log('producer of consumer closed');
        socket.emit('producer-closed', { remoteProducerId });

        consumerTransport.close([]);
        transports.filter(
          (transportData) => transportData.transport.id !== consumerTransport.id
        );

        consumer.close();
        consumers.filter(
          (consumerData) => consumerData.consumer.id !== consumer.id
        );
      });
      addConsumer(consumer, sessionId, socket);
      const serverParams = {
        id: consumer.id,
        producerId: remoteProducerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
      };
      callback({ serverParams });
    }
  } catch (error) {
    callback({
      serverParams: {
        error,
      },
    });
  }
};

const handleConsumerResume = async ({ serverConsumerId }) => {
  const consumer = consumers.find(
    (consumerData) => consumerData.consumer.id === serverConsumerId
  );
  await consumer.resume();
};

export {
  addNewConnectedUser,
  removeConnectedUser,
  getActiveConnections,
  setSocketServerInstance,
  getSocketServerInstance,
  getOnlineUsers,
  addNewClassSession,
  addNewParticipantsToRoom,
  handleCreateWebRtcTransport,
  handleGetProducers,
  getTransport,
  handleTransportProduct,
  handleTransportRecvConnect,
  handleConsume,
  handleConsumerResume,
};
