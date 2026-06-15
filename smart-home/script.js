/**
 * Script JS - Smart Home IoT Modern Dashboard
 * Berisi Logika Utama Realtime Connection, Voice Command, Jam, dan Simulasi Sensors
 */

// Import Database Instance dari firebase-config.js
import { db } from "./firebase-config.js";
import { ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// State Sistem Global
const state = {
  relay: {
    relay1: 0,
    relay2: 0,
    relay3: 0,
    relay4: 0
  },
  sensor: {
    temperature: 30.0,
    humidity: 60
  },
  firebaseConnected: false,
  isMockMode: false
};

// Konstanta Konfigurasi
const REF_RELAY = "relay";
const REF_SENSOR = "sensor";

// ==================================================
// 1. INTI INITIALISASI DAN SEAMLESS LOADER
// ==================================================
window.addEventListener("DOMContentLoaded", () => {
  // Inisialisasi ikon Lucide
  lucide.createIcons();
  
  // Sembunyikan loading screen setelah 1.5 detik
  setTimeout(() => {
    const loader = document.getElementById("loading-screen");
    if (loader) {
      loader.classList.add("hidden");
    }
    addLog("Sistem Nexus IoT berhasil boot up.", "info");
    showToast("Nexus IoT Ready", "Sistem siap digunakan.", "success");
  }, 1500);

  // Jalankan Jam Digital
  startClock();

  // Inisialisasi Event Listener Tombol fisik & Sliders
  initEventListeners();

  // Invetarisasi dan Ambil Data Realtime Firebase
  connectFirebase();

  // Daftarkan Voice Command Web Speech
  initVoiceCommand();
});

// ==================================================
// 2. KONEKSI FIREBASE REALTIME DATABASE OR LOCAL FALLBACK
// ==================================================
function connectFirebase() {
  const firebaseLabel = document.getElementById("firebase-status");
  
  // Deteksi jika pengguna belum mengkonfigurasi databaseURL asli
  const isDefaultURL = db.app.options.databaseURL.includes("ISI_DATABASE_URL_FIREBASE");
  
  if (isDefaultURL) {
    state.isMockMode = true;
    addLog("Firebase URL belum dikonfigurasi. Berjalan dalam SIMULATION MODE.", "warning");
    showToast("Simulation Mode Aktif", "Silakan atur databaseURL di firebase-config.js untuk koneksi asli.", "warning");
    
    if (firebaseLabel) {
      firebaseLabel.querySelector(".indicator-dot").className = "indicator-dot bg-amber";
      firebaseLabel.querySelector(".status-label").textContent = "MOCK MODE (NO FIREBASE)";
    }
    // Muat data lokal default
    updateUIWithSensor(state.sensor.temperature, state.sensor.humidity);
    updateUIWithRelay(state.relay);
    return;
  }

  // Jika URL Valid, Integrasikan onValue() ke Firebase
  try {
    addLog("Menghubungkan ke Firebase database...", "info");
    
    // 1. Dengar status sensor realtime
    const sensorRef = ref(db, REF_SENSOR);
    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        state.sensor.temperature = parseFloat(data.temperature || 0);
        state.sensor.humidity = parseInt(data.humidity || 0);
        updateUIWithSensor(state.sensor.temperature, state.sensor.humidity);
        addLog(`Sensor update: Suhu ${state.sensor.temperature}°C, Kelambaban ${state.sensor.humidity}%`, "info");
      }
    }, (error) => {
      handleFirebaseError(error);
    });

    // 2. Dengar status relay realtime
    const relayRef = ref(db, REF_RELAY);
    onValue(relayRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Bandingkan untuk mendeteksi perubahan jika ada
        const changed = detectRelayChanges(state.relay, data);
        state.relay = data;
        updateUIWithRelay(data);
        state.firebaseConnected = true;
        
        if (firebaseLabel) {
          firebaseLabel.querySelector(".indicator-dot").className = "indicator-dot bg-green";
          firebaseLabel.querySelector(".status-label").textContent = "FIREBASE: TERHUBUNG";
        }

        // Tampilkan pesan perubahan status relay lewat toast & log
        changed.forEach(item => {
          const statusText = item.value === 1 ? "MENYALA (ON)" : "MATI (OFF)";
          const toastType = item.value === 1 ? "success" : "warning";
          addLog(`${item.name} mendeteksi perubahan: ${statusText} via Cloud.`, "success");
          showToast(`${item.name} Berubah`, `Status berubah menjadi ${statusText}.`, toastType);
        });
      }
    }, (error) => {
      handleFirebaseError(error);
    });

  } catch (err) {
    console.error("Firebase Initialization Error:", err);
    state.isMockMode = true;
    addLog(`Koneksi gagal: ${err.message}. Simulator mode ready.`, "warning");
  }
}

