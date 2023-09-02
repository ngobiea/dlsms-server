import { mediaCodecs, createWebRtcTransport } from './mediasoupServer';

const examSessions = new Map();
const students = new Map();
const tutor = new Map();

const createSession = async ({ examSessionId, socket, worker }) => {
  let router;
  let studentsInSession = [];
  let tutorInSession;
  // check if exam session exists
  if (examSessions.has(examSessionId)) {
    // if it does, get the router and participants
    router = examSessions.get(examSessionId).router;
    if (socket.user.role === 'student') {
      studentsInSession =
        examSessions.get(examSessionId).studentsInSession || [];
    } else if (socket.user.role === 'tutor') {
      tutorInSession = examSessions.get(examSessionId).tutorInSession || null;
    }
  } else {
    // if it doesn't, create a new router
    router = await worker.createRouter({ mediaCodecs });
  }
  // add the new participant to the exam session
  if (socket.user.role === 'student') {
    examSessions.set(examSessionId, {
      router,
      studentsInSession: [...studentsInSession, socket.user],
    });
  } else if (socket.user.role === 'tutor') {
    examSessions.set(examSessionId, {
      router,
      tutorInSession: tutorInSession || socket.user,
    });
  }
  return router;
};
const handleNewExamSession = async (
  { examSessionId, socket, worker },
  callback
) => {
  // create a new session
  const router = await createSession({ examSessionId, socket, worker });
  if (socket.user.role === 'student') {
    students.set(socket.userId, {
      examSessionId,
      router,
      producerTransport: null,
      consumerTransport: null,
      consumer: null,
      producer: null,
      isBothProducerAndConsumer: false,
    });
  } else if (socket.user.role === 'tutor') {
    tutor.set(socket.userId, {
      examSessionId,
      router,
      producerTransport: null,
      consumerTransport: null,
      consumers: [],
      producer: null,
      isBothProducerAndConsumer: false,
    });
  }
  const rtpCapabilities = router.rtpCapabilities;
  callback({ rtpCapabilities });
};

const handleCreateExamSessionTransport = (examSessionId, cb, socket) => {
  // check if exam session exists
  try {
    const router = examSessions.get(examSessionId).router;
    createWebRtcTransport(router)
      .then((transport) => {
        cb({
          serverParams: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
          },
        });
        addProducerTransport(transport, socket);
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    return cb({
      serverParams: {
        error: 'Exam session does not exist',
      },
    });
  }
};

const addProducerTransport = (transport, socket) => {
  if (socket.user.role === 'student') {
    const student = students.get(socket.userId);
    student.producerTransport = transport;
  } else if (socket.user.role === 'tutor') {
    const tutor = tutor.get(socket.userId);
    tutor.producerTransport = transport;
  }
};

const handleProducerTransportConnect = ({ dtlsParameters }, socket) => {
  if (socket.user.role === 'student') {
    const student = students.get(socket.userId);
    student.producerTransport.connect({ dtlsParameters });
  } else if (socket.user.role === 'tutor') {
    const tutor = tutor.get(socket.userId);
    tutor.producerTransport.connect({ dtlsParameters });
  }
};

export { handleNewExamSession, handleCreateExamSessionTransport };
