/* eslint-disable no-undef */
export class Logger {
    private readonly isDev = process.env.NODE_ENV === 'development'

    info(message: string, data?: unknown): void {
        console.log(`[INFO] ${message}`, data ?? '')
    }

    warn(message: string, data?: unknown): void {
        console.warn(`[WARN] ${message}`, data ?? '')
    }

    error(message: string, error?: unknown): void {
        console.error(`[ERROR] ${message}`, error ?? '')
    }

    debug(message: string, data?: unknown): void {
        if (this.isDev) {
            console.debug(`[DEBUG] ${message}`, data ?? '')
        }
    }
}