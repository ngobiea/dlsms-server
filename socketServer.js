import authSocket from './middlewares/authSocket.js';
import {
  setSocketServerInstance,
  handleGetProducers,
  handleConsume,
  handleCreateTransport,
  handleTransportConnect,
  handleTransportProduce,
  handleTransportReceiveConnect,
  handleConsumeResume,
  handleJoinSession,
} from './serverStore.js';
import disconnectHandler from './socketHandlers/disconnectHandler.js';
import { handleGetClassroom } from './socketHandlers/updates/updateClassroom.js';
import { Server } from 'socket.io';
import {
  handleNewExamSession,
  handleCreateExamSessionTransport,
  handleExamSessionOnProducerConnect,
  handleExamSessionOnProducerProduce,
} from './ExamStore.js';

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
    socket.on('newExamSession', ({ examSessionId }, callback) => {
      handleNewExamSession({ examSessionId, socket, worker }, callback);
    });
    socket.on(
      'createExamSessionWebRTCTransport',
      ({ examSessionId, isProducer }, callback) => {
        handleCreateExamSessionTransport(
          examSessionId,
          isProducer,
          callback,
          socket
        );
      }
    );
    socket.on(
      'examSessionOnProducerTransportConnect',
      handleExamSessionOnProducerConnect
    );
    socket.on(
      'examSessionOnTransportProduce',
      (
        { examSessionId, kind, rtpParameters, appData, producerTransportId },

        callback
      ) => {
        handleExamSessionOnProducerProduce(
          { examSessionId, kind, rtpParameters, appData, producerTransportId },
          socket,
          callback
        );
      }
    );
  });
};

export { registerSocketServer };
