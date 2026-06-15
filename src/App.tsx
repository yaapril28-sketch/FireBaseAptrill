import React, { useState, useEffect, useRef } from "react";
import { 
  AppWindow, 
  Cpu, 
  HardDrive, 
  Radio, 
  Database,
  Wifi,
  WifiOff,
  Terminal,
  Settings,
  HelpCircle,
  FileCode,
  LogOut
} from "lucide-react";

// Import modular sub-components
import DashboardTab from "./components/DashboardTab";
import SourceCodeTab from "./components/SourceCodeTab";
import HardwareTab from "./components/HardwareTab";
import LoginPage from "./components/LoginPage";
import { IoTData, LogEntry, FirebaseConnectionConfig } from "./types";

// Import Firebase Client libraries for React integrations
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set, Database as FirebaseDatabase } from "firebase/database";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";

// Define consistent Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBlpIk2pBFCzS-ZNzVwFLzYzgpDnAOV90o",
  authDomain: "aprilfirebase-70d0b.firebaseapp.com",
  projectId: "aprilfirebase-70d0b",
  storageBucket: "aprilfirebase-70d0b.firebasestorage.app",
  messagingSenderId: "735646932371",
  appId: "1:735646932371:web:f5b47b4908546e5a4f1c66"
};

// Initialize app & auth early
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(firebaseApp);

