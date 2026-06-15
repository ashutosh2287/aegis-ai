"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let ProfileService = class ProfileService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async createProfile(profileData) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('profiles')
            .insert(profileData)
            .select()
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to create profile: ${error.message}`);
        }
        if (!data) {
            throw new common_1.InternalServerErrorException('Profile not created');
        }
        return data;
    }
    async getProfile(userId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to fetch profile: ${error.message}`);
        }
        if (!data) {
            throw new common_1.InternalServerErrorException('Profile not found');
        }
        return data;
    }
    async updateProfile(userId, updateData) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('profiles')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(`Failed to update profile: ${error.message}`);
        }
        if (!data) {
            throw new common_1.InternalServerErrorException('Profile not found or not updated');
        }
        return data;
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map