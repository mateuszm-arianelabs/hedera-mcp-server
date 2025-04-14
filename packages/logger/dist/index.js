"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
class Logger {
    static getTimestamp() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
    static formatMessage(level, color, message, ...optionalParams) {
        const timestamp = this.getTimestamp();
        console.log(`${chalk_1.default.gray('[' + timestamp + ']')} ${color(level.toUpperCase())}: ${message}`, ...optionalParams);
    }
    static log(message, ...optionalParams) {
        this.formatMessage('log', chalk_1.default.blue, message, ...optionalParams);
    }
    static error(message, ...optionalParams) {
        this.formatMessage('error', chalk_1.default.red, message, ...optionalParams);
    }
    static warn(message, ...optionalParams) {
        this.formatMessage('warn', chalk_1.default.yellow, message, ...optionalParams);
    }
    static debug(message, ...optionalParams) {
        // Debug logs might be styled differently or only shown in development
        this.formatMessage('debug', chalk_1.default.magenta, message, ...optionalParams);
    }
}
exports.Logger = Logger;
