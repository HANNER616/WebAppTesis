// src/contexts/ExamContext.js
import { createContext, useContext } from 'react';

export const ExamContext = createContext();

// (opcional) helper hook
export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error('useExam debe usarse dentro de <ExamProvider>');
  return ctx;
}