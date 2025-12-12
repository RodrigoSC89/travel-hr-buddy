/**
 * useNotificationCenter Hook
 * 
 * Main hook for accessing notification center functionality
 */

import { useNotificationCenterContext } from "../NotificationCenterContext";

export const useNotificationCenter = () => {
  return useNotificationCenterContext();
};
