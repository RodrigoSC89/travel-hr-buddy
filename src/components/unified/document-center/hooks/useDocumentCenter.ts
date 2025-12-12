/**
 * useDocumentCenter Hook
 * 
 * Main hook for accessing document center functionality
 */

import { useDocumentCenterContext } from "../DocumentCenterContext";

export const useDocumentCenter = () => {
  return useDocumentCenterContext();
};
