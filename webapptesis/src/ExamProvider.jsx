// src/contexts/ExamProvider.jsx
import React, { useState } from 'react';
import { ExamContext } from './ExamContext';

export function ExamProvider({ children }) {
  const [examActive, setExamActive] = useState(false);
  return (
    <ExamContext.Provider value={{ examActive, setExamActive }}>
      {children}
    </ExamContext.Provider>
  );
}
