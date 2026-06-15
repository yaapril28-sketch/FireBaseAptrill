import React, { useState } from "react";
import { Copy, Check, FileCode, Terminal, HelpCircle, HardDrive, Globe } from "lucide-react";

interface FileItem {
  name: string;
  lang: string;
  content: string;
}

export default function SourceCodeTab() {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const files: FileItem[] = [
    {
      name: "firebase-config.js",
      lang: "javascript",
      content: `/**
 * Firebase Config - Smart Home IoT Modern Dashboard
 * Menggunakan Firebase Modular SDK CDN versi 10.12.2
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Konfigurasi Firebase dari akun Anda
const firebaseConfig = {
  apiKey: "AIzaSyBlpIk2pBFCzS-ZNzVwFLzYzgpDnAOV90o",
  authDomain: "aprilfirebase-70d0b.firebaseapp.com",
  // TODO: Silakan ganti URL dibawah ini dengan URL Realtime Database Anda
  // Contoh: "https://aprilfirebase-70d0b-default-rtdb.asia-southeast1.firebasedatabase.app"
  databaseURL: "https://aprilfirebase-70d0b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aprilfirebase-70d0b",
  storageBucket: "aprilfirebase-70d0b.firebasestorage.app",
  messagingSenderId: "735646932371",
  appId: "1:735646932371:web:f5b47b4908546e5a4f1c66",
  measurementId: "G-NV8VJ00LJL"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Export db agar bisa digunakan di file script.js
export { db };`
    },
    {
      name: "index.html",
      lang: "html",
      content: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Home IoT Realtime Dashboard</title>
  
  <!-- Font Google untuk kesan Futuristik & Modern -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght=400;500;700;900&family=Montserrat:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  
  <!-- Icon Lucide (Melalui CDN) -->
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <!-- File Style CSS -->
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- Loading Animation saat halaman pertama kali dibuka -->
  <div id="loading-screen" class="loading-screen">
    <div class="loader-container">
      <div class="neon-ring"></div>
      <div class="neon-ring ring-reverse"></div>
      <div class="loader-text font-orbitron">IOT SYSTEM STARTING...</div>
    </div>
  </div>

  <!-- Header Dashboard -->
  <header class="app-header">
    <div class="header-logo">
      <div class="logo-icon pulsing-glow">
        <i data-lucide="cpu"></i>
      </div>
      <div>
        <h1 class="logo-title font-orbitron text-glow-cyan">NEXUS <span class="accent-text-violet">HOME</span></h1>
        <p class="logo-subtitle">SMART IoT CONTROL SYSTEM</p>
      </div>
    </div>
    
    <!-- Info Jam & Status Koneksi -->
    <div class="header-info">
      <!-- Digital Clock -->
      <div class="clock-card">
        <div id="digital-clock" class="digital-clock font-mono">00:00:00</div>
        <div id="current-date" class="current-date">Minggu, 14 Juni 2026</div>
      </div>
      
      <!-- System Connection Badges -->
      <div class="status-indicators">
        <div class="status-badge" id="firebase-status">
          <span class="indicator-dot bg-amber"></span>
          <span class="status-label font-orbitron">FIREBASE: MENGHUBUNGKAN...</span>
        </div>
        <div class="status-badge" id="network-status">
          <span class="indicator-dot bg-green"></span>
          <span class="status-label font-orbitron">SYSTEM: ONLINE</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Container Utama -->
  <main class="dashboard-container">

    <!-- BARIS KIRI: SENSOR MONITORING & VOICE COMMAND -->
    <div class="sidebar-column">
      
      <!-- CARD 1: MONITORING SUHU & KELEMBABAN -->
      <section class="dashboard-card glow-cyan">
        <div class="card-header">
          <i data-lucide="thermometer" class="icon-cyan"></i>
          <h2 class="card-title font-orbitron">MONITORING SENSOR</h2>
        </div>
        <div class="sensor-grid">
          <!-- Temp Gauge -->
          <div class="sensor-dial-box">
            <div class="gauge-ring" style="--gauge-color: var(--accent-orange); --gauge-glow: rgba(249, 115, 22, 0.4);">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" class="gauge-bg"></circle>
                <circle cx="50" cy="50" r="42" class="gauge-progress" id="temp-gauge-circle" stroke-dasharray="264" stroke-dashoffset="132"></circle>
              </svg>
              <div class="gauge-value font-orbitron">
                <span id="temp-value" class="text-orange">0.0</span><span class="unit text-orange">°C</span>
              </div>
            </div>
            <div class="sensor-label font-orbitron">SUHU RUANGAN</div>
            <div class="sensor-status font-mono text-orange" id="temp-indicator">NORMAL</div>
          </div>
          
          <!-- Humidity Gauge -->
          <div class="sensor-dial-box">
            <div class="gauge-ring" style="--gauge-color: var(--accent-cyan); --gauge-glow: rgba(6, 182, 212, 0.4);">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" class="gauge-bg"></circle>
                <circle cx="50" cy="50" r="42" class="gauge-progress" id="humi-gauge-circle" stroke-dasharray="264" stroke-dashoffset="150"></circle>
              </svg>
              <div class="gauge-value font-orbitron">
                <span id="humi-value" class="text-cyan">0</span><span class="unit text-cyan">%</span>
              </div>
            </div>
            <div class="sensor-label font-orbitron">KELEMBABAN</div>
            <div class="sensor-status font-mono text-cyan" id="humi-indicator">IDEAL</div>
          </div>
        </div>

        <!-- Slider Simulator Data -->
        <div class="simulation-panel">
          <div class="sim-header font-orbitron">
            <span>HARDWARE SIMULATOR</span>
            <span class="badge">PRESENTER DEMO</span>
          </div>
          <p class="sim-desc">Gunakan slider untuk mensimulasikan data sensor DHT11/DHT22 ke Firebase Database.</p>
          <div class="sim-control-group">
            <div class="sim-row">
              <label for="sim-temp-slider" class="font-mono">Suhu (°C): <span id="sim-temp-text" class="text-orange">30.0</span></label>
              <input type="range" id="sim-temp-slider" min="0" max="60" step="0.5" value="30.0" class="neon-slider-orange">
            </div>
            <div class="sim-row">
              <label for="sim-humi-slider" class="font-mono">Kelembaban (%): <span id="sim-humi-text" class="text-cyan">60</span></label>
              <input type="range" id="sim-humi-slider" min="10" max="99" step="1" value="60" class="neon-slider-cyan">
            </div>
          </div>
        </div>
      </section>

      <!-- CARD 2: VOICE COMMAND (WEB SPEECH API) -->
      <section class="dashboard-card glow-violet">
        <div class="card-header">
          <i data-lucide="mic" class="icon-violet"></i>
          <h2 class="card-title font-orbitron">VOICE COMMAND</h2>
          <span class="badge-accent font-orbitron">WEB SPEECH API</span>
        </div>
        
        <div class="voice-assistant-box">
          <div class="voice-mic-container">
            <button id="btn-voice-toggle" class="btn-voice pulsing-glow-violet" title="Klik untuk bicara">
              <i data-lucide="mic" id="mic-icon"></i>
            </button>
            <div class="voice-waves" id="voice-waves">
              <div class="wave"></div>
              <div class="wave"></div>
              <div class="wave"></div>
              <div class="wave"></div>
              <div class="wave"></div>
            </div>
          </div>
          
          <div class="voice-instruction-hint font-orbitron text-violet">
            STATUS: <span id="voice-status">SIAP TERIMA PERINTAH</span>
          </div>

          <div class="voice-text-box">
            <div class="label-box font-mono text-gray">KATA YANG TERDETEKSI:</div>
            <p id="voice-transcript" class="transcript-placeholder font-mono text-glow-cyan">"Klik tombol mikrofon di atas lalu berikan perintah..."</p>
          </div>
          
          <div class="commands-cheat-sheet">
            <div class="commands-title font-orbitron">CONTOH PERINTAH SUARA (ID / EN)</div>
            <ul class="commands-list font-mono">
              <li>"Nyalakan lampu 1" / "Turn on lamp 1"</li>
              <li>"Matikan lampu 2" / "Turn off lamp 2"</li>
              <li>"Nyalakan semua lampu" / "Turn on all lights"</li>
              <li>"Matikan semua lampu" / "Turn off all lights"</li>
            </ul>
          </div>
        </div>
      </section>
    </div>

    <!-- BARIS KANAN: RELAY CONTROLLERS & HISTORY LOGS -->
    <div class="main-column">
      
      <!-- CARD 3: 4 CHANNEL SWITCH CONTROLLER -->
      <section class="dashboard-card glow-violet grow-height">
        <div class="card-header flex-between">
          <div class="header-left">
            <i data-lucide="power" class="icon-violet"></i>
            <h2 class="card-title font-orbitron">RELAY ACTUATORS CONTROL</h2>
          </div>
          <div class="master-switch-box">
            <button class="btn-master" id="btn-all-on">SEMUA ON</button>
            <button class="btn-master btn-off" id="btn-all-off">SEMUA OFF</button>
          </div>
        </div>

        <!-- Grid 4 Relay Actuator -->
        <div class="relay-grid">
          
          <!-- Relay Card 1 -->
          <div class="relay-card" id="card-relay-1">
            <div class="relay-indicator-header">
              <span class="relay-badge font-orbitron">RELAY 1</span>
              <div class="status-led pointer" id="led-relay-1"></div>
            </div>
            
            <div class="hardware-bulb-wrapper">
              <div class="bulb-halo" id="halo-relay-1"></div>
              <i data-lucide="lightbulb" class="bulb-icon text-gray" id="bulb-relay-1"></i>
            </div>
            
            <div class="relay-details">
              <div class="relay-name font-orbitron">Lampu Utama</div>
              <p class="relay-status-text font-mono" id="text-relay-1">STATUS: MATI</p>
            </div>
            
            <div class="relay-button-wrapper">
              <button class="btn-relay btn-relay-on" id="btn-relay-1-on">ON</button>
              <button class="btn-relay btn-relay-off active" id="btn-relay-1-off">OFF</button>
            </div>
          </div>

          <!-- Relay Card 2 -->
          <div class="relay-card" id="card-relay-2">
            <div class="relay-indicator-header">
              <span class="relay-badge font-orbitron">RELAY 2</span>
              <div class="status-led pointer" id="led-relay-2"></div>
            </div>
            
            <div class="hardware-bulb-wrapper">
              <div class="bulb-halo" id="halo-relay-2"></div>
              <i data-lucide="lightbulb" class="bulb-icon text-gray" id="bulb-relay-2"></i>
            </div>
            
            <div class="relay-details">
              <div class="relay-name font-orbitron">Lampu Teras</div>
              <p class="relay-status-text font-mono" id="text-relay-2">STATUS: MATI</p>
            </div>
            
            <div class="relay-button-wrapper">
              <button class="btn-relay btn-relay-on" id="btn-relay-2-on">ON</button>
              <button class="btn-relay btn-relay-off active" id="btn-relay-2-off">OFF</button>
            </div>
          </div>

          <!-- Relay Card 3 -->
          <div class="relay-card" id="card-relay-3">
            <div class="relay-indicator-header">
              <span class="relay-badge font-orbitron">RELAY 3</span>
              <div class="status-led pointer" id="led-relay-3"></div>
            </div>
            
            <div class="hardware-bulb-wrapper">
              <div class="bulb-halo" id="halo-relay-3"></div>
              <i data-lucide="lightbulb" class="bulb-icon text-gray" id="bulb-relay-3"></i>
            </div>
            
            <div class="relay-details">
              <div class="relay-name font-orbitron">Lampu Dapur</div>
              <p class="relay-status-text font-mono" id="text-relay-3">STATUS: MATI</p>
            </div>
            
            <div class="relay-button-wrapper">
              <button class="btn-relay btn-relay-on" id="btn-relay-3-on">ON</button>
              <button class="btn-relay btn-relay-off active" id="btn-relay-3-off">OFF</button>
            </div>
          </div>

          <!-- Relay Card 4 -->
          <div class="relay-card" id="card-relay-4">
            <div class="relay-indicator-header">
              <span class="relay-badge font-orbitron">RELAY 4</span>
              <div class="status-led pointer" id="led-relay-4"></div>
            </div>
            
            <div class="hardware-bulb-wrapper">
              <div class="bulb-halo" id="halo-relay-4"></div>
              <i data-lucide="lightbulb" class="bulb-icon text-gray" id="bulb-relay-4"></i>
            </div>
            
            <div class="relay-details">
              <div class="relay-name font-orbitron">Kipas Angin</div>
              <p class="relay-status-text font-mono" id="text-relay-4">STATUS: MATI</p>
            </div>
            
            <div class="relay-button-wrapper">
              <button class="btn-relay btn-relay-on" id="btn-relay-4-on">ON</button>
              <button class="btn-relay btn-relay-off active" id="btn-relay-4-off">OFF</button>
            </div>
          </div>

        </div>
      </section>

      <!-- CARD 4: SYSTEM REALTIME LOGS -->
      <section class="dashboard-card glow-cyan">
        <div class="card-header flex-between">
          <div class="header-left">
            <i data-lucide="terminal" class="icon-cyan"></i>
            <h2 class="card-title font-orbitron">SYSTEM ACTIVITY LOG</h2>
          </div>
          <button class="btn-clear-logs font-mono" id="btn-clear-logs">BATALKAN LOG</button>
        </div>
        
        <div class="logs-container" id="logs-container"></div>
      </section>

    </div>
  </main>

  <div class="toast-wrapper" id="toast-wrapper"></div>

  <footer class="app-footer">
    <div class="footer-container">
      <p class="footer-text font-mono">Nexus IoT System v4.2.0 • Proyek Smart Home IoT Realtime Database</p>
      <div class="developer-credit">Developed for College Presentation & Smart Automation Prototype</div>
    </div>
  </footer>

  <!-- File JavaScript Config dan Logika Utama -->
  <script type="module" src="script.js"></script>
</body>
</html>`
    },
    {
      name: "style.css",
      lang: "css",
      content: `/*
 * CSS Stylesheet - Smart Home IoT Modern Dashboard
 * Tema: Cosmic Cyber / Dark Futuristic Neon
 */

:root {
  --bg-dark-base: #060913;
  --bg-card: rgba(13, 18, 36, 0.7);
  --bg-card-hover: rgba(18, 25, 48, 0.85);
  --border-glow-cyan: rgba(6, 182, 212, 0.25);
  --border-glow-violet: rgba(139, 92, 246, 0.25);
  
  --accent-cyan: #06b6d4;
  --accent-violet: #8b5cf6;
  --accent-orange: #f97316;
  --accent-green: #10b981;
  --accent-red: #ef4444;
  
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  --font-sans: 'Montserrat', sans-serif;
  --font-orbitron: 'Orbitron', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-dark-base);
  background-image: 
    radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.12) 0px, transparent 50%),
    linear-gradient(rgba(18, 24, 48, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(18, 24, 48, 0.3) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 30px 30px, 30px 30px;
  color: var(--text-primary);
  font-family: var(--font-sans);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.font-orbitron {
  font-family: var(--font-orbitron);
  letter-spacing: 0.05em;
}

.font-mono {
  font-family: var(--font-mono);
}

.text-glow-cyan {
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.6), 0 0 20px rgba(6, 182, 212, 0.3);
}

.text-glow-violet {
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.6), 0 0 20px rgba(139, 92, 246, 0.3);
}

.accent-text-violet { color: var(--accent-violet); }
.text-cyan { color: var(--accent-cyan); }
.text-orange { color: var(--accent-orange); }
.text-green { color: var(--accent-green); }
.text-gray { color: var(--text-secondary); }

.badge {
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid var(--accent-cyan);
  color: var(--accent-cyan);
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
}

.badge-accent {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid var(--accent-violet);
  color: var(--accent-violet);
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #03050b;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

.loading-screen.hidden {
  opacity: 0;
  visibility: hidden;
}

.loader-container {
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.neon-ring {
  width: 80px;
  height: 80px;
  border: 3px solid transparent;
  border-top: 3px solid var(--accent-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
}

.ring-reverse {
  position: absolute;
  top: 0px;
  width: 80px;
  height: 80px;
  border: 3px solid transparent;
  border-bottom: 3px solid var(--accent-violet);
  animation: spin-reverse 1.2s linear infinite;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
}

.loader-text {
  margin-top: 30px;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  animation: pulse-opaque 1.5s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes spin-reverse {
  0% { transform: rotate(360deg); }
  100% { transform: rotate(0deg); }
}

@keyframes pulse-opaque {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.app-header {
  padding: 1.5rem 2rem;
  background: rgba(6, 9, 19, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-violet));
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon i, .logo-icon svg {
  color: #fff;
  width: 22px;
  height: 22px;
}

.logo-title {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 1px;
}

.logo-subtitle {
  font-size: 0.65rem;
  color: var(--text-muted);
  letter-spacing: 0.15em;
  font-weight: 700;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.clock-card {
  text-align: right;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding-right: 1.5rem;
}

.digital-clock {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
}

.current-date {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.status-indicators {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-badge {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  position: relative;
}

.indicator-dot::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  border: 1px solid currentColor;
  animation: pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  opacity: 0.8;
}

.bg-amber { background-color: var(--accent-orange); color: var(--accent-orange); }
.bg-green { background-color: var(--accent-green); color: var(--accent-green); }
.bg-red { background-color: var(--accent-red); color: var(--accent-red); }

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
}

.status-label {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--text-secondary);
  white-space: nowrap;
}

.dashboard-container {
  flex: 1;
  padding: 2rem;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 2rem;
}

.sidebar-column, .main-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-card {
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.24rem;
  backdrop-filter: blur(14px);
  transition: var(--transition-smooth);
}

.dashboard-card:hover {
  background: var(--bg-card-hover);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.glow-cyan:hover {
  box-shadow: 0 10px 30px -10px rgba(6, 182, 212, 0.15);
  border-color: var(--border-glow-cyan);
}

.glow-violet:hover {
  box-shadow: 0 10px 30px -10px rgba(139, 92, 246, 0.15);
  border-color: var(--border-glow-violet);
}

.grow-height {
  flex-grow: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 0.85rem;
}

.flex-between {
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.icon-cyan { color: var(--accent-cyan); width: 20px; height: 20px; }
.icon-violet { color: var(--accent-violet); width: 20px; height: 20px; }

.sensor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.sensor-dial-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 1.25rem 0.75rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gauge-ring {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.gauge-ring svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.gauge-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 7;
}

.gauge-progress {
  fill: none;
  stroke: var(--gauge-color);
  stroke-width: 7;
  stroke-linecap: round;
  filter: drop-shadow(0 0 6px var(--gauge-glow));
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.gauge-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.15rem;
  font-weight: 700;
}

.gauge-value .unit {
  font-size: 0.65rem;
  margin-left: 1px;
}

.sensor-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.sensor-status {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.simulation-panel {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 0.5rem;
}

.sim-header {
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  color: var(--accent-cyan);
}

.sim-desc {
  font-size: 0.64rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 0.85rem;
}

.sim-control-group {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.sim-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.sim-row label {
  font-size: 0.68rem;
  color: var(--text-secondary);
}

input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 5px;
  border-radius: 4px;
  outline: none;
  background: rgba(255, 255, 255, 0.08);
}

.neon-slider-orange::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--accent-orange);
  box-shadow: 0 0 10px var(--accent-orange);
  cursor: pointer;
}

.neon-slider-cyan::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--accent-cyan);
  box-shadow: 0 0 10px var(--accent-cyan);
  cursor: pointer;
}

.voice-assistant-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.voice-mic-container {
  display: flex;
  align-items: center;
  position: relative;
  justify-content: center;
  width: 130px;
  height: 130px;
}

.btn-voice {
  width: 66px;
  height: 66px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--accent-violet), #ac15ff);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  z-index: 5;
  transition: var(--transition-smooth);
}

.btn-voice:hover {
  transform: scale(1.05);
}

.pulsing-glow-violet {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.2);
}

.btn-voice.listening {
  background: linear-gradient(135deg, var(--accent-red), #ff4f4f);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3);
  animation: heartbeat-pulse 1.2s infinite;
}

.voice-waves {
  position: absolute;
  width: 100%;
  height: 40px;
  bottom: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.voice-waves.active {
  opacity: 1;
}

.wave {
  width: 4px;
  background: var(--accent-cyan);
  border-radius: 4px;
}

.voice-waves.active .wave {
  animation: soundwave 1s ease-in-out infinite alternate;
}

.wave:nth-child(1) { height: 10px; animation-delay: 0.1s; }
.wave:nth-child(2) { height: 26px; animation-delay: 0.3s; }
.wave:nth-child(3) { height: 38px; animation-delay: 0.5s; background: var(--accent-violet); }
.wave:nth-child(4) { height: 22px; animation-delay: 0.2s; }
.wave:nth-child(5) { height: 12px; animation-delay: 0.4s; }

@keyframes soundwave {
  0% { transform: scaleY(0.4); }
  100% { transform: scaleY(1.3); }
}

@keyframes heartbeat-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.07); }
}

.voice-instruction-hint {
  font-size: 0.65rem;
  font-weight: 700;
  text-align: center;
}

.voice-text-box {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  width: 100%;
  padding: 1rem;
}

.label-box {
  font-size: 0.55rem;
  font-weight: bold;
  margin-bottom: 6px;
}

#voice-transcript {
  font-size: 0.76rem;
  line-height: 1.5;
  min-height: 40px;
}

.transcript-placeholder {
  color: var(--text-muted);
  font-style: italic;
}

.commands-cheat-sheet {
  background: rgba(255, 255, 255, 0.01);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  padding: 0.85rem;
  border-radius: 8px;
  width: 100%;
}

.commands-title {
  font-size: 0.58rem;
  font-weight: bold;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.commands-list {
  font-size: 0.6rem;
  color: var(--text-muted);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.commands-list li::before {
  content: "•";
  color: var(--accent-cyan);
  margin-right: 6px;
}

.btn-master {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: var(--accent-violet);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.btn-master:hover {
  background: var(--accent-violet);
  color: #fff;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
}

.btn-master.btn-off {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-secondary);
}

.relay-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

.relay-card {
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  transition: var(--transition-smooth);
}

.relay-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.05);
}

.relay-card.active {
  background: rgba(139, 92, 246, 0.04);
  border-color: rgba(139, 92, 246, 0.2);
}

.relay-card.active::before {
  background: linear-gradient(90deg, var(--accent-violet), var(--accent-cyan));
  box-shadow: 0 1px 10px var(--accent-violet);
}

.relay-indicator-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.relay-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
}

