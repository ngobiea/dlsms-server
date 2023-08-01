const { verifyClassroomCode } = require('./classrooms/postVerifyClassroomCode');
const { getClassrooms } = require('../shared/classrooms/getClassrooms');
const { getClassroom } = require('../shared/classrooms/getClassroom');
const { postJoinClassroom } = require('./classrooms/postJoinClassroom');
module.exports = {
  verifyClassroomCode,
  getClassroom,
  getClassrooms,
  postJoinClassroom,
};
