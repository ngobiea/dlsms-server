const serverStore = require('../../serverStore');

exports.updateClassroomMembers = async (classroom, students, studentId) => {
  try {
    const io = serverStore.getSocketServerInstance();
    const data = {
      classroom,
      students,
      studentId,
    };
    io.emit('update-classroom-members', data);
    console.log('Update classroom members event emitted');
  } catch (error) {
    console.log(error);
  }
};