.status-led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--accent-red);
  box-shadow: 0 0 6px var(--accent-red);
}

.status-led.active {
  background-color: var(--accent-green);
  box-shadow: 0 0 10px var(--accent-green);
}

.hardware-bulb-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bulb-icon {
  width: 38px;
  height: 38px;
  z-index: 5;
  transition: var(--transition-smooth);
}

.bulb-icon.text-gray {
  color: var(--text-muted);
}

.relay-card.active .bulb-icon {
  color: #fef08a;
  filter: drop-shadow(0 0 8px rgba(254, 240, 138, 0.8));
}

.bulb-halo {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(254, 240, 138, 0.0);
  opacity: 0;
  transform: scale(0.6);
  filter: blur(8px);
  transition: var(--transition-smooth);
}

.relay-card.active .bulb-halo {
  background: radial-gradient(circle, rgba(254, 240, 138, 0.3) 0%, rgba(139, 92, 246, 0.1) 60%, transparent 100%);
  opacity: 1;
  transform: scale(1.4);
  animation: pulse-halo 2s infinite alternate ease-in-out;
}

.relay-details {
  text-align: center;
}

.relay-name {
  font-size: 0.85rem;
  font-weight: 600;
}

.relay-status-text {
  font-size: 0.6rem;
  color: var(--text-secondary);
  font-weight: bold;
  margin-top: 2px;
}

