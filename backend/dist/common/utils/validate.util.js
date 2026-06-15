"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtil = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ValidationUtil {
    static async validateDto(cls, plainObject, options = {}) {
        const { transformOptions = { enableImplicitConversion: true }, whitelist = true, forbidNonWhitelisted = true, } = options;
        const instance = (0, class_transformer_1.plainToInstance)(cls, plainObject, transformOptions);
        const errors = await (0, class_validator_1.validate)(instance, {
            whitelist,
            forbidNonWhitelisted,
        });
        if (errors.length > 0) {
            const messages = errors
                .map((error) => {
                return Object.values(error.constraints || {}).join(', ');
            })
                .join('; ');
            throw new Error(`Validation failed: ${messages}`);
        }
        return instance;
    }
}
exports.ValidationUtil = ValidationUtil;
//# sourceMappingURL=validate.util.js.map