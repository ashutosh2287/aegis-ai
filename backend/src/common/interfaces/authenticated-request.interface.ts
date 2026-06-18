import { Request } from 'express';
import { UserProfile } from '@/auth/interfaces/auth.interface';

export interface AuthenticatedRequest extends Request {
  user: UserProfile;
}