// Bandingkan relay lama vs baru untuk notifikasi realtime
function detectRelayChanges(oldState, newState) {
  const changes = [];
  const friendlyNames = {
    relay1: "Relay 1 (Lampu Utama)",
    relay2: "Relay 2 (Lampu Teras)",
    relay3: "Relay 3 (Lampu Dapur)",
    relay4: "Relay 4 (Kipas Angin)"
  };

  for (let key in friendlyNames) {
    if (oldState[key] !== undefined && newState[key] !== undefined) {
      if (oldState[key] !== newState[key]) {
        changes.push({
          key: key,
          name: friendlyNames[key],
          value: newState[key]
        });
      }
    }
  }
  return changes;
}

// Error Handling Firebase
function handleFirebaseError(error) {
  addLog(`Firebase Error: ${error.message}`, "warning");
  showToast("Firebase Error", error.message, "error");
  
  const firebaseLabel = document.getElementById("firebase-status");
  if (firebaseLabel) {
    firebaseLabel.querySelector(".indicator-dot").className = "indicator-dot bg-red";
    firebaseLabel.querySelector(".status-label").textContent = "FIREBASE: ERROR";
  }
}

// ==================================================
// 3. EVENT LISTENERS & WRITING DATA TO DATABASE (set())
// ==================================================
function initEventListeners() {
  // Array tombol ON/OFF Relay
  const relayPairs = [
    { relayKey: "relay1", onBtn: "btn-relay-1-on", offBtn: "btn-relay-1-off" },
    { relayKey: "relay2", onBtn: "btn-relay-2-on", offBtn: "btn-relay-2-off" },
    { relayKey: "relay3", onBtn: "btn-relay-3-on", offBtn: "btn-relay-3-off" },
    { relayKey: "relay4", onBtn: "btn-relay-4-on", offBtn: "btn-relay-4-off" }
  ];

  relayPairs.forEach(pair => {
    const btnOn = document.getElementById(pair.onBtn);
    const btnOff = document.getElementById(pair.offBtn);
    
    if (btnOn) {
      btnOn.addEventListener("click", () => {
        setRelayState(pair.relayKey, 1);
      });
    }
    if (btnOff) {
      btnOff.addEventListener("click", () => {
        setRelayState(pair.relayKey, 0);
      });
    }
  });

  // Master Buttons
  const btnAllOn = document.getElementById("btn-all-on font-orbitron") || document.getElementById("btn-all-on");
  const btnAllOff = document.getElementById("btn-all-off font-orbitron") || document.getElementById("btn-all-off");

  if (btnAllOn) {
    btnAllOn.addEventListener("click", () => {
      setAllRelays(1);
    });
  }
  if (btnAllOff) {
    btnAllOff.addEventListener("click", () => {
      setAllRelays(0);
    });
  }

  // Clear Logs Button
  const btnClearLogs = document.getElementById("btn-clear-logs");
  if (btnClearLogs) {
    btnClearLogs.addEventListener("click", () => {
      const logsContainer = document.getElementById("logs-container");
      if (logsContainer) {
        logsContainer.innerHTML = "";
        addLog("Log dibatalkan dan dibersihkan.", "info");
      }
    });
  }

  // Sliders Hardware Simulasi (Memperbarui Firebase / Log Lokal)
  const simTempSlider = document.getElementById("sim-temp-slider");
  const simHumiSlider = document.getElementById("sim-humi-slider");
  
  if (simTempSlider) {
    simTempSlider.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value).toFixed(1);
      document.getElementById("sim-temp-text").textContent = value;
      // Hanya tulis ke Firebase jika slider dilepas/bergeser, untuk efisiensi
      state.sensor.temperature = parseFloat(value);
      updateSensorValueInDatabase(state.sensor.temperature, state.sensor.humidity);
    });
  }
  
  if (simHumiSlider) {
    simHumiSlider.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      document.getElementById("sim-humi-text").textContent = value;
      state.sensor.humidity = value;
      updateSensorValueInDatabase(state.sensor.temperature, state.sensor.humidity);
    });
  }
}