export default function App() {
  // Navigation Tabs: 'control' | 'source' | 'hardware'
  const [activeTab, setActiveTab] = useState<"control" | "source" | "hardware">("control");

  // IoT Realtime States
  const [relay, setRelay] = useState({
    relay1: 0,
    relay2: 0,
    relay3: 0,
    relay4: 0
  });

  const [sensor, setSensor] = useState({
    temperature: 30.0,
    humidity: 60
  });

  // Digital Clock and Date
  const [timeStr, setTimeStr] = useState("00:00:00");
  const [dateStr, setDateStr] = useState("Minggu, 14 Juni 2026");

  // Terminal Logs State
  const [logs, setLogs] = useState<Array<{ id: string; time: string; text: string; type: string }>>([
    { id: "init-1", time: "18:57:00", text: "Nexus IoT System loading core files...", type: "info" }
  ]);

  // Firebase Config & Connection States
  const [databaseURL, setDatabaseURL] = useState("https://aprilfirebase-70d0b-default-rtdb.asia-southeast1.firebasedatabase.app");
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMockMode, setIsMockMode] = useState(true);

  // Auth States definition
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Database Instance Reference
  const dbInstanceRef = useRef<FirebaseDatabase | null>(null);

  // Toast Notification State
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; desc: string; type: string }>>([]);

  // Log counter helper
  const logCounterRef = useRef(1);
  const toastCounterRef = useRef(1);

  // Function to push logs
  const addLog = (text: string, type: string = "info") => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("id-ID", { hour12: false });
    const logId = `log-${Date.now()}-${logCounterRef.current++}`;
    setLogs((prev) => [...prev, { id: logId, time: formattedTime, text, type }]);
  };

  // Function to push Toast
  const triggerToast = (title: string, desc: string, type: string = "info") => {
    const toastId = `toast-${Date.now()}-${toastCounterRef.current++}`;
    setToasts((prev) => [...prev, { id: toastId, title, desc, type }]);
    
    // Auto remove toast
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 3000);
  };

  // 1. Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("id-ID", { hour12: false }));
      
      const optionDates: Intl.DateTimeFormatOptions = { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      };
      setDateStr(now.toLocaleDateString("id-ID", optionDates));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auth listener effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        addLog(`Sesi pengguna terdeteksi: ${user.displayName || user.email}`, "success");
      } else {
        addLog("Menunggu otentikasi kredensial pengguna...", "info");
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-connect to Firebase Realtime Database upon login to ensure absolute convenience
  useEffect(() => {
    if (currentUser && databaseURL && !firebaseConnected && !isConnecting) {
      const t = setTimeout(() => {
        connectToFirebase();
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [currentUser]);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setFirebaseConnected(false);
      setIsMockMode(true);
      dbInstanceRef.current = null;
      triggerToast("Keluar Portal", "Kredensial dihapus secara aman dari session.", "info");
    } catch (err: any) {
      triggerToast("Gagal Keluar", err.message, "error");
    }
  };

  // 2. Clear Logs
  const clearLogs = () => {
    setLogs([]);
    addLog("Terminal log dibatalkan dan dibersihkan.", "info");
  };

  // 3. Lazy Firebase Initialization Connection
  const connectToFirebase = () => {
    if (!databaseURL.startsWith("https://") || databaseURL.includes("ISI_DATABASE_URL_FIREBASE")) {
      triggerToast("Konfigurasi Gagal", "Silakan masukkan URL Realtime Database Firebase yang valid.", "error");
      addLog("Masukan databaseURL tidak valid.", "warning");
      return;
    }

    setIsConnecting(true);
    addLog(`Menghubungkan ke: ${databaseURL}...`, "info");

    try {
      const app = getApps()[0] || firebaseApp;
      const database = getDatabase(app, databaseURL);
      dbInstanceRef.current = database;

      // Listen sensor node
      const sensorRef = ref(database, "sensor");
      onValue(sensorRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setSensor({
            temperature: parseFloat(val.temperature ?? 30.0),
            humidity: parseInt(val.humidity ?? 60)
          });
        }
      }, (err) => {
        addLog(`Gagal sync Sensor: ${err.message}`, "warning");
      });

      // Listen relay node
      const relayRef = ref(database, "relay");
      onValue(relayRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          // Check for change to trigger toast
          const relays = ["relay1", "relay2", "relay3", "relay4"] as const;
          relays.forEach((r) => {
            const oldVal = relay[r];
            const newVal = val[r] ?? 0;
            if (oldVal !== newVal) {
              const friendly = { 
                relay1: "Relay 1", 
                relay2: "Relay 2", 
                relay3: "Relay 3", 
                relay4: "Relay 4"
              }[r];
              triggerToast(`${friendly} Berubah`, `Status berubah menjadi ${newVal === 1 ? "ON" : "OFF"}.`, newVal === 1 ? "success" : "warning");
              addLog(`${friendly} berubah lewat Firebase Cloud: ${newVal === 1 ? "ON" : "OFF"}.`, "success");
            }
          });

          setRelay({
            relay1: val.relay1 ?? 0,
            relay2: val.relay2 ?? 0,
            relay3: val.relay3 ?? 0,
            relay4: val.relay4 ?? 0
          });

          setIsMockMode(false);
          setFirebaseConnected(true);
          setIsConnecting(false);
          addLog("Database Firebase terkoneksi dengan sukses!", "success");
          triggerToast("Firebase Connected", "Database Cloud tersinkronisasi offline-online.", "success");
        }
      }, (err) => {
        addLog(`Database error: ${err.message}`, "warning");
        setFirebaseConnected(false);
        setIsConnecting(false);
      });

    } catch (e: any) {
      addLog(`Koneksi crash: ${e.message}`, "warning");
      setIsConnecting(false);
      setFirebaseConnected(false);
    }
  };

  // Switch Relay status (Writes to firebase if enabled, otherwise offline sim)
  const setRelayState = (key: string, val: number) => {
    // 1. Offline Mode Update
    if (isMockMode || !dbInstanceRef.current) {
      setRelay((prev) => {
        const updated = { ...prev, [key]: val };
        const friendlyName = { 
          relay1: "Relay 1", 
          relay2: "Relay 2", 
          relay3: "Relay 3", 
          relay4: "Relay 4"
        }[key as "relay1" | "relay2" | "relay3" | "relay4"];
        addLog(`[Local Sim] ${friendlyName} diganti ke ${val === 1 ? "ON" : "OFF"}.`, "success");
        triggerToast(`${friendlyName} Switch`, `Berubah ke status ${val === 1 ? "ON" : "OFF"} (Offline).`, val === 1 ? "success" : "warning");
        return updated;
      });
      return;
    }

    // 2. Realtime Firebase Update
    const rRef = ref(dbInstanceRef.current, `relay/${key}`);
    set(rRef, val).catch((err) => {
      addLog(`Tulis gagal ke DB: ${err.message}`, "warning");
      triggerToast("Tulis DB Gagal", err.message, "error");
    });
  };

  // Set all relay outputs
  const setAllRelays = (val: number) => {
    if (isMockMode || !dbInstanceRef.current) {
      setRelay({ relay1: val, relay2: val, relay3: val, relay4: val });
      addLog(`[Local Sim] Master Switch: Semua relay diset ke ${val === 1 ? "ON" : "OFF"}.`, "success");
      triggerToast("Master Switch", `Semua perangkat dimutasi ke posisi ${val === 1 ? "ON" : "OFF"}.`, val === 1 ? "success" : "warning");
      return;
    }

    const updates = { relay1: val, relay2: val, relay3: val, relay4: val };
    set(ref(dbInstanceRef.current, "relay"), updates).catch((err) => {
      addLog(`Master Gagal: ${err.message}`, "warning");
    });
  };

  // Simulated dht slider update
  const writeSensorData = (temp: number, humi: number) => {
    setSensor({ temperature: temp, humidity: humi });
    
    if (isMockMode || !dbInstanceRef.current) {
      addLog(`[Local Sim] DHT sensor update: Suhu ${temp.toFixed(1)}°C, Humi ${humi}%`, "info");
      return;
    }

    set(ref(dbInstanceRef.current, "sensor"), {
      temperature: temp,
      humidity: humi
    }).catch((e) => {
      addLog(`Kirim sensor gagal: ${e.message}`, "warning");
    });
  };

  // Setup mock-connection loader on mounting
  useEffect(() => {
    const timer = setTimeout(() => {
      addLog("IoT NexHome systems successfully booted.", "success");
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (authLoading) {
    return (
      <div className="bg-[#050608] min-h-screen text-slate-200 font-sans flex flex-col items-center justify-center relative overflow-x-hidden select-none">
        {/* Cyber Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.003)_1px,_transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
        <div className="flex flex-col items-center gap-4 text-center mt-[-40px]">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center neon-border-cyan shadow-[0_0_20px_rgba(0,243,255,0.2)] animate-pulse">
            <Cpu className="text-cyan-400 w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-white font-orbitron animate-pulse">
            NEXUS<span className="text-cyan-400">SMART</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">
              OTENTIKASI CLOUD SECURE TUNNEL...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-[#050608] min-h-screen text-slate-200 font-sans flex flex-col relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Background neon elements */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/10 via-slate-950/5 to-transparent pointer-events-none" />
        {/* Cyber Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.003)_1px,_transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
        
        <LoginPage auth={auth} triggerToast={triggerToast} addLog={addLog} />
        
        {/* FLYOUT ABSOLUTE TOAST RENDERER */}
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none">
          {toasts.map((toast) => (
            <div 
              key={toast.id}
              className={`pointer-events-auto w-72 bg-slate-900/95 border-r border-t border-b border-l-4 rounded-xl p-4 shadow-xl shadow-black/40 flex items-start gap-3 animate-[slideIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forward] border-slate-800 ${
                toast.type === "success" ? "border-l-emerald-500" :
                toast.type === "warning" ? "border-l-amber-500" :
                toast.type === "error" ? "border-l-red-500" : "border-l-cyan-500"
              }`}
            >
              <div className="flex-1">
                <h4 className="text-[11px] font-bold font-orbitron text-slate-100 tracking-wide">{toast.title}</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-relaxed">{toast.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050608] min-h-screen text-slate-200 font-sans flex flex-col relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background neon elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/10 via-slate-950/5 to-transparent pointer-events-none" />
      
      {/* Cyber Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.003)_1px,_transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

      {/* APP HEADER */}
      <header className="glass-panel mx-6 sm:mx-8 my-6 px-8 py-5 rounded-2xl sticky top-4 z-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_15px_30px_-15px_rgba(0,0,0,0.8)]">
        
        {/* Title Logo Group */}
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500 w-10 h-10 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Cpu className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-white font-orbitron">
              NEXUS<span className="text-cyan-400">SMART</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-orbitron">
              IoT Control Interface v2.4
            </p>
          </div>
        </div>

        {/* Digital clock, date & state indicators */}
        <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
          
          {/* Time text readout */}
          <div className="text-left sm:text-right font-mono border-r border-white/5 pr-6 hidden sm:block">
            <div className="text-xl font-bold text-white tracking-widest leading-none">
              {timeStr}
            </div>
            <div className="text-[9px] text-cyan-400 mt-1 uppercase tracking-[0.25em] font-bold">
              {dateStr}
            </div>
          </div>

          {/* Connected state badges & User Info */}
          <div className="flex flex-col gap-1.5 text-right items-end justify-center">
            {/* User Profile Badge & Logout Button */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/20 pl-3 pr-1.5 py-1 rounded-lg text-[10px] font-bold text-slate-300 shadow-[0_0_10px_rgba(6,182,212,0.05)] mb-0.5">
                <span className="text-cyan-400 font-orbitron tracking-wide text-[9px] uppercase">
                  ACTIVE USER: {currentUser.displayName || currentUser.email?.split("@")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  title="Keluar dari Portal"
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1 rounded-md transition-all active:scale-95 cursor-pointer border border-red-500/20 flex items-center justify-center"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Firebase Active */}
            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-3 py-1 rounded-md text-[10px] font-bold uppercase text-slate-400">
              <span className={`w-2 h-2 rounded-full ${
                firebaseConnected ? "bg-green-500 animate-pulse" : 
                isConnecting ? "bg-amber-400 animate-pulse" : 
                "bg-amber-500"
              }`} />
              <span>
                {firebaseConnected ? "Firebase: Online" : 
                 isConnecting ? "Menghubungkan..." : 
                 "Mock Mode"}
              </span>
            </div>

            {/* Micro and systems status */}
            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-3 py-1 rounded-md text-[10px] font-bold uppercase text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>System: Active</span>
            </div>
          </div>

        </div>
      </header>

      {/* CORE SUB-BAR NAVIGATION FOR TABS & CREDENTIALS */}
      <div className="glass-panel mx-6 sm:mx-8 mb-6 px-6 py-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Navigation Selector Tabs */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab("control")}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold font-orbitron tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === "control"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 neon-border-cyan shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>DASHBOARD IOT</span>
          </button>


          <button
            onClick={() => {
              setActiveTab("source");
              addLog("Membuka Source Code Explorer.", "info");
            }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold font-orbitron tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === "source"
                ? "bg-pink-500/10 text-pink-400 border border-pink-500/30 neon-border-magenta shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>VS CODE PROJECT FILES</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("hardware");
              addLog("Membuka dokumentasi integrasi hardware ESP32.", "info");
            }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold font-orbitron tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === "hardware"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>ESP32 TUTORIAL & CODE</span>
          </button>
        </nav>

        {/* Database Live Input Connector Panel */}
        <div className="flex items-center gap-3 max-w-full md:max-w-md w-full md:w-auto">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Database className="w-4 h-4 text-cyan-500" />
            </span>
            <input 
              type="text"
              value={databaseURL}
              onChange={(e) => setDatabaseURL(e.target.value)}
              placeholder="Masukan URL Database Firebase..."
              className="bg-black/50 border border-white/10 font-mono text-xs rounded-xl pl-9 pr-3 py-2.5 w-full text-cyan-400 focus:outline-none focus:border-cyan-500/50 focus:bg-black/80 transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-cyan-500/20"
            />
          </div>
          <button 
            onClick={connectToFirebase}
            disabled={isConnecting}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold font-orbitron text-[11px] tracking-wider py-2.5 px-5 rounded-xl active:scale-95 transition-all text-center whitespace-nowrap cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50"
          >
            {isConnecting ? "MENGHUBUNG..." : "SAMBUNGKAN"}
          </button>
        </div>

      </div>

      {/* MAIN LAYOUT CANVAS CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 sm:px-8">
        
        {/* Render correct interface panel based on Tab Selection */}
        {activeTab === "control" && (
          <DashboardTab 
            relay={relay}
            sensor={sensor}
            setRelayState={setRelayState}
            setAllRelays={setAllRelays}
            writeSensorData={writeSensorData}
            firebaseConnected={firebaseConnected}
            isMockMode={isMockMode}
            databaseURL={databaseURL}
            setDatabaseURL={setDatabaseURL}
            connectToFirebase={connectToFirebase}
            logs={logs}
            addLog={addLog}
            clearLogs={clearLogs}
          />
        )}

        {activeTab === "source" && (
          <SourceCodeTab />
        )}

        {activeTab === "hardware" && (
          <HardwareTab />
        )}

      </main>

      {/* FLYOUT ABSOLUTE TOAST RENDERER */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`pointer-events-auto w-72 bg-slate-900/95 border-r border-t border-b border-l-4 rounded-xl p-4 shadow-xl shadow-black/40 flex items-start gap-3 animate-[slideIn_0.3s_cubic-bezier(0.16,1,0.3,1)_forward] border-slate-800 ${
              toast.type === "success" ? "border-l-emerald-500" :
              toast.type === "warning" ? "border-l-amber-500" :
              toast.type === "error" ? "border-l-red-500" : "border-l-cyan-500"
            }`}
          >
            <div className="flex-1">
              <h4 className="text-[11px] font-bold font-orbitron text-slate-100 tracking-wide">{toast.title}</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-relaxed">{toast.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* APP FOOTER */}
      <footer className="border-t border-white/5 bg-slate-950 px-6 py-6 sm:px-8 mt-auto text-center flex flex-col items-center gap-1.5">
        <p className="text-[11px] text-slate-500 font-mono">
          NexHome IoT Realtime System • v4.2.0 • Proyek Kampus Smart Automation 
        </p>
        <p className="text-[9.5px] text-slate-600">
          Google AI Studio Build Sandbox Environment (Interactive Simulator & Academic Exporter)
        </p>
      </footer>

    </div>
  );
}
