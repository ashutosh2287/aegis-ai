import { ClassTransformOptions, plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";

export class ValidationUtil {
  /**
   * Validate a plain object against a class-validator DTO class
   * @param cls - The DTO class to validate against
   * @param plainObject - The plain object to validate
   * @param options - Options for class-transformer and class-validator
   * @returns Instance of cls with validated and transformed properties
   * @throws Error if validation fails
   */
  static async validateDto<T extends object>(
    cls: new () => T,
    plainObject: Record<string, any>,
    options: {
      transformOptions?: ClassTransformOptions;
      whitelist?: boolean;
      forbidNonWhitelisted?: boolean;
    } = {},
  ): Promise<T> {
    const {
      transformOptions = { enableImplicitConversion: true },
      whitelist = true,
      forbidNonWhitelisted = true,
    } = options;

    const instance = plainToInstance(cls, plainObject, transformOptions);
    const errors: ValidationError[] = await validate(instance, {
      whitelist,
      forbidNonWhitelisted,
    });

    if (errors.length > 0) {
      const messages = errors
        .map((error) => {
          return Object.values(error.constraints || {}).join(", ");
        })
        .join("; ");
      throw new Error(`Validation failed: ${messages}`);
    }

    return instance;
  }
}
