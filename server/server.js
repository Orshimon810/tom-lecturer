const express = require('express');
const dotenv = require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const CodeBlock = require('./models/CodeBlock');

const app = express();
const server = http.createServer(app);

// Manually setting CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://tom-lecturer.vercel.app'); // Allow Vercel domain
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Setup CORS
app.use(cors({
  origin: 'https://tom-lecturer.vercel.app', // Vercel frontend URL
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Log MongoDB URI to verify it's loaded correctly
console.log("MongoDB URI:", process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB Atlas:', err);
  });

// Setup Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin: 'https://tom-lecturer.vercel.app', // Vercel frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

let mentors = {}; // Track mentors by code block ID
let studentCounts = {}; // Track the number of students in each code block

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinCodeBlock', async (codeBlockId) => {
    console.log(`Received codeBlockId: ${codeBlockId}`);

    let role;

    if (!mentors[codeBlockId]) {
      mentors[codeBlockId] = socket.id;
      role = 'mentor';
      studentCounts[codeBlockId] = 0; 
    } else {
      role = 'student';
      studentCounts[codeBlockId] = (studentCounts[codeBlockId] || 0) + 1;
    }

    socket.emit('roleAssigned', role);
    socket.join(codeBlockId);

    // Perform the database query
    const codeBlock = await CodeBlock.findOne({ blockId: codeBlockId });

    if (codeBlock) {
      socket.emit('codeUpdate', codeBlock.code);
      // Send the name of the code block along with the update
      socket.emit('blockNameUpdate', codeBlock.name);
    } else {
      console.error(`No code block found for ID: ${codeBlockId}`);
    }

    io.to(codeBlockId).emit('updateStudentCount', studentCounts[codeBlockId]);

    socket.on('codeChange', async (newCode) => {
      await CodeBlock.updateOne({ blockId: codeBlockId }, { code: newCode });

      // Normalize both newCode and solution by removing all extra spaces but ensuring at least one space between keywords
      const normalizeCode = (code) => code.replace(/function\s+/g, 'function ').replace(/\s+/g, '').toLowerCase();
      const normalizedNewCode = normalizeCode(newCode);
      const normalizedSolution = normalizeCode(codeBlock.solution);

      console.log('Normalized newCode:', normalizedNewCode);
      console.log('Normalized solution:', normalizedSolution);

      if (normalizedNewCode === normalizedSolution) {
        console.log('Solution matched!');
        io.to(codeBlockId).emit('solutionMatched');
      } else {
        console.log('No match yet.');
      }

      io.to(codeBlockId).emit('codeUpdate', newCode);
    });

    socket.on('disconnect', async () => {
      console.log('A user disconnected:', socket.id);

      if (mentors[codeBlockId] === socket.id) {
        delete mentors[codeBlockId];

        const initialCode = codeBlock.initialCode;

        await CodeBlock.updateOne(
          { blockId: codeBlockId },
          { code: initialCode }
        );

        io.to(codeBlockId).emit('mentorLeft', initialCode);
      } else {
        studentCounts[codeBlockId] = Math.max(0, (studentCounts[codeBlockId] || 1) - 1);
        io.to(codeBlockId).emit('updateStudentCount', studentCounts[codeBlockId]);
      }
    });
  });
});

// API to fetch code blocks
app.get('/api/codeblocks', async (req, res) => {
  try {
    const codeBlocks = await CodeBlock.find({});
    res.json(codeBlocks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching code blocks' });
  }
});

// Start server
server.listen(3001, () => {
  console.log('Server is running on port 3001');
});
