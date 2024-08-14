import React from 'react';
import { useNavigate } from 'react-router-dom';

const Lobby = () => {
  const navigate = useNavigate();

  const codeBlocks = [
    { id: 1, name: 'Async Case' },
    { id: 2, name: 'Promises' },
    { id: 3, name: 'Event Loop' },
    { id: 4, name: 'Closure' },
  ];

  const handleCodeBlockClick = (id) => {
    navigate(`/codeblock/${id}`);
  };

  return (
    <div>
      <h1>Choose code block</h1>
      <ul>
        {codeBlocks.map((block) => (
          <li key={block.id}>
            <button onClick={() => handleCodeBlockClick(block.id)}>
              {block.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
