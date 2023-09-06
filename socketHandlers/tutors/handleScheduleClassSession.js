import { getSocketServerInstance } from '../../serverStore.js';
export const handleScheduleClassSession =  (savedSessionMessage) => {
  const io = getSocketServerInstance();
  io.emit('classroom-schedule-message', savedSessionMessage);
};