.relay-button-wrapper {
  display: flex;
  width: 100%;
  gap: 8px;
}

.btn-relay {
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-secondary);
  padding: 8px 0;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.72rem;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.btn-relay-on.active {
  background: linear-gradient(135deg, var(--accent-green), #059669);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-relay-off.active {
  background: linear-gradient(135deg, var(--accent-red), #dc2626);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.btn-clear-logs {
  background: transparent;
  border: none;
  font-size: 0.6rem;
  color: var(--text-muted);
  cursor: pointer;
  text-decoration: underline;
}

.logs-container {
  height: 110px;
  overflow-y: auto;
  background: rgba(3, 5, 11, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.log-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.64rem;
}

.log-time {
  color: var(--text-muted);
}

.log-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 5px;
}

.log-info { color: #38bdf8; }
.log-info .log-indicator { background: #38bdf8; }
.log-success { color: #34d399; }
.log-success .log-indicator { background: #34d399; }
.log-warning { color: #fbbf24; }
.log-warning .log-indicator { background: #fbbf24; }
.log-voice { color: #c084fc; font-weight: 500; }
.log-voice .log-indicator { background: #c084fc; }

.toast-wrapper {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  background: rgba(13, 18, 36, 0.95);
  border-left: 4px solid var(--accent-cyan);
  border-radius: 8px;
  padding: 10px 16px;
  width: 290px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.toast.toast-success { border-left-color: var(--accent-green); }
.toast.toast-warning { border-left-color: var(--accent-orange); }
.toast.toast-error { border-left-color: var(--accent-red); }

.toast-icon {
  width: 18px;
  height: 18px;
}

.toast-success .toast-icon { color: var(--accent-green); }
.toast-warning .toast-icon { color: var(--accent-orange); }
.toast-error .toast-icon { color: var(--accent-red); }

.toast-title {
  font-size: 0.76rem;
  font-weight: 700;
}

.toast-desc {
  font-size: 0.65rem;
  color: var(--text-secondary);
}

.app-footer {
  padding: 1.5rem;
  background: rgba(4, 6, 14, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}

@media (max-width: 1024px) {
  .dashboard-container {
    grid-template-columns: 1fr;
  }
  .sidebar-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .clock-card {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    width: 100%;
    text-align: left;
  }
  .header-info {
    flex-direction: column;
    align-items: flex-start;
  }
  .sidebar-column {
    grid-template-columns: 1fr;
  }
  .relay-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .relay-grid { grid-template-columns: 1fr; }
  .sensor-grid { grid-template-columns: 1fr; }
}
\n`
    }
  ];

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* SECTION HEADER */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold font-orbitron text-cyan-400 tracking-wider neon-text-cyan">PROJECT CODE EXPLORER</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Berikut adalah kumpulan file source code lengkap yang diminta untuk tugas Anda. Anda dapat menyalin langsung kode di bawah ini ke file lokal Anda (<code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded text-[10px]">index.html</code>, <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded text-[10px]">style.css</code>, dsb) untuk dijalankan menggunakan VS Code + Live Server.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* FILE NAV & CODE BLOCK - ELEVEN SLOTS WIDTH */}
        <div className="xl:col-span-8 flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:neon-border-cyan hover:shadow-[0_0_25px_rgba(0,243,255,0.05)]">
          
          {/* Tabs bar */}
          <div className="flex bg-slate-900/60 border-b border-white/5 px-4 items-center justify-between">
            <div className="flex gap-1 overflow-x-auto py-2 Scrollbar-none">
              {files.map((file, idx) => (
                <button
                  key={file.name}
                  onClick={() => {
                    setActiveFileIndex(idx);
                    setCopied(false);
                  }}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-mono font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                    activeFileIndex === idx
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 neon-text-cyan"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 ${activeFileIndex === idx ? "text-cyan-400" : "text-slate-500"}`} />
                  <span>{file.name}</span>
                </button>
              ))}
            </div>

            {/* Copy Button */}
            <button
              onClick={() => handleCopy(files[activeFileIndex].content)}
              className="flex items-center gap-1.5 py-1 px-3 bg-white/5 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/20 rounded-md text-[10px] font-medium font-mono transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">TERCOPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY KODE</span>
                </>
              )}
            </button>
          </div>

          {/* Active File Content Panel */}
          <div className="p-5 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto max-h-[500px] overflow-y-auto bg-black/40">
            <pre className="whitespace-pre scrollbar-thin">
              <code>{files[activeFileIndex].content}</code>
            </pre>
          </div>
          
          <div className="bg-slate-900/40 border-t border-white/5 py-3 px-5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>BAHASA: {files[activeFileIndex].lang.toUpperCase()}</span>
            <span>BARIS KODE: {files[activeFileIndex].content.split("\n").length} LINES</span>
          </div>

        </div>

        {/* GUIDES AND STEPS COLUMN - FOUR SLOTS WIDTH */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* INSTRUCTION 1: VS CODE RUN */}
          <div className="glass-panel rounded-2xl p-5 hover:neon-border-cyan transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="text-cyan-400 w-4 h-4" />
              <h3 className="text-xs font-bold font-orbitron tracking-wider text-slate-200">CARA MENJALANKAN DI VS CODE</h3>
            </div>
            <ol className="text-[11px] text-slate-400 space-y-2 list-decimal pl-4 leading-relaxed font-sans">
              <li>Buat sebuah folder kosong baru di komputer Anda, beri nama <code className="text-cyan-400">smart-home</code>.</li>
              <li>Buka software **VS Code**, lalu pilih menu **File &rarr; Open Folder...** dan arahkan ke folder <code className="text-cyan-400">smart-home</code> tersebut.</li>
              <li>Di dalam VS Code, buat 4 file baru dengan nama persis sesuai tab program di sebelah kiri.</li>
              <li>Salin dan tempelkan masing-masing kode ke file tersebut, lalu Save.</li>
              <li>Instal ekstensi baru bernama **"Live Server"** dari menu Extensions (ikon kotak-kotak di sisi kiri VS Code).</li>
              <li>Buka file <code className="text-cyan-400">index.html</code>, lalu klik tombol **"Go Live"** di pojok kanan bawah VS Code untuk membukanya di browser!</li>
            </ol>
          </div>

          {/* INSTRUCTION 2: DEPLOYING TO HOSTING */}
          <div className="glass-panel rounded-2xl p-5 hover:neon-border-magenta transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="text-pink-400 w-4 h-4" />
              <h3 className="text-xs font-bold font-orbitron tracking-wider text-slate-200">DEPLOYS KE FIREBASE HOSTING</h3>
            </div>
            <ol className="text-[11px] text-slate-400 space-y-2 list-decimal pl-4 leading-relaxed font-sans">
              <li>Instal NodeJS di komputer Anda jika belum ada.</li>
              <li>Buka CMD / Terminal, lalu jalankan instalasi Firebase CLI global:
                <pre className="bg-black/40 border border-white/5 text-[9px] text-pink-400 px-2 py-1 rounded my-1.5 font-mono">npm install -g firebase-tools</pre>
              </li>
              <li>Masuk ke akun Firebase Anda menggunakan browser:
                <pre className="bg-black/40 border border-white/5 text-[9px] text-pink-400 px-2 py-1 rounded my-1.5 font-mono">firebase login</pre>
              </li>
              <li>Lakukan inisialisasi pada folder <code className="text-pink-400 font-mono">smart-home</code> komputer Anda:
                <pre className="bg-black/40 border border-white/5 text-[9px] text-pink-400 px-2 py-1 rounded my-1.5 font-mono">firebase init</pre>
                <span className="text-[10px] text-slate-500 select-none block mt-0.5">Pilih *Hosting*, pilih project Anda, dan gunakan folder saat ini (<code className="text-slate-400">.</code> atau <code className="text-slate-400">public</code>) sebagai directory root.</span>
              </li>
              <li>Upload dan publikasikan aplikasi dashboard IoT Anda secara online:
                <pre className="bg-black/40 border border-white/5 text-[9px] text-pink-400 px-2 py-1 rounded my-1.5 font-mono">firebase deploy</pre>
              </li>
            </ol>
          </div>

        </div>

      </div>

    </div>
  );
}
