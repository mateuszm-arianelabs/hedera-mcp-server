export declare class Logger {
    private static getTimestamp;
    private static formatMessage;
    static log(message: string, ...optionalParams: any[]): void;
    static error(message: string, ...optionalParams: any[]): void;
    static warn(message: string, ...optionalParams: any[]): void;
    static debug(message: string, ...optionalParams: any[]): void;
}
