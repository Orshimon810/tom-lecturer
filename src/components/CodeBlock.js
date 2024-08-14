import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AceEditor from 'react-ace';
import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/webpack-resolver';
import { io } from 'socket.io-client';

ace.config.setModuleUrl('ace/mode/javascript_worker', '/worker-javascript.js');

const CodeBlock = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [code, setCode] = useState('');
  const [studentCount, setStudentCount] = useState(0);
  const socketRef = React.useRef(null);

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    socketRef.current = socket;

    // Join the specific code block
    socket.emit('joinCodeBlock', id);

    // Receive the role assigned by the server
    socket.on('roleAssigned', (assignedRole) => {
      setRole(assignedRole);
      console.log(`Assigned role: ${assignedRole} for code block ${id}`);
    });

    // Receive the latest code when joining
    socket.on('codeUpdate', (newCode) => {
      setCode(newCode);
    });

    // Update the student count
    socket.on('updateStudentCount', (count) => {
      setStudentCount(count);
    });

    socket.on('mentorLeft', () => {
      alert('The mentor has left the session. Redirecting to the lobby.');
      navigate('/');
    });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, [id, navigate]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socketRef.current.emit('codeChange', newCode); // Emit the code change to the server
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
      <p>Students in the room: {studentCount}</p>
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
