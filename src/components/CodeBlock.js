import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AceEditor from 'react-ace';
import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/webpack-resolver';
import { io } from 'socket.io-client';
import debounce from 'lodash/debounce'; // Import debounce from lodash

ace.config.setModuleUrl('ace/mode/javascript_worker', '/worker-javascript.js');

const CodeBlock = () => {
  const { id } = useParams(); // Get the blockId from the URL parameters
  const navigate = useNavigate();
  const [role, setRole] = useState('student'); // Default role is student
  const [code, setCode] = useState(''); // The code displayed in the editor
  const [studentCount, setStudentCount] = useState(0); // Track the number of students
  const [showSmiley, setShowSmiley] = useState(false); // Show smiley when code matches the solution
  const socketRef = React.useRef(null); // Store the socket connection

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.emit('joinCodeBlock', id);

    socket.on('roleAssigned', (assignedRole) => {
      setRole(assignedRole);
    });

    socket.on('codeUpdate', (newCode) => {
      setCode(newCode);
    });

    socket.on('updateStudentCount', (count) => {
      setStudentCount(count);
    });

    // Listen for the solutionMatched event
    socket.on('solutionMatched', () => {
      setShowSmiley(true);
    });

    socket.on('mentorLeft', () => {
      alert('The mentor has left the session. Redirecting to the lobby.');
      navigate('/');
    });

    return () => {
      socket.disconnect();
    };
  }, [id, navigate]);

  // Handle code changes with debouncing
  const handleCodeChange = useCallback(debounce((newCode) => {
    setCode(newCode);
    setShowSmiley(false); // Hide the smiley face if the code changes
    socketRef.current.emit('codeChange', newCode);
  }, 300), []); // Adjust the debounce delay (in ms) as necessary

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
      <p>Students in the room: {studentCount}</p>
      {showSmiley && <div style={{ fontSize: '100px', color: 'green' }}>😊</div>}
      <AceEditor
        mode="javascript"
        theme="monokai"
        value={code}
        onChange={handleCodeChange}
        readOnly={role === 'mentor'} // Make the code read-only for the mentor
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
