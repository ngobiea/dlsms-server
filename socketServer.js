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
import { finalChunk, uploadVideo } from './util/aws/uploadStream.js';
const examSessions = new ExamStore();
export class WebSocket {
  constructor(socket) {
    this.setSocket(socket);
    this.setExamSocket(socket);
    this.setClassSocket(socket);
  }
  setSocket(socket) {
    this.socket = socket;
  }
  setExamSocket(socket) {
    this.examSocket = socket;
  }
  setClassSocket(socket) {
    this.classSocket = socket;
  }
  setIO(io) {
    this.io = io;
  }
}

const registerSocketServer = (server, worker) => {
  const io = new Server(server, {
    maxHttpBufferSize: 1e8,
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

    socket.on('video', (chuck) => {
      console.log('video event emitted');
      uploadVideo(chuck);
    });

    socket.on('chunk', () => {
      console.log('final-chuck event emitted');

      finalChunk();
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
    // createExamSessionTp event handler
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
    // ESOnPTConnect event handler
    socket.on('ESOnPTConnect', ({ examSessionId, dtlsParameters }) => {
      examSessions.connectProducerTransport(
        { dtlsParameters, examSessionId },
        socket
      );
    });
    // ESOnPTProduce event handler
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
    // ESOnCTConnect event handler
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
    // getStudentPTIds event handler
    socket.on('getStudentPTIds', ({ examSessionId }, callback) => {
      examSessions.getStudentPTIds({ examSessionId }, callback);
    });
    // ESOnCTConsume event handler
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
    // ESOnCTResume event handler
    socket.on('ESOnCTResume', ({ examSessionId, consumerId }) => {
      examSessions.eSConsumeResume({ examSessionId, consumerId }, socket);
    });
    // closeESProducer event handler
    socket.on('closeESProducer', ({ examSessionId, producerId }, callback) => {
      examSessions.closeProducer(
        { examSessionId, producerId },
        callback,
        socket
      );
    });
    // blurEQWindow event handler
    socket.on('blurEQWindow', ({ examSessionId }) => {
      examSessions.blurExamQuestionWindow({ examSessionId }, socket);
    });
    // minimizeEQWindow event handler
    socket.on('minEQWindow', ({ examSessionId }) => {
      examSessions.minimizeExamQuestionWindow({ examSessionId }, socket);
    });
    // maximizeEQWindow event handler
    socket.on('maxEQWindow', ({ examSessionId }) => {
      examSessions.maximizeExamQuestionWindow({ examSessionId }, socket);
    });
    // focusEQWindow event handler
    socket.on('focusEQWindow', ({ examSessionId }) => {
      examSessions.focusExamQuestionWindow({ examSessionId }, socket);
    });
    // 
    socket.on('ESR-Chunk', ({ examSessionId, index, chunk }) => {
      examSessions.uploadChunk({ examSessionId, index, chunk }, socket);
    });
  });
};

export { registerSocketServer };
