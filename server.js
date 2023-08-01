require('dotenv').config();
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { default: mongoose } = require('mongoose');
const cors = require('cors');
const socketServer = require('./socketServer');
const tutorRoutes = require('./routes/tutorRoutes');
const studentRoutes = require('./routes/studentRoutes');
const shareRoutes = require('./routes/shareRoutes');

const app = express();


app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);
app.use(helmet());
app.use(bodyParser.json());

app.use('/tutor', tutorRoutes);
app.use('/student', studentRoutes);
app.use(shareRoutes);

app.use((error, _req, res, _next) => {
  console.log(error.stack);
  const status = error.statusCode || 500;
  const { message, data, type } = error;
  res.status(status).json({ message, data, type });
});

const httpServer = http.createServer(app);
socketServer.registerSocketServer(httpServer);

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
