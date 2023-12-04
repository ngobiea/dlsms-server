import StudentExamSession from '../../../model/StudentExamSession.js';
import { statusCode } from '../../../util/statusCodes.js';
import { validationResult } from 'express-validator';
import { Workbook } from 'excel4node';
import path from 'path';
import fs from 'fs';
const __dirname = path.resolve();

export const getSESReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.statusCode = statusCode.BAD_REQUEST;
      error.data = errors.array();
      throw error;
    }
    const { studentExamSessionId } = req.params;
    const studentExamSession = await StudentExamSession.findById(
      studentExamSessionId,
      'student examSession startTime endTime violations browsingHistory -_id points comment'
    )
      .populate('student')
      .populate('examSession', 'title');
    if (!studentExamSession) {
      const error = new Error('Student exam session not found');
      error.statusCode = statusCode.NOT_FOUND;
      throw error;
    }

    const data = {
      examSession: {
        title: studentExamSession.examSession.title,
      },
      student: {
        email: studentExamSession.student.email,
        firstName: studentExamSession.student.firstName,
        institution: studentExamSession.student.institution,
        lastName: studentExamSession.student.lastName,
        studentId: studentExamSession.student.studentId,
      },
      startTime: new Date(studentExamSession.startTime).toLocaleString(),
      endTime: new Date(studentExamSession.endTime).toLocaleString(),
      points: studentExamSession.points,
      comment: studentExamSession.comment,
      browsingHistory: studentExamSession.browsingHistory.map((history) => {
        return {
          browser: history.browser,
          title: history.title,
          time: new Date(history.time).toLocaleString(),
          url: history.url,
        };
      }),
      violations: studentExamSession.violations.map((violation) => {
        return {
          description: violation.description,
          title: violation.title,
          time: new Date(violation.time).toLocaleString(),
          type: violation.type,
        };
      }),
    };
    generateExcelReport(data, res);
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
const four = 4;
const five = 5;
const six = 6;
const seven = 7;
const eight = 8;
const generateExcelReport = (data, res) => {
  console.log(data);
  const wb = new Workbook();
  const ws = wb.addWorksheet(`${data.student.studentId} Report`);
  // Row 1: Merge cells for the first row spanning 8 columns

  ws.cell(one, one, one, 8, true)
    .string(
      `${data.student.firstName} ${data.student.lastName} exam session for ${data.examSession.title}`
    )
    .style({
      font: { size: 16, bold: true },
      alignment: { horizontal: 'center' },
    });

  const headers = [
    'Student Name',
    'Institution',
    'Student ID',
    'Start Time',
    'End Time',
    'Points',
    'Comment',
  ];
  // Row 2: Title headers for each column
  headers.forEach((header, index) => {
    ws.cell(two, index + one)
      .string(header)
      .style({ font: { bold: true } });
  });

  // Row 3: Data based on the given titles from Row 2
  const rowData = [
    `${data.student.firstName} ${data.student.lastName}`,
    data.student.institution,
    data.student.studentId,
    data.startTime,
    data.endTime,
    String(data.points),
    data.comment,
  ];
  rowData.forEach((value, index) => {
    ws.cell(three, index + one).string(value);
  });
  // Row 5: Titles for Violations and Browsing History
  ws.cell(five, one, five, four, true)
    .string('Violations')
    .style({ font: { bold: true }, alignment: { horizontal: 'center' } });
  ws.cell(five, five, five, eight, true)
    .string('Browsing History')
    .style({
      font: { bold: true },
      alignment: { horizontal: 'center' },
    });

  // Row 6: Titles based on object keys for Violations and Browsing History
  const violationKeys = ['Title', 'Description', 'Time', 'Type'];
  const browsingKeys = ['Browser', 'Time', 'Title', 'URL'];

  violationKeys.forEach((key, index) => {
    ws.cell(six, index + one)
      .string(key)
      .style({ font: { bold: true } });
  });

  browsingKeys.forEach((key, index) => {
    ws.cell(six, violationKeys.length + index + one)
      .string(key)
      .style({
        font: { bold: true },
      });
  });

  // Row 7 and beyond: Data for Violations and Browsing History
  let rowIndex = seven;
  data.violations.forEach((violation) => {
    Object.keys(violation).forEach((key, index) => {
      ws.cell(rowIndex, index + one).string(String(violation[key]));
    });
    rowIndex++;
  });

  rowIndex = seven;

  data.browsingHistory.forEach((history) => {
    Object.keys(history).forEach((key, index) => {
      ws.cell(rowIndex, violationKeys.length + index + one).string(
        String(history[key])
      );
    });
    rowIndex++;
  });
  const filePath = path.join(
    __dirname,
    'temp',
    `${data.student.studentId}.xlsx`
  );
  wb.write(filePath, (err) => {
    if (err) {
      console.log(err);
      res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to generate file' });
    }
    res.download(filePath, `${data.student.studentId}.xlsx`, (error) => {
      if (error) {
        console.log(error);
      }
      fs.unlinkSync(filePath);
    });
  });
};
