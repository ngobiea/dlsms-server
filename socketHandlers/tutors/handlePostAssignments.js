import { getSocketServerInstance } from '../../serverStore.js';
export const handlePostAssignments = (savedAssignmentMessage) => {
  const io = getSocketServerInstance();
  io.emit('assignment-post-message', savedAssignmentMessage);
};
