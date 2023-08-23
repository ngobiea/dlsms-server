import { cpus } from 'os';
import { createServer } from 'http';
import { readFileSync } from 'fs';

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { default as mongoose } from 'mongoose';
import cors from 'cors';
import { registerSocketServer } from './socketServer';
import tutorRouter from './routes/tutorRouter';
import studentRouter from './routes/StudentRouter';
import shareRoutes from './routes/shareRouter';
import { statusCode } from './util/statusCodes';
import crypto from 'crypto';

console.log(Object.keys(cpus()).length);
console.log(crypto.getCiphers().length);
const privateKey = readFileSync('./certificates/server.key', 'utf-8');
const certificate = readFileSync('./certificates/server.crt', 'utf-8');

const credentials = { key: privateKey, cert: certificate };
const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);
app.use(helmet());
app.use(bodyParser.json());

app.use('/tutor', tutorRouter);
app.use('/student', studentRouter);
app.use(shareRoutes);

app.use((error, _req, res, _next) => {
  console.log(error.stack);
  const status = error.statusCode || statusCode.INTERNAL_SERVER_ERROR;
  const { message, data, type } = error;
  res.status(status).json({ message, data, type });
});

registerSocketServer(httpServer);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    httpServer.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
