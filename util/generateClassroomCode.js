const { v4: uuidv4 } = require('uuid');

exports.generateClassroomCode = () => {
  const num = 8;
  return uuidv4().replace(/-/g, '').substring(0, num);
};
