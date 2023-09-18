import { getSocketServerInstance } from '../../serverStore.js';


export const handleScheduleExamSession = (savedSessionMessage) => {
  const io = getSocketServerInstance();
  io.emit('exam-schedule-message', savedSessionMessage);
};
