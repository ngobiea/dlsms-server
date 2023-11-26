import { getSocketServerInstance } from '../../serverStore.js';
import ExamSession from '../../model/ExamSession.js';

export const handleScheduleExamSession = async (savedSessionMessage) => {
  const io = getSocketServerInstance();
  const examSession = await ExamSession.findById(
    savedSessionMessage.message.examSession._id
  );
  examSession.status = 'ongoing';
  await examSession.save();
  io.emit('exam-schedule-message', savedSessionMessage);
};
