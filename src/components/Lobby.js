import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Lobby.css'; 

const Lobby = () => {
  const navigate = useNavigate();
  const [codeBlocks, setCodeBlocks] = useState([]);

  useEffect(() => {
    const fetchCodeBlocks = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/codeblocks');
        const data = await response.json();
        setCodeBlocks(data);
      } catch (error) {
        console.error('Error fetching code blocks:', error);
      }
    };

    fetchCodeBlocks();
  }, []);

  const handleCodeBlockClick = (id) => {
    navigate(`/codeblock/${id}`);
  };

  return (
    <div className="lobby-container">
      <h1 className="lobby-header">Choose Code Block</h1>
      <ul className="code-block-list">
        {codeBlocks.map((block) => (
          <li key={block._id} className="code-block-item">
            <button onClick={() => handleCodeBlockClick(block.blockId)}>
              {block.name} {/* Display the name of the code block */}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
