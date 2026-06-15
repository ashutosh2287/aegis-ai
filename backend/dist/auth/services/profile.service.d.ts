import { SupabaseService } from '../../supabase/supabase.service';
import { UserProfile } from '../interfaces/auth.interface';
export declare class ProfileService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    createProfile(profileData: Partial<UserProfile>): Promise<UserProfile>;
    getProfile(userId: string): Promise<UserProfile>;
    updateProfile(userId: string, updateData: Partial<UserProfile>): Promise<UserProfile>;
}
