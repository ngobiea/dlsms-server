import { Server } from 'socket.io';

import authSocket from './middlewares/authSocket.js';
import { ExamStore } from './mediasoupHandlers/examSession/ExamStore.js';
import { Student } from './socketHandlers/students/Student.js';
import { setSocketServerInstance } from './serverStore.js';
import disconnectHandler from './socketHandlers/disconnectHandler.js';
import { handleGetClassroom } from './socketHandlers/updates/updateClassroom.js';
const examSessions = new ExamStore();

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

    socket.on('disconnect', async () => {
      console.log('User Disconnected of id', socket.userId);
      disconnectHandler(socket);
      examSessions.disconnectSocket(socket);
    });

    socket.on('update-classroom', (classroomId, callback) => {
      handleGetClassroom(classroomId, callback);
    });

    socket.on('image', (data) => {
      console.log(data);
    });

    socket.on('studentImages', (callback) => {
      Student.getImages(callback, socket);
    });

    // Exam Session Handlers
    socket.on('examStatus', ({ examSessionId }, callback) => {
      examSessions.getExamStatus({ examSessionId }, callback, socket);
    });

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
    socket.on('violation', ({ examSessionId, violation }) => {
      examSessions.reportViolation({ examSessionId, violation }, socket);
    });

    socket.on('bHistory', ({ examSessionId, history }) => {
      examSessions.updateBrowsingHistory({ examSessionId, history }, socket);
    });

    //
    socket.on('ESR-Chunk', ({ examSessionId, index, chunk }) => {
      examSessions.uploadChunk({ examSessionId, index, chunk }, socket);
    });
  });
};

export { registerSocketServer };
