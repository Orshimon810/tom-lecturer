const mongoose = require('mongoose');
const CodeBlock = require('./models/CodeBlock');

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://orshimondev:mPuSOoRvhMOeNwAQ@jslecturer.isjqr.mongodb.net/jslecturer?retryWrites=true&w=majority')
  .then(async () => {
    console.log('Connected to MongoDB Atlas');

    // Clear existing code blocks
    await CodeBlock.deleteMany({});
    
    // Define the code blocks with name, initial code, current code, and solution
    const codeBlocks = [
      {
        blockId: '1',
        name: 'Async Case',
        initialCode: "// Initial code for block 1",
        code: "// Initial code for block 1\nfunction example() { console.log('Hello, world!'); }",
        solution: "function example() { console.log('Hello, world!'); }"
      },
      {
        blockId: '2',
        name: 'Promises',
        initialCode: "// Initial code for block 2",
        code: "// Initial code for block 2\nfunction add(a, b) { return a + b; }",
        solution: "function add(a, b) { return a + b; }"
      },
      {
        blockId: '3',
        name: 'Event Loop',
        initialCode: "// Initial code for block 3",
        code: "// Initial code for block 3\nfunction multiply(a, b) { return a * b; }",
        solution: "function multiply(a, b) { return a * b; }"
      },
      {
        blockId: '4',
        name: 'Closure',
        initialCode: "// Initial code for block 4",
        code: "// Initial code for block 4\nfunction subtract(a, b) { return a - b; }",
        solution: "function subtract(a, b) { return a - b; }"
      },
      {
        blockId: '5',
        name: 'Callbacks',
        initialCode: "// Initial code for block 5",
        code: "// Initial code for block 5\nfunction fetchData(callback) { setTimeout(() => callback('Data fetched'), 1000); }",
        solution: "function fetchData(callback) { setTimeout(() => callback('Data fetched'), 1000); }"
      }
      
    ];

    // Populate the database
    await CodeBlock.insertMany(codeBlocks);

    console.log('Database populated with initial code blocks');
    console.log('All code blocks in the database:');
    console.log(await CodeBlock.find({}));

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB Atlas', err);
  });
