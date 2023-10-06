import authSocket from './middlewares/authSocket.js';
import { ExamStore } from './mediasoupHandlers/examSession/ExamStore.js';
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

const examSessions = new ExamStore();

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
    examSessions.setIO(io);

    console.log('user connected');
    console.log(socket.id);

    socket.on('disconnect', () => {
      console.log('User Disconnected of id', socket.userId);
      disconnectHandler(socket);
      examSessions.disconnectSocket(socket);
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

    // Exam Session Handlers
    socket.on('newExamSession', ({ examSessionId }, callback) => {
      examSessions.joinExamSession(
        { examSessionId },
        callback,
        socket,
        worker,
        io
      );
    });

    socket.on(
      'createExamSessionTp',
      ({ examSessionId, isProducer, userId }, callback) => {
        examSessions.createTransport(
          { examSessionId, isProducer, userId },
          callback,
          socket
        );
      }
    );

    socket.on('ESOnPTConnect', ({ examSessionId, dtlsParameters }) => {
      examSessions.connectProducerTransport(
        { dtlsParameters, examSessionId },
        socket
      );
    });

    socket.on(
      'ESOnPTProduce',
      ({ examSessionId, kind, rtpParameters, appData }, callback) => {
        examSessions.producerTransportOnProduce(
          { examSessionId, kind, rtpParameters, appData },
          callback,
          socket
        );
      }
    );

    socket.on('ESOnCTConnect', ({ examSessionId, dtlsParameters, userId }) => {
      examSessions.connectConsumerTransport(
        {
          examSessionId,
          dtlsParameters,
          userId,
        },
        socket
      );
    });

    socket.on('getStudentPTIds', ({ examSessionId }, callback) => {
      examSessions.getStudentPTIds({ examSessionId }, callback);
    });

    socket.on(
      'ESOnCTConsume',
      ({ examSessionId, rtpCapabilities, producerId, userId }, callback) => {
        examSessions.consumeTransport(
          { examSessionId, rtpCapabilities, producerId, userId },
          callback,
          socket
        );
      }
    );

    socket.on('ESOnCTResume', ({ examSessionId, consumerId }) => {
      examSessions.eSConsumeResume({ examSessionId, consumerId }, socket);
    });

    socket.on('closeESProducer', ({ examSessionId, producerId }, callback) => {
      examSessions.closeProducer(
        { examSessionId, producerId },
        callback,
        socket
      );
    });
  });
};

export { registerSocketServer };
