const mongoose = require('mongoose');

const CodeBlockSchema = new mongoose.Schema({
  blockId: { type: String, required: true, unique: true },
  name: { type: String, required: true },  
  initialCode: { type: String, required: true },
  code: { type: String, required: true },
  solution: { type: String, required: true },
});

const CodeBlock = mongoose.model('CodeBlock', CodeBlockSchema);

module.exports = CodeBlock;
