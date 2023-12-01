import StudentClassSession from '../../../model/StudentClassSession.js';
import ClassSession from '../../../model/ClassSession.js';
import { statusCode } from '../../../util/statusCodes.js';
import { validationResult } from 'express-validator';
import { Workbook } from 'excel4node';
import path from 'path';
import fs from 'fs';
import { calculateAttendance } from '../../../util/dateDifference.js';
const __dirname = path.resolve();

export const getCSReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }
    const { classSessionId } = req.params;
    const classSession = await ClassSession.findById(classSessionId);
    if (!classSession) {
      const error = new Error('Class session not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const studentClassSessions = await StudentClassSession.find({
      classSession: classSessionId,
    }).populate('student');

    if (studentClassSessions?.length === 0) {
      const error = new Error('Student class session not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }
    const data = {
      title: classSession.title,
      startDate: new Date(classSession.startDate).toLocaleString(),
      endDate: new Date(classSession.endDate).toLocaleString(),
      noOfStudents: studentClassSessions.length + '',
      students: studentClassSessions.map((studentClassSession) => {
        return {
          email: studentClassSession.student.email,
          firstName: studentClassSession.student.firstName,
          institution: studentClassSession.student.institution,
          lastName: studentClassSession.student.lastName,
          studentId: studentClassSession.student.studentId,
          startTime: studentClassSession.startTime[0].toLocaleString(),
          endTime:
            studentClassSession.endTime[
              studentClassSession.endTime.length - 1
            ].toLocaleString(),
          noOfTimeLeft: `${studentClassSession.endTime.length - 1}`,
          attendance:
            calculateAttendance(
              classSession.startDate,
              classSession.endDate,
              studentClassSession.verify
            ) + '%',
        };
      }),
    };
    generateExcelReport(data, res, next);
  } catch (error) {
    next(error);
  }
};
const one = 1;
const two = 2;
const three = 3;
const four = 4;
const five = 5;
const six = 6;
const seven = 7;
const eight = 8;
const generateExcelReport = (data, res, next) => {
  try {
    const { title, startDate, endDate, noOfStudents, students } = data;

    const wb = new Workbook();
    const ws = wb.addWorksheet(`${title}`);
    ws.cell(one, one, one, eight, true)
      .string(title + ' Report')
      .style({
        font: {
          size: 20,
          bold: true,
        },
        alignment: {
          horizontal: 'center',
        },
      });

    const headers = ['Title', 'Start Date', 'End Date', 'No. of Students'];
    headers.forEach((header, index) => {
      ws.cell(two, index + one)
        .string(header)
        .style({
          font: { bold: true },
        });
    });
    const headerData = [title, startDate, endDate, noOfStudents];
    headerData.forEach((value, index) => {
      ws.cell(three, index + one).string(value);
    });
    const studentHeaders = [
      'Name',
      'Email',
      'Institution',
      'Student ID',
      'Start Time',
      'End Time',
      'Attendance',
      'No. of Time Left',
    ];
    studentHeaders.forEach((header, index) => {
      ws.cell(five, index + one)
        .string(header)
        .style({
          font: { bold: true },
        });
    });
    students.forEach((student, outerIndex) => {
      const studentData = [
        `${student.firstName} ${student.lastName}`,
        student.email,
        student.institution,
        student.studentId,
        student.startTime,
        student.endTime,
        student.attendance,
        student.noOfTimeLeft,
      ];
      studentData.forEach((value, innerIndex) => {
        ws.cell(outerIndex + six, innerIndex + one).string(value);
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
    next(error);
  }
};
