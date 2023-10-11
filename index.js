import { createServer } from 'http';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { default as mongoose } from 'mongoose';
import cors from 'cors';
import { createWorker } from 'mediasoup';
import { registerSocketServer } from './socketServer.js';
import tutorRouter from './routes/tutorRouter.js';
import studentRouter from './routes/studentRouter.js';
import shareRoutes from './routes/shareRouter.js';
import { statusCode } from './util/statusCodes.js';
import path from 'path';

const __dirname = path.resolve();
let worker;

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);
app.use('/success', express.static(path.join(__dirname, 'public')));
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
const createNewWorker = async () => {
  const newWorker = await createWorker({
    logLevel: 'debug',
    logTags: [
      'info',
      'ice',
      'dtls',
      'rtp',
      'srtp',
      'rtcp',
      'rtx',
      'bwe',
      'score',
      'simulcast',
      'svc',
      'sctp',
      'message',
    ],
  });

  newWorker.on('died', (error) => {
    // This implies something serious happened, so kill the application
    console.error('mediasoup worker has died', error);
    // exit in 2 seconds
    setTimeout(
      () => process.exit(1),
      parseFloat(process.env.WORKER_DIE_TIMEOUT)
    );
  });
  return newWorker;
};
(async () => {
  worker = await createNewWorker();
  registerSocketServer(httpServer, worker);
})();



mongoose
  .connect(process.env.MONGO_URI || process.env.MONGO_URI_LOCAL)
  .then(() => {
    httpServer.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
