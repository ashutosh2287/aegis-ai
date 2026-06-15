"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DifficultyLevel = exports.MovementPattern = void 0;
var MovementPattern;
(function (MovementPattern) {
    MovementPattern["Squat"] = "squat";
    MovementPattern["Hinge"] = "hinge";
    MovementPattern["Lunge"] = "lunge";
    MovementPattern["Push"] = "push";
    MovementPattern["Pull"] = "pull";
    MovementPattern["Rotation"] = "rotation";
    MovementPattern["AntiRotation"] = "anti_rotation";
    MovementPattern["Carry"] = "carry";
    MovementPattern["Walk"] = "walk";
    MovementPattern["Jump"] = "jump";
    MovementPattern["Throw"] = "throw";
    MovementPattern["Core"] = "core";
})(MovementPattern || (exports.MovementPattern = MovementPattern = {}));
var DifficultyLevel;
(function (DifficultyLevel) {
    DifficultyLevel["Beginner"] = "beginner";
    DifficultyLevel["Intermediate"] = "intermediate";
    DifficultyLevel["Advanced"] = "advanced";
})(DifficultyLevel || (exports.DifficultyLevel = DifficultyLevel = {}));
//# sourceMappingURL=database.enums.js.map