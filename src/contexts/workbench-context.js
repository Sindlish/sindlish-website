'use client';
import { createContext, useContext } from 'react';

export const WorkbenchContext = createContext(null);
export function useWorkbench() {
  return useContext(WorkbenchContext);
}
export default WorkbenchContext;
