import { DeviceEventEmitter } from "react-native";

export const AUTH_EVENTS = {
    LOGOUT: "auth:logout"
};

export const emitLogout = () => {
    DeviceEventEmitter.emit(AUTH_EVENTS.LOGOUT);
};

