import authSocket from './middlewares/authSocket';
import {
  setSocketServerInstance,
  getOnlineUsers,
  handleGetProducers,
  handleConsume,
  handleCreateTransport,
  handleTransportConnect,
  handleTransportProduce,
  handleTransportReceiveConnect,
  handleConsumeResume,
  handleJoinSession,
} from './serverStore';
import disconnectHandler from './socketHandlers/disconnectHandler';
import { handleGetClassroom } from './socketHandlers/updates/updateClassroom';
import { Server } from 'socket.io';
import {
  handleNewExamSession,
  handleCreateExamSessionTransport,
} from './ExamStore';

const registerSocketServer = (server, worker) => {
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

  io.on('connection', (socket) => {
    console.log('user connected');
    console.log(socket.id);

    socket.on('disconnect', () => {
      console.log('User Disconnected of id', socket.userId);
      disconnectHandler(socket);
    });

    socket.on('update-classroom', (classroomId) => {
      handleGetClassroom(classroomId, socket);
    });
    socket.on('new-session-initiated', () => {
      console.log('received new session initiation');
    });

    socket.on('createSession', async ({ sessionId }, callback) => {
      handleJoinSession({ sessionId }, callback, socket, worker);
    });

    socket.on('createWebRtcTransport', async ({ consumer }, callback) => {
      handleCreateTransport({ consumer }, callback, socket.userId);
    });

    socket.on('transport-connect', ({ dtlsParameters }) => {
      handleTransportConnect({ dtlsParameters }, socket.userId);
    });

    socket.on(
      'transport-produce',
      ({ kind, rtpParameters, appData }, callback) => {
        handleTransportProduce(
          { kind, rtpParameters, appData },
          callback,
          socket.userId
        );
      }
    );
    socket.on('getProducers', (callback) => {
      handleGetProducers(callback, socket.userId);
    });
    socket.on('transport-recv-connect', handleTransportReceiveConnect);
    socket.on(
      'consume',
      (
        { rtpCapabilities, remoteProducerId, serverConsumerTransportId },
        callback
      ) => {
        handleConsume(
          { rtpCapabilities, remoteProducerId, serverConsumerTransportId },
          callback,
          socket
        );
      }
    );
    socket.on('consumer-resume', handleConsumeResume);

    // Exam Session
    socket.on('examSession', ({ examSessionId }, cb) => {
      handleNewExamSession({ examSessionId, socket, worker }, cb);
    });
    socket.on('createExamSessionTransport', ({ examSessionId }, cb) => {
      // handleCreateExamSessionTransport(examSessionId, cb, socket);
    });
    socket.on('connectExamSessionTransport', ({ dtlsParameters }) => { });
  });
};

export { registerSocketServer };
