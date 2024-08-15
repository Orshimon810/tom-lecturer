const express = require('express');
const dotenv = require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const CodeBlock = require('./models/CodeBlock');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));

mongoose.connect('mongodb+srv://orshimondev:mPuSOoRvhMOeNwAQ@jslecturer.isjqr.mongodb.net/jslecturer?retryWrites=true&w=majority')
  .then(async () => {
    console.log('Connected to MongoDB Atlas');})


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
let studentCounts = {}; // Track the number of students in each code block

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
  
    socket.on('joinCodeBlock', async (codeBlockId) => {
      console.log(`Received codeBlockId: ${codeBlockId}`);
      console.log(`Type of codeBlockId: ${typeof codeBlockId}`);
  
      // Direct comparison with hardcoded value
      console.log('Comparing codeBlockId with "1":', Object.is(codeBlockId, "1"));
  
      // Log the query being made
      console.log('Querying database with:', { blockId: codeBlockId });
  
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
  
      console.log('Result of the query:', codeBlock);
  
      if (codeBlock) {
        socket.emit('codeUpdate', codeBlock.code);
      } else {
        console.error(`No code block found for ID: ${codeBlockId}`);
      }
  
      io.to(codeBlockId).emit('updateStudentCount', studentCounts[codeBlockId]);
  
      socket.on('codeChange', async (newCode) => {
        await CodeBlock.updateOne({ blockId: codeBlockId }, { code: newCode });
      
        console.log('newCode:', newCode);
        console.log('solution:', codeBlock.solution);
      
        // Normalize both newCode and solution
        const normalizedNewCode = newCode.replace(/\s+/g, ' ').trim();
        const normalizedSolution = codeBlock.solution.replace(/\s+/g, ' ').trim();
      
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
          // Mentor is leaving
          delete mentors[codeBlockId];
      
          // Retrieve the initial code template for this block
          const initialCode = codeBlock.initialCode;
      
          // Reset the code in the database to the initial template
          await CodeBlock.updateOne(
            { blockId: codeBlockId },
            { code: initialCode }
          );
      
          // Notify all users that the mentor has left and reset the code
          io.to(codeBlockId).emit('mentorLeft', initialCode);
        } else {
          // A student is leaving
          studentCounts[codeBlockId] = Math.max(0, (studentCounts[codeBlockId] || 1) - 1);
          io.to(codeBlockId).emit('updateStudentCount', studentCounts[codeBlockId]);
        }
      });
      
      
    });
  });


server.listen(3001, () => {
  console.log('Server is running on port 3001');
});
