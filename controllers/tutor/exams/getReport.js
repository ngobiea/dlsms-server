import StudentExamSession from '../../../model/StudentExamSession.js';
import ExamSession from '../../../model/ExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';
import { validationResult } from 'express-validator';
import { Workbook } from 'excel4node';
import path from 'path';
import fs from 'fs';
const __dirname = path.resolve();
export const getESReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }
    const { examSessionId } = req.params;
    const examSession = await ExamSession.findById(examSessionId);
    if (!examSession) {
      const error = new Error('Exam session not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const studentExamSessions = await StudentExamSession.find(
      { examSession: examSessionId },
      'student examSession startTime endTime violations browsingHistory -_id points comment'
    ).populate('student');
    if (studentExamSessions?.length === 0) {
      const error = new Error('Student exam session not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const data = {
      title: examSession.title,
      startDate: new Date(examSession.startDate).toLocaleString(),
      endDate: new Date(examSession.endDate).toLocaleString(),
      totalPoint: examSession.totalPoint + '',
      noOfStudents: studentExamSessions.length + '',
      students: studentExamSessions.map((studentExamSession) => {
        return {
          email: studentExamSession.student.email,
          firstName: studentExamSession.student.firstName,
          institution: studentExamSession.student.institution,
          lastName: studentExamSession.student.lastName,
          studentId: studentExamSession.student.studentId,
          startTime: new Date(studentExamSession.startTime).toLocaleString(),
          endTime: new Date(studentExamSession.endTime).toLocaleString(),
          points: studentExamSession.points + '',
          comment: studentExamSession.comment || ' ',
          browsingHistory: studentExamSession.browsingHistory.length + '',
          violations: studentExamSession.violations.length + '',
        };
      }),
    };
    generateExcelReport(data, res, next);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};
const one = 1;
const two = 2;
const three = 3;
const five = 5;
const six = 6;
const eight = 8;

const generateExcelReport = (data, res, next) => {
  try {
    const wb = new Workbook();
    const ws = wb.addWorksheet(`${data.title} Report`);

    const { title, startDate, endDate, totalPoint, students, noOfStudents } =
      data;

    ws.cell(one, one, one, eight, true)
      .string(title + 'Report')
      .style({
        font: { size: 20, bold: true },
        alignment: { horizontal: 'center' },
      });
    const headers = [
      'Title',
      'Start Date',
      'End Date',
      'Total Point',
      'No. of Students',
    ];
    headers.forEach((header, index) => {
      ws.cell(two, index + one)
        .string(header)
        .style({
          font: { bold: true },
        });
    });
    const headerData = [title, startDate, endDate, totalPoint, noOfStudents];
    headerData.forEach((value, index) => {
      ws.cell(three, index + one).string(value);
    });
    const studentHeaders = [
      'Name',
      'Email',
      'Student ID',
      'Institution',
      'Start Time',
      'End Time',
      'Points',
      'No. of Browsing History',
      'No. of Violations',
      'Comment',
    ];
    studentHeaders.forEach((header, index) => {
      ws.cell(five, index + one)
        .string(header)
        .style({
          font: { bold: true },
        });
    });
    students.forEach((student, outerIndex) => {
      const values = [
        `${student.firstName} ${student.lastName}`,
        student.email,
        student.studentId,
        student.institution,
        student.startTime,
        student.endTime,
        student.points,
        student.browsingHistory,
        student.violations,
        student.comment,
      ];
      values.forEach((value, index) => {
        ws.cell(outerIndex + six, index + 1).string(value);
      });
    });

    const filePath = path.join(__dirname, 'temp', `${title}.xlsx`);
    wb.write(filePath, (err) => {
      if (err) {
        console.log(err);
        res
          .status(statusCode.INTERNAL_SERVER_ERROR)
          .json({ message: 'Failed to generate file' });
      }
      res.download(filePath, `${title}.xlsx`, (error) => {
        if (error) {
          console.log(error);
        }
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = statusCode.INTERNAL_SERVER_ERROR;
    }
    next(error);
  }
};
