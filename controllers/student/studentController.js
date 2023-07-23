const { verifyClassroomCode } = require('./classrooms/postVerifyClassroomCode');
const { getClassrooms } = require('../shared/classrooms/getClassrooms');
const { getClassroom } = require('../shared/classrooms/getClassroom');
module.exports = {
  verifyClassroomCode,
  getClassroom,
  getClassrooms
};
