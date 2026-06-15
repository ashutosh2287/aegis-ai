import { ClassTransformOptions } from 'class-transformer';
export declare class ValidationUtil {
    static validateDto<T extends object>(cls: new () => T, plainObject: Record<string, any>, options?: {
        transformOptions?: ClassTransformOptions;
        whitelist?: boolean;
        forbidNonWhitelisted?: boolean;
    }): Promise<T>;
}
