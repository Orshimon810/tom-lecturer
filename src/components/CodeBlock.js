import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AceEditor from 'react-ace';
import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/webpack-resolver';
import { io } from 'socket.io-client';
import debounce from 'lodash/debounce';
import '../styles/CodeBlock.css';

ace.config.setModuleUrl('ace/mode/javascript_worker', '/worker-javascript.js');

const CodeBlock = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [code, setCode] = useState('');
  const [blockName, setBlockName] = useState(''); // New state for block name
  const [studentCount, setStudentCount] = useState(0);
  const [showSmiley, setShowSmiley] = useState(false);
  const socketRef = React.useRef(null);

  useEffect(() => {
    const socket = io('https://jslecturer-639a06a0d162.herokuapp.com/', {
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

    socket.on('blockNameUpdate', (name) => {
      setBlockName(name); // Update block name when received
    });

    socket.on('updateStudentCount', (count) => {
      setStudentCount(count);
    });

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

  const handleCodeChange = debounce((newCode) => {
    setCode(newCode);
    setShowSmiley(false);
    socketRef.current.emit('codeChange', newCode);
  }, 300);

  const handleLeavePage = () => {
    if (role === 'mentor') {
      localStorage.removeItem(`mentor_${id}`);
    }
    navigate('/');
  };

  return (
    <div className="codeblock-container">
      <h1 className="codeblock-header">Code Block: {blockName}</h1> {/* Display the block name */}
      <p className="codeblock-role">Role: {role}</p>
      <p>Students in the room: {studentCount}</p>
      {showSmiley && <div className="smiley">😊</div>}
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
        className="codeblock-editor"
      />
       <button className="leave-button" onClick={handleLeavePage}>Leave</button>
    </div>
  );
};

export default CodeBlock;
