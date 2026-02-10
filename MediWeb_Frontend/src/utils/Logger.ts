import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Use the same base URL logic or import from config if possible (avoid circular)
// For simplicity, we'll replicate the localhost logic or rely on a known constant
const getApiBaseUrl = () => {
    // If env var is set and not localhost, use it
    if (process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes("localhost")) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    // Android emulator
    if (Platform.OS === "android") {
        return "http://10.0.2.2:8080";
    }
    // iOS/Web
    return "http://localhost:8080";
};

const API_Base = getApiBaseUrl();
const LOG_ENDPOINT = `${API_Base}/api/logs`;
const CRASH_KEY = 'APP_CRASH_REPORT_PENDING';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

interface LogPayload {
    level: LogLevel;
    message: string;
    stackTrace?: string;
    additionalInfo?: string;
    deviceInfo?: string; // stringified JSON
    timestamp: string;
}

declare var ErrorUtils: any;

class LoggerService {
    private isInitialized = false;

    public async init() {
        if (this.isInitialized) return;

        this.setupGlobalErrorHandler();
        await this.checkPreviousCrash();

        this.isInitialized = true;
        console.log('✅ [Logger] Initialized');
    }

    private setupGlobalErrorHandler() {
        const defaultHandler = (ErrorUtils as any).getGlobalHandler ? (ErrorUtils as any).getGlobalHandler() : null;

        (ErrorUtils as any).setGlobalHandler(async (error: any, isFatal: boolean) => {
            console.error('🚨 [Global Error Handler] Caught crash:', error);

            // Prepare crash report
            const crashReport: LogPayload = {
                level: 'FATAL',
                message: error.message || 'Unknown Crash',
                stackTrace: error.componentStack || error.stack || '',
                deviceInfo: this.getDeviceInfo(),
                timestamp: new Date().toISOString(),
            };

            try {
                // Persist crash report to send it on next launch
                await AsyncStorage.setItem(CRASH_KEY, JSON.stringify(crashReport));
                console.log('💾 Crash report saved to storage.');
            } catch (e) {
                console.error('Failed to save crash report:', e);
            }

            // Chain back to default handler (which usually crashes/closes the app)
            if (defaultHandler) {
                defaultHandler(error, isFatal);
            } else {
                // Fallback if no default handler
                console.error('No default global handler found, app may close.');
            }
        });

        // Handle Unhandled Promise Rejections
        // Note: React Native's support for this varies. 
        // In newer versions, we can rely on 'unhandledrejection' event on global
        const globalAny = global as any;
        if (globalAny.Promise) {
            // Some RN environments support tracking unhandled rejections
            // This is a simplified approach
        }
    }

    private getDeviceInfo(): string {
        return JSON.stringify({
            os: Platform.OS,
            version: Platform.Version,
            model: Device.modelName,
            brand: Device.brand,
            isDevice: Device.isDevice
        });
    }

    private async checkPreviousCrash() {
        try {
            const crashData = await AsyncStorage.getItem(CRASH_KEY);
            if (crashData) {
                console.log('🔍 Found pending crash report, sending to server...');
                const payload = JSON.parse(crashData);

                // Attempt to send
                const success = await this.sendToServer(payload);

                if (success) {
                    console.log('✅ Crash report sent successfully.');
                    await AsyncStorage.removeItem(CRASH_KEY);
                } else {
                    console.warn('⚠️ Failed to send crash report, will retry next time.');
                }
            }
        } catch (e) {
            console.error('Error checking previous crash:', e);
        }
    }

    public async log(level: LogLevel, message: string, details?: any) {
        // 1. Console log for Dev
        const prefix = `[${level}]`;
        if (level === 'ERROR' || level === 'FATAL') {
            console.error(prefix, message, details || '');
        } else if (level === 'WARN') {
            console.warn(prefix, message, details || '');
        } else {
            console.log(prefix, message, details || '');
        }

        // 2. Send to backend
        const payload: LogPayload = {
            level,
            message,
            additionalInfo: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : undefined,
            deviceInfo: this.getDeviceInfo(),
            timestamp: new Date().toISOString(),
        };

        // Don't await this to avoid blocking UI, unless critical
        this.sendToServer(payload).catch(err => {
            if (__DEV__) console.log('Failed to send log to server:', err);
        });
    }

    private async sendToServer(payload: LogPayload): Promise<boolean> {
        try {
            const response = await fetch(LOG_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            return response.ok;
        } catch (error) {
            // Don't log this error with Logger.error to avoid infinite loop
            // console.error('Network error sending log:', error);
            return false;
        }
    }

    // Convenience methods
    public info(message: string, details?: any) { this.log('INFO', message, details); }
    public warn(message: string, details?: any) { this.log('WARN', message, details); }
    public error(message: string, details?: any) { this.log('ERROR', message, details); }
}

export const Logger = new LoggerService();
