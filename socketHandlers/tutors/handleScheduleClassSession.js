import { getSocketServerInstance } from '../../serverStore';
export async function handleScheduleClassSession(savedSessionMessage) {
  const io = getSocketServerInstance();
  io.emit('classroom-schedule-message', savedSessionMessage);
}
