export interface RelayState {
  relay1: number; // 0 = OFF, 1 = ON
  relay2: number;
  relay3: number;
  relay4: number;
}

export interface SensorState {
  temperature: number;
  humidity: number;
}

export interface IoTData {
  relay: RelayState;
  sensor: SensorState;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "voice";
}

export interface FirebaseConnectionConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}
