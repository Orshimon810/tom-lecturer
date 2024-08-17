const express = require('express');
const dotenv = require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const CodeBlock = require('./models/CodeBlock');
const path = require('path');
const app = express();
const server = http.createServer(app);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));


app.use(cors({
  origin: `${process.env.REACT_APP_FRONTEND_URL}`,
  methods: ['GET', 'POST'],
  credentials: true,
}));


mongoose.connect('mongodb+srv://orshimondev:mPuSOoRvhMOeNwAQ@jslecturer.isjqr.mongodb.net/jslecturer')
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB Atlas:', err);
  });

  const io = new Server(server, {
    cors: {
      origin: `${process.env.REACT_APP_FRONTEND_URL}`,
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
      
        // Normalize both newCode and solution by removing all spaces and converting to lowercase
        const normalizedNewCode = newCode.replace(/\s+/g, '').toLowerCase();
        const normalizedSolution = codeBlock.solution.replace(/\s+/g, '').toLowerCase();
      
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

app.get('/api/codeblocks', async (req, res) => {
  try {
    const codeBlocks = await CodeBlock.find({});
    res.json(codeBlocks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching code blocks' });
  }
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});


const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log('Server is running on port 3001');
});
