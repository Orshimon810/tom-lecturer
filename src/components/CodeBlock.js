import React from 'react';
import { useParams } from 'react-router-dom';

const CodeBlock = () => {
  const { id } = useParams();
  return (
    <div>
      <h1>Code Block {id}</h1>
      <p>This is where the code editor will be.</p>
    </div>
  );
};

export default CodeBlock;
