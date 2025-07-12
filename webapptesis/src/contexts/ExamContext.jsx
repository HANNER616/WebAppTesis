// src/contexts/ExamContext.js
import { createContext, useState } from 'react';

export const ExamContext = createContext();

export function ExamProvider({ children }) {
  const [examActive, setExamActive] = useState(false);
  return (
    <ExamContext.Provider value={{ examActive, setExamActive }}>
      {children}
    </ExamContext.Provider>
  );
}

