import { getSocketServerInstance } from '../../serverStore.js';

export const updateClassroomMembers = async (data) => {
  try {
    const io = getSocketServerInstance();
    io.emit('update-classroom-members', data);
    console.log('Update classroom members event emitted');
  } catch (error) {
    console.log(error);
  }
};