// Atur Value Tunggal Relay di database (set)
function setRelayState(relayKey, val) {
  if (state.isMockMode) {
    // Jalankan simulasi lokal jika Firebase tidak siap
    const oldVal = state.relay[relayKey];
    state.relay[relayKey] = val;
    updateUIWithRelay(state.relay);
    
    if (oldVal !== val) {
      const friendlyKey = { relay1: "Relay 1", relay2: "Relay 2", relay3: "Relay 3", relay4: "Relay 4" }[relayKey];
      const statusText = val === 1 ? "MENYALA (ON)" : "MATI (OFF)";
      addLog(`[Local Sim] ${friendlyKey}: ${statusText}`, "success");
      showToast(`${friendlyKey} Berubah`, `Status berubah menjadi ${statusText} (Lokal).`, val === 1 ? "success" : "warning");
    }
  } else {
    // Kirim langsung ke Firebase Database real-time path
    set(ref(db, `${REF_RELAY}/${relayKey}`), val)
      .catch((error) => handleFirebaseError(error));
  }
}

// Master Switch Kontrol Semua Relay
function setAllRelays(val) {
  if (state.isMockMode) {
    state.relay = { relay1: val, relay2: val, relay3: val, relay4: val };
    updateUIWithRelay(state.relay);
    addLog(`[Local Sim] Semua relay berhasil diatur ke ${val === 1 ? "ON" : "OFF"}.`, "success");
    showToast("Master Switch", `Semua relay diubah ke posisi ${val === 1 ? "ON" : "OFF"}.`, val === 1 ? "success" : "warning");
  } else {
    const updates = { relay1: val, relay2: val, relay3: val, relay4: val };
    set(ref(db, REF_RELAY), updates)
      .catch((error) => handleFirebaseError(error));
  }
}

// Tulis Sensor Ke Database
function updateSensorValueInDatabase(temp, humi) {
  if (state.isMockMode) {
    updateUIWithSensor(temp, humi);
  } else {
    set(ref(db, REF_SENSOR), {
      temperature: temp,
      humidity: humi
    }).catch((e) => handleFirebaseError(e));
  }
}

