/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const { promisify } = require('util');
const User = require('./models/userModel');

// Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Listen for when the client connects via socket.io-client
io.on('connection', async (socket) => {
  const user_id = socket.handshake.query['user_id'];

  console.log(`User connected ${socket.id}`);

  if (user_id) {
    await User.findByIdAndUpdate(user_id, { socket_id: socket.id });
  }

  // We can write our socket event listeners in here...
  socket.on('friend_request', async (data) => {
    console.log(data.to);

    const to = await User.findById(data.to).select('socket_id');

    // create a friend request
    // emit event request received to recipient
    io.to(to.socket_id).emit('new_friend_request', {
      message: 'Here we can pass some data',
    });
  });
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
