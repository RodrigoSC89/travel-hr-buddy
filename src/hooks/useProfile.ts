/**
 * DEPRECATED: Use @/hooks/unified instead
 * This file re-exports from the unified module for backward compatibility
 */

export { 
  useProfile, 
  useUserProfile,
  type UserProfile as Profile,
} from "@/hooks/unified/useUserProfile";

export default function useProfile() {
  const { useUserProfile } = require("@/hooks/unified/useUserProfile");
  return useUserProfile();
}
