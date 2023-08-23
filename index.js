import dotenv from 'dotenv';
dotenv.config();
import { cpus } from 'os';
import express from 'express';
import { createServer } from 'http';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { default as mongoose } from 'mongoose';
import cors from 'cors';
import { registerSocketServer } from './socketServer';
import tutorRouter from './routes/tutorRouter';
import studentRouter from './routes/StudentRouter';
import shareRoutes from './routes/shareRoutes';
import { statusCode } from './util/statusCodes';

console.log(Object.keys(cpus()).length);
const app = express();

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

const httpServer = createServer(app);
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