// ==================================================
// 4. PEMBARUAN TAMPILAN DASHBOARD (UI UPDATE)
// ==================================================
function updateUIWithSensor(temp, humi) {
  // Update Digital Readings
  const tempText = document.getElementById("temp-value");
  const humiText = document.getElementById("humi-value");
  
  if (tempText) tempText.textContent = temp.toFixed(1);
  if (humiText) humiText.textContent = humi;

  // Update Circled SVG Dashboard Gauges
  // DashArray default lingkaran adalah 264 (2 * PI * r, r=42)
  const maxDashArray = 264;
  
  const tempGauge = document.getElementById("temp-gauge-circle");
  if (tempGauge) {
    // Anggap batas suhu adalah 60°C
    const tempPercent = Math.min(Math.max((temp / 60), 0), 1);
    const tempOffset = maxDashArray - (tempPercent * maxDashArray);
    tempGauge.style.strokeDashoffset = tempOffset;
  }

  const humiGauge = document.getElementById("humi-gauge-circle");
  if (humiGauge) {
    const humiPercent = Math.min(Math.max((humi / 100), 0), 1);
    const humiOffset = maxDashArray - (humiPercent * maxDashArray);
    humiGauge.style.strokeDashoffset = humiOffset;
  }

  // Update Status labels
  const tempInd = document.getElementById("temp-indicator font-mono") || document.getElementById("temp-indicator");
  if (tempInd) {
    if (temp > 35) { tempInd.textContent = "PANAS"; tempInd.className = "sensor-status font-mono text-orange"; }
    else if (temp < 18) { tempInd.textContent = "DINGIN"; tempInd.className = "sensor-status font-mono text-cyan"; }
    else { tempInd.textContent = "NORMAL"; tempInd.className = "sensor-status font-mono text-green"; }
  }

  const humiInd = document.getElementById("humi-indicator font-mono") || document.getElementById("humi-indicator");
  if (humiInd) {
    if (humi > 80) { humiInd.textContent = "LEMBAB"; humiInd.className = "sensor-status font-mono text-cyan"; }
    else if (humi < 40) { humiInd.textContent = "KERING"; humiInd.className = "sensor-status font-mono text-orange"; }
    else { humiInd.textContent = "IDEAL"; humiInd.className = "sensor-status font-mono text-green"; }
  }
}

function updateUIWithRelay(relayObj) {
  const relays = ["relay1", "relay2", "relay3", "relay4"];

  relays.forEach((relayKey, idx) => {
    const val = relayObj[relayKey] || 0;
    const num = idx + 1;
    
    const cardEl = document.getElementById(`card-relay-${num}`);
    const ledEl = document.getElementById(`led-relay-${num}`);
    const bulbEl = document.getElementById(`bulb-relay-${num}`);
    const haloEl = document.getElementById(`halo-relay-${num}`);
    const textEl = document.getElementById(`text-relay-${num}`);
    const btnOn = document.getElementById(`btn-relay-${num}-on`);
    const btnOff = document.getElementById(`btn-relay-${num}-off`);
    
    if (val === 1) {
      if (cardEl) cardEl.classList.add("active");
      if (ledEl) ledEl.classList.add("active");
      if (bulbEl) {
        bulbEl.className = "bulb-icon text-yellow-300";
        bulbEl.setAttribute("data-lucide", "lightbulb");
      }
      if (textEl) textEl.textContent = "STATUS: HIDUP";
      if (btnOn) btnOn.classList.add("active");
      if (btnOff) btnOff.classList.remove("active");
    } else {
      if (cardEl) cardEl.classList.remove("active");
      if (ledEl) ledEl.classList.remove("active");
      if (bulbEl) {
        bulbEl.className = "bulb-icon text-gray";
        bulbEl.setAttribute("data-lucide", "lightbulb-off");
      }
      if (textEl) textEl.textContent = "STATUS: MATI";
      if (btnOn) btnOn.classList.remove("active");
      if (btnOff) btnOff.classList.add("active");
    }
  });

  // Refresh lucide icons for bulb-off references
  lucide.createIcons();
}

