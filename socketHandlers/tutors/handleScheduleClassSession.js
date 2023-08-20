const { getSocketServerInstance } = require('../../serverStore');
exports.handleScheduleClassSession = async (savedSessionMessage) => {
  const io = getSocketServerInstance();
  io.emit('classroom-schedule-message', savedSessionMessage);
};
