const { verifyClassroomCode } = require('./classrooms/postVerifyClassroomCode');
const { getClassrooms } = require('../shared/classrooms/getClassrooms');
const { getClassroom } = require('../shared/classrooms/getClassroom');
const { postJoinClassroom } = require('./classrooms/postJoinClassroom');
const { postJoin } = require('./classrooms/postJoin');
module.exports = {
  verifyClassroomCode,
  getClassroom,
  getClassrooms,
  postJoinClassroom,
  postJoin,
};
