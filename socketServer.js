import { Server } from 'socket.io';

import authSocket from './middlewares/authSocket.js';
import { ExamStore } from './mediasoupHandlers/examSession/ExamStore.js';
import { ClassStore } from './mediasoupHandlers/classSession/ClassStore.js';
import { Student } from './socketHandlers/students/Student.js';
import { setSocketServerInstance } from './serverStore.js';
import disconnectHandler from './socketHandlers/disconnectHandler.js';
import { handleGetClassroom } from './socketHandlers/updates/updateClassroom.js';
const examSessions = new ExamStore();
const classSessions = new ClassStore();

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
    classSessions.setIO(io);

    console.log('user connected');
    console.log(socket.id);

    socket.on('disconnect', async () => {
      console.log('User Disconnected of id', socket.userId);
      disconnectHandler(socket);
      examSessions.disconnectSocket(socket);
      classSessions.disconnectSocket(socket);
    });

    socket.on('update-classroom', (classroomId, callback) => {
      handleGetClassroom(classroomId, callback);
    });

    socket.on('studentImages', (callback) => {
      Student.getImages(callback, socket);
    });
    // Class Session Handlers
    socket.on('newSession', ({ classSessionId }, callback) => {
      console.log(classSessionId);
      classSessions.joinClassSession(
        { classSessionId },
        callback,
        socket,
        worker,
        io
      );
    });

    socket.on(
      'createClassSessionTp',
      ({ classSessionId, isProducer, userId }, callback) => {
        classSessions.createTransport(
          { classSessionId, isProducer, userId },
          callback,
          socket
        );
      }
    );

    socket.on('CSOnPTConnect', ({ classSessionId, dtlsParameters }) => {
      classSessions.connectProducerTransport(
        { dtlsParameters, classSessionId },
        socket
      );
    });
    socket.on('CSOnCTConnect', ({ classSessionId, dtlsParameters, userId }) => {
      classSessions.connectConsumerTransport(
        { dtlsParameters, classSessionId, userId },
        socket
      );
    });
    socket.on(
      'CSOnPTProduce',
      ({ classSessionId, kind, rtpParameters, appData }, callback) => {
        classSessions.producerTransportOnProduce(
          { classSessionId, kind, rtpParameters, appData },
          callback,
          socket
        );
      }
    );
    socket.on(
      'CSOnCTConsume',
      ({ classSessionId, rtpCapabilities, userId, producerId }, callback) => {
        classSessions.consumerTransportOnConsume(
          {
            classSessionId,
            rtpCapabilities,
            producerId,
            userId,
          },
          callback,
          socket
        );
      }
    );
    socket.on('resumeCSP', ({ classSessionId, producerId }, callback) => {
      classSessions.resumeProducer(
        { classSessionId, producerId },
        callback,
        socket
      );
    });
    socket.on('pauseCSP', ({ classSessionId, producerId }, callback) => {
      classSessions.pauseProducer(
        { classSessionId, producerId },
        callback,
        socket
      );
    });
    socket.on('closeCSP', ({ classSessionId, producerId }, callback) => {
      classSessions.closeProducer(
        { classSessionId, producerId },
        callback,
        socket
      );
    });
    socket.on('resumeCSC', ({ classSessionId, consumerId }) => {
      classSessions.resumeConsumer({ classSessionId, consumerId }, socket);
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

    socket.on('addStudentToExam', ({ examSessionId }, callback) => {
      examSessions.addStudentToDB({ examSessionId }, callback, socket);
    });
    // createExamSessionTp event handler
    socket.on('createExamSessionTp', ({ examSessionId, userId }, callback) => {
      examSessions.createTransport({ examSessionId, userId }, callback, socket);
    });
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
    socket.on('closeESP', ({ examSessionId, producerId }, callback) => {
      examSessions.closeProducer(
        { examSessionId, producerId },
        callback,
        socket
      );
    });
    socket.on('pauseESP', ({ examSessionId, producerId }, callback) => {
      examSessions.pauseProducer(
        { examSessionId, producerId },
        callback,
        socket
      );
    });
    socket.on('resumeESP', ({ examSessionId, producerId }, callback) => {
      examSessions.resumeProducer(
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

    socket.on('endStudentSession', ({ examSessionId, studentId }) => {
      examSessions.endStudentSession({ examSessionId, studentId }, socket);
    });

    socket.on('oneToOneSession', ({ examSessionId, studentId }, callback) => {
      examSessions.oneTonOneSession(
        { examSessionId, studentId },
        callback,
        socket
      );
    });
    socket.on(
      'createOneToOneTp',
      ({ examSessionId, isProducer, userId }, callback) => {
        examSessions.createOneToOneTransport(
          { examSessionId, isProducer, userId },
          callback,
          socket
        );
      }
    );
    socket.on('connectOneToOnePT', ({ examSessionId, dtlsParameters }) => {
      examSessions.connectOneToOneProducerTransport({
        examSessionId,
        dtlsParameters,
      });
    });
    socket.on(
      'onOneToOneProduce',
      ({ examSessionId, kind, rtpParameters, appData, userId }, callback) => {
        examSessions.oneToOneProducerOnProduce(
          { examSessionId, kind, rtpParameters, userId, appData },
          callback,
          socket
        );
      }
    );
    socket.on('connectOneToOneCT', ({ examSessionId, dtlsParameters }) => {
      examSessions.connectOneToOneConsumerTransport({
        examSessionId,
        dtlsParameters,
      });
    });
    socket.on(
      'oneToOneConsumer',
      ({ examSessionId, producerId, rtpCapabilities, userId }, callback) => {
        examSessions.oneToOneConsumer(
          { examSessionId, producerId, rtpCapabilities, userId },
          callback,
          socket
        );
      }
    );
    socket.on('resumeOneC', ({ examSessionId, consumerId }) => {
      examSessions.resumeOneToOneConsumer(
        { examSessionId, consumerId },
        socket
      );
    });
  });
};

export { registerSocketServer };
