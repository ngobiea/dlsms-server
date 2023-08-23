import authSocket from './middlewares/authSocket';
import {
  setSocketServerInstance,
  getOnlineUsers,
  addNewClassSession,
  addNewParticipantsToRoom,
  handleCreateWebRtcTransport,
  handleGetProducers,
  getTransport,
  handleTransportProduct,
  handleTransportRecvConnect,
  handleConsume,
  handleConsumerResume
} from './serverStore';
import newConnectionHandler from './socketHandlers/newConnectionHandler';
import disconnectHandler from './socketHandlers/disconnectHandler';
import { handleGetClassroom } from './socketHandlers/updates/updateClassroom';
import { Server } from 'socket.io';
let worker;



const registerSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  setSocketServerInstance(io);

  io.use((socket, next) => {
    authSocket(socket, next);
  });

  const emitOnlineUsers = () => {
    const onlineUsers = getOnlineUsers();
    io.emit('online-users', { onlineUsers });
  };

  io.on('connection', (socket) => {
    console.log('user connected');
    console.log(socket.id);

    newConnectionHandler(socket, io);
    emitOnlineUsers();

    socket.on('disconnect', () => {
      console.log('User Disconnected of id', socket.userId);
      disconnectHandler(socket);
    });

    socket.on('update-classroom', (classroomId) => {
      handleGetClassroom(classroomId, socket);
    });

    socket.on('join-class-session', async ({ sessionId }, callback) => {
      console.log('receive join-class-session event from client');
      console.log('session:', sessionId);
      const router = await addNewClassSession(sessionId, socket.userId, worker);
      addNewParticipantsToRoom(socket, socket.userId, sessionId);
      const rtpCapabilities = router.rtpCapabilities;
      // console.log(rtpCapabilities);
      callback({ rtpCapabilities });
    });

    socket.on('createWebRtcTransport', async ({ consumer }, callback) => {
      handleCreateWebRtcTransport({ consumer }, callback, socket);
    });
    socket.on('getProducers', (callback) => {
      handleGetProducers(callback, socket);
    });

    socket.on('transport-connect', ({ dtlsParameters }) => {
      console.log('DTLS PARAMS... ', { dtlsParameters });
      getTransport(socket.userId).connect({ dtlsParameters });
    });

    socket.on(
      'transport-produce',
      async ({ kind, rtpParameters, appData }, callback) => {
        // console.log('TRANSPORT PRODUCE... ', { kind, rtpParameters});
        const producer = await getTransport(socket.userId).produce({
          kind,
          rtpParameters,
        });
        // console.log('PRODUCER: ', producer);
        handleTransportProduct(producer, socket, callback);
      }
    );
    socket.on(
      'transport-recv-connect',
      async ({ dtlsParameters, serverConsumerTransportId }) => {
        console.log(`DTLS PARAMS: ${dtlsParameters}`);
        handleTransportRecvConnect(dtlsParameters, serverConsumerTransportId);
      }
    );

    socket.on(
      'consume',
      async (
        { rtpCapabilities, remoteProducerId, serverConsumerTransportId },
        callback
      ) => {
        handleConsume(
          {
            rtpCapabilities,
            remoteProducerId,
            serverConsumerTransportId,
            socket,
          },
          callback
        );
      }
    );
    socket.on('consumer-resume', ({ serverConsumerId }) => {
      console.log('consumer resume');
      handleConsumerResume({ serverConsumerId });
    });
  });
};

export { registerSocketServer };