// ==================================================
// 5. PENERJEMAH VOICE COMMAND (WEB SPEECH API)
// ==================================================
function initVoiceCommand() {
  const btnVoice = document.getElementById("btn-voice-toggle");
  const voiceTranscriptText = document.getElementById("voice-transcript");
  const voiceWaves = document.getElementById("voice-waves");
  const voiceStatusLabel = document.getElementById("voice-status");

  // Periksa kompabilitas browser
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    if (voiceStatusLabel) {
      voiceStatusLabel.textContent = "SPEECH API TIDAK DIDUKUNG BROWSER";
      voiceStatusLabel.style.color = "var(--accent-red)";
    }
    if (btnVoice) btnVoice.style.display = "none";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "id-ID"; // Set Bahasa Indonesia
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let isListening = false;

  btnVoice.addEventListener("click", () => {
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        addLog("Mikrofon diaktifkan, mendengarkan...", "info");
      } catch (e) {
        console.error("Speech Recognition crash:", e);
      }
    }
  });

  recognition.onstart = () => {
    isListening = true;
    if (btnVoice) btnVoice.classList.add("listening");
    if (voiceWaves) voiceWaves.classList.add("active");
    if (voiceStatusLabel) voiceStatusLabel.textContent = "SEDANG MENDENGARKAN...";
    if (voiceTranscriptText) {
      voiceTranscriptText.textContent = "Silakan bicara sekarang...";
      voiceTranscriptText.classList.remove("transcript-placeholder");
    }
  };

  recognition.onend = () => {
    isListening = false;
    if (btnVoice) btnVoice.classList.remove("listening");
    if (voiceWaves) voiceWaves.classList.remove("active");
    if (voiceStatusLabel) voiceStatusLabel.textContent = "SIAP TERIMA PERINTAH";
  };

  recognition.onerror = (e) => {
    console.error("Speech Recognition Error: ", e.error);
    addLog(`Voice Error: ${e.error}`, "warning");
    showToast("Voice Recognition Error", `Error: ${e.error}. Coba lagi.`, "error");
    if (voiceTranscriptText) {
      voiceTranscriptText.innerHTML = `<span class="text-red">Gagal terdeteksi: Gagal menangkap suara.</span>`;
    }
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    if (voiceTranscriptText) {
      voiceTranscriptText.innerHTML = `"${event.results[0][0].transcript}"`;
    }
    
    addLog(`Verbal Input: "${transcript}"`, "voice");
    
    // Parse perintah suara secara cerdas (mendukung bahasa Indonesia / Inggris dasar)
    executeVoiceAction(transcript);
  };
}

// Parsing Regex Perintah
function executeVoiceAction(command) {
  let matched = false;
  let speakResponseText = "";

  // 1. Matikan atau nyalakan Lampu 1 (Relay 1)
  if (command.includes("nyalakan lampu 1") || command.includes("hidupkan lampu 1") || command.includes("turn on lamp 1") || command.includes("lampu 1 on")) {
    setRelayState("relay1", 1);
    speakResponseText = "Lampu satu di nyalakan";
    matched = true;
  } else if (command.includes("matikan lampu 1") || command.includes("turn off lamp 1") || command.includes("lampu 1 off")) {
    setRelayState("relay1", 0);
    speakResponseText = "Lampu satu di matikan";
    matched = true;
  }

  // 2. Relay 2
  if (command.includes("nyalakan lampu 2") || command.includes("hidupkan lampu 2") || command.includes("turn on lamp 2") || command.includes("lampu 2 on")) {
    setRelayState("relay2", 1);
    speakResponseText = "Lampu teras di nyalakan";
    matched = true;
  } else if (command.includes("matikan lampu 2") || command.includes("turn off lamp 2") || command.includes("lampu 2 off")) {
    setRelayState("relay2", 0);
    speakResponseText = "Lampu teras di matikan";
    matched = true;
  }

  // 3. Relay 3
  if (command.includes("nyalakan lampu 3") || command.includes("hidupkan lampu 3") || command.includes("turn on lamp 3") || command.includes("lampu 3 on")) {
    setRelayState("relay3", 1);
    speakResponseText = "Lampu dapur di nyalakan";
    matched = true;
  } else if (command.includes("matikan lampu 3") || command.includes("turn off lamp 3") || command.includes("lampu 3 off")) {
    setRelayState("relay3", 0);
    speakResponseText = "Lampu dapur di matikan";
    matched = true;
  }

  // 4. Relay 4 (Kipas / Kipas Angin)
  if (command.includes("nyalakan kipas") || command.includes("nyalakan lampu 4") || command.includes("turn on fan") || command.includes("kipas on")) {
    setRelayState("relay4", 1);
    speakResponseText = "Kipas angin dinyalakan";
    matched = true;
  } else if (command.includes("matikan kipas") || command.includes("matikan lampu 4") || command.includes("turn off fan") || command.includes("kipas off")) {
    setRelayState("relay4", 0);
    speakResponseText = "Kipas angin dimatikan";
    matched = true;
  }

  // 5. Semua Lampu
  if (command.includes("nyalakan semua") || command.includes("nyalakan semua lampu") || command.includes("turn on all")) {
    setAllRelays(1);
    speakResponseText = "Semua perangkat di nyalakan";
    matched = true;
  } else if (command.includes("matikan semua") || command.includes("matikan semua lampu") || command.includes("turn off all")) {
    setAllRelays(0);
    speakResponseText = "Semua perangkat di matikan";
    matched = true;
  }

  // Jika cocok, ucapkan balasan suara (Text-To-Speech)
  if (matched) {
    speakBack(speakResponseText);
    showToast("Voice Action Succeeded", `Perintah berhasil dieksekusi: "${speakResponseText}"`, "success");
  } else {
    addLog(`Perintah tidak dikenali: "${command}"`, "warning");
    showToast("Voice Command", "Perintah tidak terdaftar di sistem.", "error");
    speakBack("Perintah tidak dikenali");
  }
}

