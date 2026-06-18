import { UserProfile } from "../auth/interfaces/auth.interface";

declare global {
  namespace Express {
    // Extend the existing Express.User interface with the properties from UserProfile
    interface User extends UserProfile {}
  }
}
