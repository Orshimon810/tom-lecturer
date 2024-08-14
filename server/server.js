const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

let mentors = {}; // Track mentors by code block ID
let codeBlocks = {}; // Track the current code state by code block ID

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinCodeBlock', (codeBlockId) => {
    let role;

    // Check if a mentor has already been assigned for this code block
    if (!mentors[codeBlockId]) {
      mentors[codeBlockId] = socket.id;
      role = 'mentor';
    } else {
      role = 'student';
    }

    // Send the role to the client
    socket.emit('roleAssigned', role);

    // Join the socket room specific to this code block
    socket.join(codeBlockId);

    // Send the latest code to the new user
    if (codeBlocks[codeBlockId]) {
      socket.emit('codeUpdate', codeBlocks[codeBlockId]);
    }

    socket.on('codeChange', (data) => {
      // Store the latest code in the codeBlocks object
      codeBlocks[codeBlockId] = data;

      // Broadcast to all clients in the same code block except the sender
      socket.to(codeBlockId).emit('codeUpdate', data);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);

      // If the mentor disconnects, remove them from the mentors object and notify students
      if (mentors[codeBlockId] === socket.id) {
        delete mentors[codeBlockId];
        io.to(codeBlockId).emit('mentorLeft');
      }
    });
  });
});

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});