// Text Synthesis readback
function speakBack(text) {
  if (window.speechSynthesis) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID"; // Set suara Bahasa Indonesia
    utterance.voice = window.speechSynthesis.getVoices().find(v => v.lang.includes("id")) || null;
    utterance.pitch = 1.0;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

// ==================================================
// 6. HELPER REALTIME CLOCK
// ==================================================
function startClock() {
  const clockEl = document.getElementById("digital-clock");
  const dateEl = document.getElementById("current-date");

  function updateClock() {
    const now = new Date();
    
    // Jam, menit, detik
    let hr = now.getHours().toString().padStart(2, '0');
    let min = now.getMinutes().toString().padStart(2, '0');
    let sec = now.getSeconds().toString().padStart(2, '0');
    
    if (clockEl) {
      clockEl.textContent = `${hr}:${min}:${sec}`;
    }

    // Hari, Tanggal Indonesia lokal
    const optionDates = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('id-ID', optionDates);
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// ==================================================
// 7. REALTIME LOG ENGINE & TOAST COMPONENT
// ==================================================
function addLog(msg, type = "info") {
  const logsContainer = document.getElementById("logs-container");
  if (!logsContainer) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });

  const logRow = document.createElement("div");
  logRow.className = `log-row log-${type}`;

  logRow.innerHTML = `
    <span class="log-indicator"></span>
    <span class="log-time font-mono font-bold">[${timeStr}]</span>
    <span class="log-text font-mono">${msg}</span>
  `;

  logsContainer.appendChild(logRow);
  
  // Auto scroll terminal log ke bawah
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

function showToast(title, desc, type = "info") {
  const wrapper = document.getElementById("toast-wrapper");
  if (!wrapper) return;

  const toastCard = document.createElement("div");
  toastCard.className = `toast toast-${type}`;
  
  // Icon berdasarkan tipe
  let iconName = "info";
  if (type === "success") iconName = "check-circle";
  if (type === "warning") iconName = "alert-triangle";
  if (type === "error") iconName = "x-circle";

  toastCard.innerHTML = `
    <i class="toast-icon" data-lucide="${iconName}"></i>
    <div class="toast-contentMain">
      <div class="toast-title font-orbitron">${title}</div>
      <div class="toast-desc font-mono">${desc}</div>
    </div>
  `;

  wrapper.appendChild(toastCard);
  lucide.createIcons();

  // Animasi hapus setelah 3.5 detik
  setTimeout(() => {
    toastCard.classList.add("removing");
    setTimeout(() => {
      toastCard.remove();
    }, 300);
  }, 3500);
}
