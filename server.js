require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { default: mongoose } = require('mongoose');
const cors = require('cors');

const tutorRoutes = require('./routes/tutorRoutes');
const studentRoutes = require('./routes/studentRoutes');
const shareRoutes = require('./routes/shareRoutes');

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {});

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use((_req, res, next) => {
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/tutor', tutorRoutes);
app.use('/student', studentRoutes);
app.use(shareRoutes);

app.use((error, _req, res, _next) => {
  console.log(error.stack);
  const status = error.statusCode || 500;
  const { message, data, type } = error;
  res.status(status).json({ message, data, type });
});
io.on('connection', (_socket) => {
  console.log('a user connected');
});

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
