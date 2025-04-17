import chalk from 'chalk';
export class Logger {
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
        console.log(`${chalk.gray('[' + timestamp + ']')} ${color(level.toUpperCase())}: ${message}`, ...optionalParams);
    }
    static log(message, ...optionalParams) {
        this.formatMessage('log', chalk.blue, message, ...optionalParams);
    }
    static error(message, ...optionalParams) {
        this.formatMessage('error', chalk.red, message, ...optionalParams);
    }
    static warn(message, ...optionalParams) {
        this.formatMessage('warn', chalk.yellow, message, ...optionalParams);
    }
    static debug(message, ...optionalParams) {
        // Debug logs might be styled differently or only shown in development
        this.formatMessage('debug', chalk.magenta, message, ...optionalParams);
    }
}
