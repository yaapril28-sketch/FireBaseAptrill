import React, { useState, useEffect, useRef } from "react";
import { 
  Thermometer, 
  Droplet, 
  Power, 
  Mic, 
  Cpu, 
  Terminal, 
  Wifi, 
  WifiOff, 
  Zap, 
  Volume2, 
  VolumeX, 
  Trash2,
  RefreshCw,
  Lightbulb,
  Radio,
  Sparkles,
  ShieldAlert
} from "lucide-react";

interface DashboardTabProps {
  relay: {
    relay1: number;
    relay2: number;
    relay3: number;
    relay4: number;
  };
  sensor: {
    temperature: number;
    humidity: number;
  };
  setRelayState: (key: string, val: number) => void;
  setAllRelays: (val: number) => void;
  writeSensorData: (temp: number, humi: number) => void;
  firebaseConnected: boolean;
  isMockMode: boolean;
  databaseURL: string;
  setDatabaseURL: (url: string) => void;
  connectToFirebase: () => void;
  logs: Array<{ id: string; time: string; text: string; type: string }>;
  addLog: (text: string, type: string) => void;
  clearLogs: () => void;
}

export default function DashboardTab({
  relay,
  sensor,
  setRelayState,
  setAllRelays,
  writeSensorData,
  firebaseConnected,
  isMockMode,
  databaseURL,
  setDatabaseURL,
  connectToFirebase,
  logs,
  addLog,
  clearLogs
}: DashboardTabProps) {
  // Voice Command Web Speech States
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("SIAP TERIMA PERINTAH");
  const [speechSupported, setSpeechSupported] = useState(true);

  // Pattern Mode Switch States (Pola 1 & Pola 2)
  const [activePattern, setActivePattern] = useState<"none" | "pola1" | "pola2">("none");
  const patternIntervalRef = useRef<any>(null);
  const patternStepRef = useRef<number>(0);

  // Stable ref to setRelayState to avoid interval recreation / infinite rendering tree loops
  const setRelayStateRef = useRef(setRelayState);
  useEffect(() => {
    setRelayStateRef.current = setRelayState;
  }, [setRelayState]);

  const stopPattern = () => {
    setActivePattern("none");
    setAllRelays(0);
    addLog("Menghentikan mode pola, semua relay diset OFF.", "info");
  };

  useEffect(() => {
    if (activePattern === "none") {
      if (patternIntervalRef.current) {
        clearInterval(patternIntervalRef.current);
        patternIntervalRef.current = null;
      }
      return;
    }

    if (patternIntervalRef.current) {
      clearInterval(patternIntervalRef.current);
    }

    addLog(`Mengaktifkan ${activePattern === "pola1" ? "POLA 1 (Lampu Polisi)" : "POLA 2 (Lampu Berkedip)"}`, "success");
    patternStepRef.current = 0;

    patternIntervalRef.current = setInterval(() => {
      patternStepRef.current = patternStepRef.current === 0 ? 1 : 0;
      const step = patternStepRef.current;

      if (activePattern === "pola1") {
        // Pola Polisi: Relay 1 & 2 (ON) berlawanan dengan Relay 3 & 4 (OFF)
        setRelayStateRef.current("relay1", step === 0 ? 1 : 0);
        setRelayStateRef.current("relay2", step === 0 ? 1 : 0);
        setRelayStateRef.current("relay3", step === 0 ? 0 : 1);
        setRelayStateRef.current("relay4", step === 0 ? 0 : 1);
      } else if (activePattern === "pola2") {
        // Lampu Berkedip: Semua relay berkedip bersamaan
        setRelayStateRef.current("relay1", step === 0 ? 1 : 0);
        setRelayStateRef.current("relay2", step === 0 ? 1 : 0);
        setRelayStateRef.current("relay3", step === 0 ? 1 : 0);
        setRelayStateRef.current("relay4", step === 0 ? 1 : 0);
      }
    }, 500);

    return () => {
      if (patternIntervalRef.current) {
        clearInterval(patternIntervalRef.current);
        patternIntervalRef.current = null;
      }
    };
  }, [activePattern]);

  // Sound effects / TTS SpeakBack Toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // References for terminal auto-scroll
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Check Speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setVoiceStatus("SPEECH API BROWSER TIDAK SUPPORT");
    }
  }, []);

  // Text to Speech Indonesian Voice Output
  const speakBack = (text: string) => {
    if (!soundEnabled) return;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel(); // cancel current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Pulse Web Speech execution logic
  const handleMicToggle = () => {
    if (!speechSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (isListening) {
      setIsListening(false);
      recognition.stop();
      return;
    }

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus("SEDANG MENDENGARKAN...");
      setTranscript("Silakan katakan perintah Anda...");
      addLog("Sensors Mic diaktifkan, mendengarkan...", "info");
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
      setVoiceStatus("SIAP TERIMA PERINTAH");
      setTranscript("Gagal memproses kata...");
      addLog(`Voice Err: ${e.error}`, "warning");
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceStatus("SIAP TERIMA PERINTAH");
    };

    recognition.onresult = (event: any) => {
      const voiceResult = event.results[0][0].transcript.toLowerCase().trim();
      setTranscript(`"${event.results[0][0].transcript}"`);
      addLog(`Masukan Suara: "${voiceResult}"`, "voice");
      executeVoiceCommand(voiceResult);
    };

    recognition.start();
  };

  const executeVoiceCommand = (command: string) => {
    let matched = false;
    let spokenResponse = "";

    // Parse sensory query commands first
    if (
      command.includes("berapa suhu") || 
      command.includes("cek suhu") || 
      command.includes("suhu ruangan") || 
      command.includes("suhu sekarang") || 
      command.includes("room temperature") || 
      command.includes("check temperature") || 
      command.includes("cek temperatur") || 
      command.includes("berapa temperatur")
    ) {
      if (command.includes("kelembapan") || command.includes("kelembaban") || command.includes("humidity")) {
        spokenResponse = `Suhu ruangan saat ini adalah ${sensor.temperature} derajat celsius, dengan kelembapan ${sensor.humidity} persen.`;
      } else {
        spokenResponse = `Suhu ruangan saat ini adalah ${sensor.temperature} derajat celsius.`;
      }
      matched = true;
    } else if (
      command.includes("berapa kelembapan") || 
      command.includes("berapa kelembaban") || 
      command.includes("cek kelembapan") || 
      command.includes("cek kelembaban") || 
      command.includes("kelembapan ruangan") || 
      command.includes("kelembaban ruangan") || 
      command.includes("humidity") || 
      command.includes("check humidity")
    ) {
      spokenResponse = `Kelembapan ruangan saat ini adalah ${sensor.humidity} persen.`;
      matched = true;
    } else if (
      command.includes("kondisi ruangan") || 
      command.includes("cek kondisi") || 
      command.includes("cek semua sensor") || 
      command.includes("status sensor")
    ) {
      spokenResponse = `Saat ini suhu ruangan adalah ${sensor.temperature} derajat celsius dan kelembapan ${sensor.humidity} persen.`;
      matched = true;
    }

    // Parse commands for relay actions (Indonesian & English matched)
    if (!matched) {
      if (
        command.includes("nyalakan lampu 1") || 
        command.includes("hidupkan lampu 1") || 
        command.includes("nyalakan lampu satu") || 
        command.includes("hidupkan lampu satu") || 
        command.includes("nyalakan relay 1") || 
        command.includes("hidupkan relay 1") || 
        command.includes("nyalakan relay satu") || 
        command.includes("hidupkan relay satu") || 
        command.includes("turn on lamp 1") || 
        command.includes("lampu 1 on") || 
        command.includes("lampu satu on") || 
        command.includes("relay 1 on") || 
        command.includes("relay satu on")
      ) {
        setRelayState("relay1", 1);
        spokenResponse = "Lampu satu dinyalakan"; matched = true;
      } else if (
        command.includes("matikan lampu 1") || 
        command.includes("matikan lampu satu") || 
        command.includes("matikan relay 1") || 
        command.includes("matikan relay satu") || 
        command.includes("turn off lamp 1") || 
        command.includes("lampu 1 off") || 
        command.includes("lampu satu off") || 
        command.includes("relay 1 off") || 
        command.includes("relay satu off")
      ) {
        setRelayState("relay1", 0);
        spokenResponse = "Lampu satu dimatikan"; matched = true;
      }
    }

    if (command.includes("nyalakan lampu 2") || command.includes("hidupkan lampu 2") || command.includes("turn on lamp 2") || command.includes("lampu 2 on")) {
      setRelayState("relay2", 1);
      spokenResponse = "Lampu teras dinyalakan"; matched = true;
    } else if (command.includes("matikan lampu 2") || command.includes("turn off lamp 2") || command.includes("lampu 2 off")) {
      setRelayState("relay2", 0);
      spokenResponse = "Lampu teras dimatikan"; matched = true;
    }

    if (command.includes("nyalakan lampu 3") || command.includes("hidupkan lampu 3") || command.includes("turn on lamp 3") || command.includes("lampu 3 on")) {
      setRelayState("relay3", 1);
      spokenResponse = "Lampu dapur dinyalakan"; matched = true;
    } else if (command.includes("matikan lampu 3") || command.includes("turn off lamp 3") || command.includes("lampu 3 off")) {
      setRelayState("relay3", 0);
      spokenResponse = "Lampu dapur dimatikan"; matched = true;
    }

    if (command.includes("nyalakan kipas") || command.includes("nyalakan lampu 4") || command.includes("turn on fan") || command.includes("kipas on")) {
      setRelayState("relay4", 1);
      spokenResponse = "Kipas angin dinyalakan"; matched = true;
    } else if (command.includes("matikan kipas") || command.includes("matikan lampu 4") || command.includes("turn off fan") || command.includes("kipas off")) {
      setRelayState("relay4", 0);
      spokenResponse = "Kipas angin dimatikan"; matched = true;
    }

    if (command.includes("nyalakan semua") || command.includes("turn on all")) {
      setAllRelays(1);
      spokenResponse = "Semua perangkat diaktifkan"; matched = true;
    } else if (command.includes("matikan semua") || command.includes("turn off all")) {
      setAllRelays(0);
      spokenResponse = "Semua perangkat dimatikan"; matched = true;
    }

    // Voice commands for Pattern Modes (Pola 1 & Pola 2)
    if (command.includes("nyalakan pola 1") || command.includes("aktifkan pola 1") || command.includes("nyalakan pola polisi") || command.includes("aktifkan pola polisi") || command.includes("pola 1 on") || command.includes("police pattern on")) {
      setActivePattern("pola1");
      spokenResponse = "Mode Pola satu Lampu Polisi diaktifkan"; matched = true;
    } else if (command.includes("matikan pola 1") || command.includes("nonaktifkan pola 1") || command.includes("matikan pola polisi") || command.includes("nonaktifkan pola polisi") || command.includes("pola 1 off")) {
      stopPattern();
      spokenResponse = "Mode Pola satu dimatikan"; matched = true;
    }

    if (command.includes("nyalakan pola 2") || command.includes("aktifkan pola 2") || command.includes("nyalakan pola berkedip") || command.includes("nyalakan lampu berkedip") || command.includes("aktifkan pola berkedip") || command.includes("pola 2 on") || command.includes("flashing pattern on")) {
      setActivePattern("pola2");
      spokenResponse = "Mode Pola dua Lampu Berkedip diaktifkan"; matched = true;
    } else if (command.includes("matikan pola 2") || command.includes("nonaktifkan pola 2") || command.includes("matikan pola berkedip") || command.includes("matikan lampu berkedip") || command.includes("nonaktifkan pola berkedip") || command.includes("pola 2 off")) {
      stopPattern();
      spokenResponse = "Mode Pola dua dimatikan"; matched = true;
    }

    if (command.includes("matikan semua pola") || command.includes("nonaktifkan semua pola") || command.includes("hentikan pola") || command.includes("stop pattern") || command.includes("matikan pola") || command.includes("nonaktifkan pola")) {
      stopPattern();
      spokenResponse = "Semua mode pola dihentikan"; matched = true;
    }

    // Trigger feedback sound
    if (matched) {
      speakBack(spokenResponse);
    } else {
      addLog(`Verbal tidak terdaftar: "${command}"`, "warning");
      speakBack("Perintah tidak dimengerti");
    }
  };

  // Helper circle percent
  const maxDashArray = 264;
  const tempPercent = Math.min(Math.max((sensor.temperature / 60), 0), 1);
  const tempOffset = maxDashArray - (tempPercent * maxDashArray);

  const humiPercent = Math.min(Math.max((sensor.humidity / 100), 0), 1);
  const humiOffset = maxDashArray - (humiPercent * maxDashArray);

  // Status limits text labels
  const getTempLabelStyle = (temp: number) => {
    if (temp > 35) return { text: "PANAS/OVERHEAT", style: "text-orange-500 shadow-orange-500/20" };
    if (temp < 18) return { text: "DINGIN", style: "text-blue-400 shadow-blue-400/20" };
    return { text: "NORMAL & NYAMAN", style: "text-emerald-400" };
  };

  const getHumiLabelStyle = (humi: number) => {
    if (humi > 80) return { text: "TERLALU LEMBAB", style: "text-cyan-400" };
    if (humi < 40) return { text: "KERING/DEHIDRASI", style: "text-amber-500" };
    return { text: "IDEAL & SEHAT", style: "text-emerald-400" };
  };

  const tempLabel = getTempLabelStyle(sensor.temperature);
  const humiLabel = getHumiLabelStyle(sensor.humidity);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* 1. SENSOR MONITORING & VOICE ASSISTANT COLUMN */}
      <div className="lg:col-span-5 flex flex-col gap-8">
        
        {/* CARD 1: SENSOR MONITORING */}
        <div id="card-sensor" className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500 hover:neon-border-cyan hover:shadow-[0_0_25px_rgba(0,243,255,0.1)]">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-5">
            <Thermometer className="text-cyan-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]" />
            <h2 className="text-sm font-bold tracking-[0.15em] font-orbitron text-white uppercase neon-text-cyan">MONITORING SENSOR DHT</h2>
          </div>

          {/* Circle Dials */}
          <div className="grid grid-cols-2 gap-4 my-2">
            
            {/* Temp Gauge */}
            <div className="bg-white/[0.015] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                <svg className="transform -rotate-90 w-full h-full">
                  <circle cx="50" cy="50" r="42" className="fill-none stroke-white/5 stroke-[7]" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    className="fill-none stroke-orange-500 stroke-[7] transition-all duration-500 ease-out" 
                    strokeDasharray={maxDashArray}
                    strokeDashoffset={tempOffset}
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,0.5))" }}
                  />
                </svg>
                <div className="absolute text-center mt-1">
                  <span className="text-xl font-bold font-orbitron text-orange-500">{sensor.temperature.toFixed(1)}</span>
                  <span className="text-xs text-orange-500 ml-0.5">°C</span>
                </div>
              </div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider font-orbitron mb-1">SUHU RUANGAN</div>
              <div className={`text-[9px] font-bold font-mono tracking-wide ${tempLabel.style}`}>{tempLabel.text}</div>
            </div>

            {/* Humi Gauge */}
            <div className="bg-white/[0.015] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                <svg className="transform -rotate-90 w-full h-full">
                  <circle cx="50" cy="50" r="42" className="fill-none stroke-white/5 stroke-[7]" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    className="fill-none stroke-cyan-500 stroke-[7] transition-all duration-500 ease-out" 
                    strokeDasharray={maxDashArray}
                    strokeDashoffset={humiOffset}
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 6px rgba(6,182,212,0.5))" }}
                  />
                </svg>
                <div className="absolute text-center mt-1">
                  <span className="text-xl font-bold font-orbitron text-cyan-400">{sensor.humidity}</span>
                  <span className="text-xs text-cyan-400 ml-0.5">%</span>
                </div>
              </div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider font-orbitron mb-1">KELEMBABAN</div>
              <div className={`text-[9px] font-bold font-mono tracking-wide ${humiLabel.style}`}>{humiLabel.text}</div>
            </div>

          </div>

          {/* Simulation panel inside view */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-orbitron text-cyan-400 tracking-wider">HARDWARE SIMULATOR</span>
              <span className="text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">DEMO PANEL</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Gunakan slider untuk mensimulasikan pembacaan sensor DHT11/22 yang dikirim ke Firebase database.</p>
            
            <div className="flex flex-col gap-4">
              {/* Temp Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Simulasikan Suhu:</span>
                  <span className="text-orange-500 font-bold font-orbitron">{sensor.temperature.toFixed(1)}°C</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="55" 
                  step="0.5" 
                  value={sensor.temperature} 
                  onChange={(e) => writeSensorData(parseFloat(e.target.value), sensor.humidity)}
                  className="w-full accent-orange-500 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                />
              </div>

              {/* Humi Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400 font-medium">Simulasikan Humid:</span>
                  <span className="text-cyan-400 font-bold font-orbitron">{sensor.humidity}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="99" 
                  step="1" 
                  value={sensor.humidity} 
                  onChange={(e) => writeSensorData(sensor.temperature, parseInt(e.target.value))}
                  className="w-full accent-cyan-500 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: VOICE ASSISTANT */}
        <div id="card-voice" className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500 hover:neon-border-magenta hover:shadow-[0_0_25px_rgba(255,0,255,0.1)]">
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <Mic className="text-pink-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
              <h2 className="text-sm font-bold tracking-[0.15em] font-orbitron text-white uppercase neon-text-magenta">ASISTEN SUARA REALTIME</h2>
            </div>
            
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-slate-400 hover:text-pink-400 transition-colors p-1.5 rounded hover:bg-white/5"
              title={soundEnabled ? "Nonaktifkan Balasan Suara" : "Aktifkan Balasan Suara (TTS)"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-pink-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            
            {/* Mic Pulse Button */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Orbiting waves shown when listening */}
              {isListening && (
                <>
                  <div className="absolute inset-0 border border-pink-500/30 rounded-full animate-ping pointer-events-none" />
                  <div className="absolute inset-4 border border-pink-500/40 rounded-full animate-pulse pointer-events-none" />
                  {/* Soundwave bars pulsing */}
                  <div className="absolute -bottom-1 flex items-center gap-1">
                    <div className="w-1 h-4 bg-cyan-400 rounded-full animate-[bounce_0.8s_infinite]" />
                    <div className="w-1 h-7 bg-pink-400 rounded-full animate-[bounce_0.6s_infinite_delay-100ms]" />
                    <div className="w-1 h-10 bg-pink-400 rounded-full animate-[bounce_0.7s_infinite_delay-300ms]" />
                    <div className="w-1 h-6 bg-cyan-400 rounded-full animate-[bounce_0.5s_infinite_delay-200ms]" />
                    <div className="w-1 h-3 bg-pink-400 rounded-full animate-[bounce_0.9s_infinite]" />
                  </div>
                </>
              )}
              
              <button 
                id="btn-voice-react"
                onClick={handleMicToggle}
                disabled={!speechSupported}
                className={`w-20 h-20 rounded-full border-none flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  !speechSupported ? "bg-slate-800 text-slate-600 outline-none" :
                  isListening ? "bg-gradient-to-br from-red-500 to-pink-600 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105" :
                  "bg-gradient-to-br from-pink-500 to-rose-600 shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:scale-105"
                }`}
                title="Klik untuk Mulai / Berhenti Berbicara"
              >
                <Mic className="w-8 h-8 text-white" />
              </button>
            </div>

            <div className="text-center">
              <div className="text-[10px] font-bold tracking-widest font-orbitron text-pink-400 mb-1 neon-text-magenta">
                {isListening ? "MENDENGARKAN SUARA..." : voiceStatus}
              </div>
              
              {!speechSupported && (
                <p className="text-[10px] text-red-500 mt-1 font-medium bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
                  Web Speech API tidak didukung pada browser/iframe ini. Harap buka di Tab Baru.
                </p>
              )}
            </div>

            <div className="bg-black/30 border border-white/5 rounded-xl text-center w-full p-4 mt-2">
              <span className="text-[8px] uppercase tracking-widest font-bold text-slate-500 font-mono block text-left mb-1.5">VERBAL TRANSCRIPT:</span>
              <p className={`font-mono text-xs leading-relaxed ${transcript ? "text-cyan-400 font-medium" : "text-slate-500 italic"}`}>
                {transcript || '"Klik tombol mic di atas lalu katakan: Nyalakan lampu 1"'}
              </p>
            </div>

            {/* Quick cheat sheet */}
            <div className="border border-dashed border-white/10 bg-white/[0.005] rounded-xl p-3 w-full self-stretch">
              <div className="text-[9px] font-bold tracking-wider font-orbitron text-slate-400 mb-2">CONTOH VERBAL PERINTAH:</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] font-mono text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-violet-400 rounded-full" />
                  <span>"Nyalakan lampu 1" / "lampu satu"</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-violet-400 rounded-full" />
                  <span>"Matikan lampu 1" / "lampu satu"</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-violet-400 rounded-full" />
                  <span>"Berapa suhu ruangan?"</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-violet-400 rounded-full" />
                  <span>"Berapa kelembapan?"</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-violet-400 rounded-full" />
                  <span>"Nyalakan Pola 1 / Pola 2"</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-violet-400 rounded-full" />
                  <span>"Matikan semua" / "Tutup pola"</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 2. RELAY CONTROLLER SYSTEM COLUMN */}
      <div className="lg:col-span-7 flex flex-col gap-8">
        
        {/* CARD 3: RELAY CONTROLLER */}
        <div id="card-actuators" className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500 hover:neon-border-cyan hover:shadow-[0_0_25px_rgba(0,243,255,0.1)] flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <Power className="text-cyan-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]" />
              <h2 className="text-sm font-bold tracking-[0.15em] font-orbitron text-white uppercase neon-text-cyan">ACTUATOR RELAY SYSTEMS</h2>
            </div>

            {/* Master Switch */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setAllRelays(1)}
                className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_15px_rgba(0,243,255,0.5)] hover:border-cyan-400 transition-all duration-300 font-orbitron font-bold text-[10px] px-4 py-2 rounded-xl cursor-pointer"
              >
                SEMUA ON
              </button>
              <button 
                onClick={() => setAllRelays(0)}
                className="bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-300 font-orbitron font-bold text-[10px] px-4 py-2 rounded-xl cursor-pointer"
              >
                SEMUA OFF
              </button>
            </div>
          </div>

          {/* 4-Channel Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Relay Card 1 */}
            <div className={`border rounded-xl p-5 flex flex-col items-center gap-3 relative overflow-hidden transition-all duration-300 ${relay.relay1 === 1 ? "neon-border-cyan bg-cyan-950/10" : "border-white/5 bg-white/[0.01]"}`}>
              {/* Highlight bar top */}
              <div className={`absolute top-0 left-0 w-full h-[3px] transition-all duration-300 ${relay.relay1 === 1 ? "bg-cyan-400 shadow-[0_1px_12px_rgba(0,243,255,0.8)]" : "bg-white/5"}`} />
              
              <div className="w-full flex justify-between items-center text-xs font-bold font-orbitron text-slate-500">
                <span className="text-[9px]">CHANNEL 1</span>
                <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${relay.relay1 === 1 ? "bg-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.8)] animate-pulse" : "bg-slate-700"}`} />
              </div>

              {/* Glowing hardware Bulb */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                {relay.relay1 === 1 && (
                  <div className="absolute inset-0 bg-cyan-400/5 border border-cyan-400/10 rounded-full blur-[8px] animate-[pulse_1.5s_infinite_alternate]" />
                )}
                <Lightbulb className={`w-10 h-10 transition-all duration-300 z-10 ${relay.relay1 === 1 ? "text-cyan-300 drop-shadow-[0_0_15px_rgba(0,243,255,0.8)] scale-105" : "text-slate-600"}`} />
              </div>

              <div className="text-center">
                <div className="text-xs font-bold font-orbitron text-white">Lampu Utama</div>
                <div className={`text-[10px] font-mono font-bold mt-1 tracking-wider ${relay.relay1 === 1 ? "text-cyan-400 neon-text-cyan" : "text-slate-500"}`}>
                  STATUS: {relay.relay1 === 1 ? "HIDUP [ON]" : "MATI [OFF]"}
                </div>
              </div>

              <div className="flex w-full gap-2 mt-2">
                <button 
                  onClick={() => setRelayState("relay1", 1)}
                  className={`flex-1 font-bold font-orbitron text-[10px] py-2 rounded-lg cursor-pointer border transition-all duration-300 ${relay.relay1 === 1 ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.4)]" : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"}`}
                >
                  ON
                </button>
                <button 
                  onClick={() => setRelayState("relay1", 0)}
                  className={`flex-1 font-bold font-orbitron text-[10px] py-2 rounded-lg cursor-pointer border transition-all duration-300 ${relay.relay1 === 0 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"}`}
                >
                  OFF
                </button>
              </div>
            </div>

            {/* Relay Card 2 */}
            <div className={`border rounded-xl p-5 flex flex-col items-center gap-3 relative overflow-hidden transition-all duration-300 ${relay.relay2 === 1 ? "neon-border-cyan bg-cyan-950/10" : "border-white/5 bg-white/[0.01]"}`}>
              {/* Highlight bar top */}
              <div className={`absolute top-0 left-0 w-full h-[3px] transition-all duration-300 ${relay.relay2 === 1 ? "bg-cyan-400 shadow-[0_1px_12px_rgba(0,243,255,0.8)]" : "bg-white/5"}`} />
              
              <div className="w-full flex justify-between items-center text-xs font-bold font-orbitron text-slate-500">
                <span className="text-[9px]">CHANNEL 2</span>
                <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${relay.relay2 === 1 ? "bg-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.8)] animate-pulse" : "bg-slate-700"}`} />
              </div>

              {/* Glowing hardware Bulb */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                {relay.relay2 === 1 && (
                  <div className="absolute inset-0 bg-cyan-400/5 border border-cyan-400/10 rounded-full blur-[8px] animate-[pulse_1.5s_infinite_alternate]" />
                )}
                <Lightbulb className={`w-10 h-10 transition-all duration-300 z-10 ${relay.relay2 === 1 ? "text-cyan-300 drop-shadow-[0_0_15px_rgba(0,243,255,0.8)] scale-105" : "text-slate-600"}`} />
              </div>

              <div className="text-center">
                <div className="text-xs font-bold font-orbitron text-white">Lampu Teras</div>
                <div className={`text-[10px] font-mono font-bold mt-1 tracking-wider ${relay.relay2 === 1 ? "text-cyan-400 neon-text-cyan" : "text-slate-500"}`}>
                  STATUS: {relay.relay2 === 1 ? "HIDUP [ON]" : "MATI [OFF]"}
                </div>
              </div>

              <div className="flex w-full gap-2 mt-2">
                <button 
                  onClick={() => setRelayState("relay2", 1)}
                  className={`flex-1 font-bold font-orbitron text-[10px] py-2 rounded-lg cursor-pointer border transition-all duration-300 ${relay.relay2 === 1 ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.4)]" : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"}`}
                >
                  ON
                </button>
                <button 
                  onClick={() => setRelayState("relay2", 0)}
                  className={`flex-1 font-bold font-orbitron text-[10px] py-2 rounded-lg cursor-pointer border transition-all duration-300 ${relay.relay2 === 0 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"}`}
                >
                  OFF
                </button>
              </div>
            </div>

            {/* Relay Card 3 */}
            <div className={`border rounded-xl p-5 flex flex-col items-center gap-3 relative overflow-hidden transition-all duration-300 ${relay.relay3 === 1 ? "neon-border-cyan bg-cyan-950/10" : "border-white/5 bg-white/[0.01]"}`}>
              {/* Highlight bar top */}
              <div className={`absolute top-0 left-0 w-full h-[3px] transition-all duration-300 ${relay.relay3 === 1 ? "bg-cyan-400 shadow-[0_1px_12px_rgba(0,243,255,0.8)]" : "bg-white/5"}`} />
              
              <div className="w-full flex justify-between items-center text-xs font-bold font-orbitron text-slate-500">
                <span className="text-[9px]">CHANNEL 3</span>
                <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${relay.relay3 === 1 ? "bg-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.8)] animate-pulse" : "bg-slate-700"}`} />
              </div>

              {/* Glowing hardware Bulb */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                {relay.relay3 === 1 && (
                  <div className="absolute inset-0 bg-cyan-400/5 border border-cyan-400/10 rounded-full blur-[8px] animate-[pulse_1.5s_infinite_alternate]" />
                )}
                <Lightbulb className={`w-10 h-10 transition-all duration-300 z-10 ${relay.relay3 === 1 ? "text-cyan-300 drop-shadow-[0_0_15px_rgba(0,243,255,0.8)] scale-105" : "text-slate-600"}`} />
              </div>

              <div className="text-center">
                <div className="text-xs font-bold font-orbitron text-white">Lampu Dapur</div>
                <div className={`text-[10px] font-mono font-bold mt-1 tracking-wider ${relay.relay3 === 1 ? "text-cyan-400 neon-text-cyan" : "text-slate-500"}`}>
                  STATUS: {relay.relay3 === 1 ? "HIDUP [ON]" : "MATI [OFF]"}
                </div>
              </div>

              <div className="flex w-full gap-2 mt-2">
                <button 
                  onClick={() => setRelayState("relay3", 1)}
                  className={`flex-1 font-bold font-orbitron text-[10px] py-2 rounded-lg cursor-pointer border transition-all duration-300 ${relay.relay3 === 1 ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.4)]" : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"}`}
                >
                  ON
                </button>
                <button 
                  onClick={() => setRelayState("relay3", 0)}
                  className={`flex-1 font-bold font-orbitron text-[10px] py-2 rounded-lg cursor-pointer border transition-all duration-300 ${relay.relay3 === 0 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"}`}
                >
                  OFF
                </button>
              </div>
            </div>

            {/* Relay Card 4 */}
            <div className={`border rounded-xl p-5 flex flex-col items-center gap-3 relative overflow-hidden transition-all duration-300 ${relay.relay4 === 1 ? "neon-border-cyan bg-cyan-950/10" : "border-white/5 bg-white/[0.01]"}`}>
              {/* Highlight bar top */}
              <div className={`absolute top-0 left-0 w-full h-[3px] transition-all duration-300 ${relay.relay4 === 1 ? "bg-cyan-400 shadow-[0_1px_12px_rgba(0,243,255,0.8)]" : "bg-white/5"}`} />
              
              <div className="w-full flex justify-between items-center text-xs font-bold font-orbitron text-slate-500">
                <span className="text-[9px]">CHANNEL 4</span>
                <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${relay.relay4 === 1 ? "bg-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.8)] animate-pulse" : "bg-slate-700"}`} />
              </div>

              {/* Glowing hardware Bulb */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                {relay.relay4 === 1 && (
                  <div className="absolute inset-0 bg-cyan-400/5 border border-cyan-400/10 rounded-full blur-[8px] animate-[pulse_1.5s_infinite_alternate]" />
                )}
                <Lightbulb className={`w-10 h-10 transition-all duration-300 z-10 ${relay.relay4 === 1 ? "text-cyan-300 drop-shadow-[0_0_15px_rgba(0,243,255,0.8)] scale-105" : "text-slate-600"}`} />
              </div>

              <div className="text-center">
                <div className="text-xs font-bold font-orbitron text-white">Kipas Angin</div>
                <div className={`text-[10px] font-mono font-bold mt-1 tracking-wider ${relay.relay4 === 1 ? "text-cyan-400 neon-text-cyan" : "text-slate-500"}`}>
                  STATUS: {relay.relay4 === 1 ? "HIDUP [ON]" : "MATI [OFF]"}
                </div>
              </div>

              <div className="flex w-full gap-2 mt-2">
                <button 
                  onClick={() => setRelayState("relay4", 1)}
                  className={`flex-1 font-bold font-orbitron text-[10px] py-2 rounded-lg cursor-pointer border transition-all duration-300 ${relay.relay4 === 1 ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.4)]" : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"}`}
                >
                  ON
                </button>
                <button 
                  onClick={() => setRelayState("relay4", 0)}
                  className={`flex-1 font-bold font-orbitron text-[10px] py-2 rounded-lg cursor-pointer border transition-all duration-300 ${relay.relay4 === 0 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"}`}
                >
                  OFF
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* CARD 3.5: INTELLIGENT MODE PATTERNS */}
        <div id="card-patterns" className={`glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500 hover:neon-border-magenta hover:shadow-[0_0_25px_rgba(236,72,153,0.15)] ${activePattern !== "none" ? "neon-border-magenta border-pink-500/30" : ""}`}>
          {/* Decorative highlight line at top */}
          <div className={`absolute top-0 left-0 w-full h-[3px] transition-all duration-300 ${activePattern === "pola1" ? "bg-gradient-to-r from-red-500 to-blue-500 shadow-[0_1px_12px_rgba(239,68,68,0.8)] animate-pulse" : activePattern === "pola2" ? "bg-pink-500 shadow-[0_1px_12px_rgba(236,72,153,0.8)] animate-pulse" : "bg-white/5"}`} />
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <Sparkles className="text-pink-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
              <h2 className="text-sm font-bold tracking-[0.15em] font-orbitron text-white uppercase neon-text-magenta">INTELLIGENT LIGHTING PATTERNS</h2>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[8.5px] uppercase tracking-widest font-mono font-bold px-2 py-0.5 rounded-md ${activePattern === "pola1" ? "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse" : activePattern === "pola2" ? "bg-pink-500/10 text-pink-400 border border-pink-500/20 animate-pulse" : "bg-white/5 text-slate-500"}`}>
                {activePattern === "pola1" ? "POLISI AKTIF" : activePattern === "pola2" ? "KEDIP AKTIF" : "NORMAL STABLE"}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed mb-5">
            Aktifkan animasi kustom untuk pola kelap-kelip lampu cerdas secara berulang. Gunakan asisten suara untuk aktivasi handsfree.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pattern Button 1 */}
            <button
              onClick={() => setActivePattern("pola1")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                activePattern === "pola1"
                  ? "bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] font-bold font-orbitron"
                  : "bg-white/[0.01] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.03] hover:border-white/10"
              }`}
            >
              <div className="relative w-8 h-8 flex items-center justify-center mb-2">
                {activePattern === "pola1" && (
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-[6px] animate-ping" />
                )}
                <ShieldAlert className={`w-5 h-5 ${activePattern === "pola1" ? "text-red-400" : "text-slate-500"}`} />
              </div>
              <span className="text-[11px] font-bold font-orbitron tracking-wide">POLA 1</span>
              <span className="text-[8px] font-mono opacity-60 mt-0.5">Lampu Polisi</span>
            </button>

            {/* Pattern Button 2 */}
            <button
              onClick={() => setActivePattern("pola2")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                activePattern === "pola2"
                  ? "bg-pink-500/10 border-pink-500/50 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)] font-bold font-orbitron"
                  : "bg-white/[0.01] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.03] hover:border-white/10"
              }`}
            >
              <div className="relative w-8 h-8 flex items-center justify-center mb-2">
                {activePattern === "pola2" && (
                  <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-[6px] animate-ping" />
                )}
                <Sparkles className={`w-5 h-5 ${activePattern === "pola2" ? "text-pink-400" : "text-slate-500"}`} />
              </div>
              <span className="text-[11px] font-bold font-orbitron tracking-wide">POLA 2</span>
              <span className="text-[8px] font-mono opacity-60 mt-0.5">Lampu Berkedip</span>
            </button>

            {/* Stop Button */}
            <button
              onClick={stopPattern}
              disabled={activePattern === "none"}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                activePattern === "none"
                  ? "border-white/5 opacity-40 text-slate-600 bg-black/10 cursor-not-allowed"
                  : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 cursor-pointer"
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center mb-2">
                <Power className={`w-5 h-5 ${activePattern !== "none" ? "text-red-400" : "text-slate-600"}`} />
              </div>
              <span className="text-[11px] font-bold font-orbitron tracking-wide">NONAKTIFKAN</span>
              <span className="text-[8px] font-mono opacity-60 mt-0.5">Berhenti</span>
            </button>
          </div>
        </div>

        {/* CARD 4: REAL-TIME CONSOLE LOG SYSTEM */}
        <div id="card-logs" className="glass-panel rounded-2xl p-6 shadow-2xl transition-all duration-500 hover:neon-border-cyan hover:shadow-[0_0_25px_rgba(0,243,255,0.1)] max-h-[290px] flex flex-col">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <Terminal className="text-cyan-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]" />
              <h2 className="text-xs font-bold tracking-[0.15em] font-orbitron text-white uppercase neon-text-cyan">SYSTEM LOG TERMINAL</h2>
            </div>
            
            <button 
              onClick={clearLogs}
              className="text-[10px] text-slate-500 hover:text-cyan-400 font-mono flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>BERSIHKAN LOG</span>
            </button>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex-1 overflow-y-auto font-mono text-xs text-slate-300 flex flex-col gap-2 min-h-[120px] max-h-[145px]">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic">Mendengarkan event logs...</p>
            ) : (
              logs.map((log) => {
                let textClass = "text-sky-300";
                if (log.type === "success") textClass = "text-emerald-400";
                if (log.type === "warning") textClass = "text-amber-400";
                if (log.type === "voice") textClass = "text-violet-400 font-semibold";
                
                return (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed animate-[fadeIn_0.2s_ease-out]">
                    <span className="text-slate-500 text-[10px] font-semibold mt-0.5 whitespace-nowrap">[{log.time}]</span>
                    <span className={textClass}>{log.text}</span>
                  </div>
                );
              })
            )}
            <div ref={logEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
}
