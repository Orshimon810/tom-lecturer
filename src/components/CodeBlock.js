import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AceEditor from 'react-ace';
import ace from 'ace-builds/src-noconflict/ace'; // Import Ace core
import 'ace-builds/src-noconflict/mode-javascript'; // Import JavaScript mode
import 'ace-builds/src-noconflict/theme-monokai'; // Import Monokai theme
import 'ace-builds/webpack-resolver'; // This helps resolve Ace modules

// Configure Ace to use the custom worker URL
ace.config.setModuleUrl('ace/mode/javascript_worker', '/worker-javascript.js');

const CodeBlock = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState('student'); // Default role is student
  const [code, setCode] = useState('');

  useEffect(() => {
    // Simulate fetching code block data from a server
    const fetchCodeBlock = () => {
      const initialCode = `// This is the code block for ID: ${id}\nfunction example() {\n  console.log('Hello, world!');\n}`;
      setCode(initialCode);

      // Assume the first visitor is Tom, so they are the mentor
      if (!localStorage.getItem(`mentor_${id}`)) {
        localStorage.setItem(`mentor_${id}`, 'Tom');
        setRole('mentor');
      } else {
        setRole('student');
      }
    };

    fetchCodeBlock();
  }, [id]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const handleLeavePage = () => {
    if (role === 'mentor') {
      localStorage.removeItem(`mentor_${id}`);
    }
    navigate('/');
  };

  return (
    <div>
      <h1>Code Block {id}</h1>
      <p>Role: {role}</p>
      <AceEditor
        mode="javascript"
        theme="monokai"
        value={code}
        onChange={handleCodeChange}
        readOnly={role === 'mentor'}
        name="code-editor"
        editorProps={{ $blockScrolling: true }}
        width="100%"
        height="400px"
      />
      <button onClick={handleLeavePage}>Leave</button>
    </div>
  );
};

export default CodeBlock;
