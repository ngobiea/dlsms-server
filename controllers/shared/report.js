import excel4node from 'excel4node';
import User from '../../model/User.js';
import path from 'path';
import fs from 'fs';
import { statusCode } from '../../util/statusCodes.js';

const __dirname = path.resolve();
export const getReport = async (_req, res, _next) => {
  try {
    const users = await User.find(
      {},
      'firstName lastName email role institution'
    );
    console.log(users);
    const wb = new excel4node.Workbook();
    const ws = wb.addWorksheet('Users');
    const schemaKeys = Object.keys(User.schema.obj);
    // Add headers based  on schema keys
    schemaKeys.forEach((key, index) => {
      ws.cell(1, index + 1).string(key);
    });

    // Add data to each cell
    users.forEach((user, rowIndex) => {
      schemaKeys.forEach((key, columnIndex) => {
        ws.cell(rowIndex + 2, columnIndex + 1).string(String(user[key]));
      });
    });

    const filePath = path.join(__dirname, 'temp', 'users_report.xlsx');
    wb.write(filePath, (err, stats) => {
      if (err) {
        console.log(err);
        return res
          .status(statusCode.INTERNAL_SERVER_ERROR)
          .json({ message: 'Something went wrong' });
      }
      res.download(filePath, 'users_report.xlsx', (downloadErr) => {
        if (downloadErr) {
          console.log(downloadErr);
        }
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    console.log(error.stack);
  }
};
