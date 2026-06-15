"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncWrapper = asyncWrapper;
exports.asyncThrow = asyncThrow;
async function asyncWrapper(promise) {
    try {
        const data = await promise;
        return [null, data];
    }
    catch (error) {
        return [error, null];
    }
}
async function asyncThrow(promise) {
    return promise;
}
//# sourceMappingURL=async.util.js.map