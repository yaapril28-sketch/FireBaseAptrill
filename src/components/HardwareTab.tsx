import React, { useState } from "react";
import { Cpu, Check, Copy, Sliders, Layers, Server } from "lucide-react";

export default function HardwareTab() {
  const [copied, setCopied] = useState(false);

  // ESP32 Arduino Code using standard Firebase-ESP-Client library
  const esp32Code = `/**
 * NexHome IoT ESP32 - Firebase Realtime Database Integration
 * Cocok untuk ESP32 + Sensor DHT11 + 4-Channel Relay Board.
 * 
 * Silakan instal library berikut lewat Arduino Library Manager:
 * 1. "Firebase ESP Client" oleh Mobizt
 * 2. "DHT sensor library" oleh Adafruit
 * 3. "Adafruit Unified Sensor" oleh Adafruit
 */

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>

// 1. WiFi Credentials
#define WIFI_SSID "NAMA_WIFI_RUMAH_ANDA"
#define WIFI_PASSWORD "PASSWORD_WIFI_RUMAH_ANDA"

// 2. Firebase Credentials & URLs
#define API_KEY "AIzaSyBlpIk2pBFCzS-ZNzVwFLzYzgpDnAOV90o"
#define DATABASE_URL "https://aprilfirebase-70d0b-default-rtdb.asia-southeast1.firebasedatabase.app"

// 3. Pin Assignments Hardware
#define DHTPIN 4           // Pin GPIO4 terhubung ke OUTPUT sensor DHT11/DHT22
#define DHTTYPE DHT11      // Tipe sensor DHT (DHT11 atau DHT22)

#define RELAY_1 12         // GPIO12 terhubung ke Relay 1 (Lampu Utama)
#define RELAY_2 13         // GPIO13 terhubung ke Relay 2 (Lampu Teras)
#define RELAY_3 14         // GPIO14 terhubung ke Relay 3 (Lampu Dapur)
#define RELAY_4 27         // GPIO27 terhubung ke Relay 4 (Kipas Angin)

// Declarations
DHT dht(DHTPIN, DHTTYPE);

// Objek Data Firebase
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Parameter Waktu Pembacaan Sensor
unsigned long sendDataPrevMillis = 0;
const unsigned long sendInterval = 5000; // Kirim data sensor setiap 5 detik

void setup() {
  Serial.begin(115200);
  
  // Inisialisasi Sensor DHT
  dht.begin();

  // Inisialisasi OUTPUT Digital untuk Relay
  pinMode(RELAY_1, OUTPUT);
  pinMode(RELAY_2, OUTPUT);
  pinMode(RELAY_3, OUTPUT);
  pinMode(RELAY_4, OUTPUT);

  // Default awal relay MATI (Biasanya relay active-low, ubah HIGH/LOW sesuai modul Anda)
  digitalWrite(RELAY_1, LOW);
  digitalWrite(RELAY_2, LOW);
  digitalWrite(RELAY_3, LOW);
  digitalWrite(RELAY_4, LOW);

  // Koneksi ke Jaringan WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Menghubungkan ke WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("WiFi Connected! IP Address: ");
  Serial.println(WiFi.localIP());

  // Konfigurasi Credentials Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Izinkan re-koneksi otomatis WiFi & DB
  Firebase.reconnectWiFi(true);

  // Inisialisasi Firebase Client
  Firebase.begin(&config, &auth);
  
  // Mulai dengarkan status Relay realtime dari Firebase menggunakan Stream
  if (!Firebase.RTDB.beginStream(&fbdo, "/relay")) {
    Serial.printf("Gagal menjalankan database stream, ALASAN: %s\\n", fbdo.errorReason().c_str());
  }

  // Buat callback saat terdapat data relay yang berubah di cloud database
  Firebase.RTDB.setStreamCallback(&fbdo, streamCallback, streamTimeoutCallback);
}

void loop() {
  // Jalankan asinkronisasi pembacaan sensor setiap interval 5 detik
  if (millis() - sendDataPrevMillis > sendInterval || sendDataPrevMillis == 0) {
    sendDataPrevMillis = millis();

    // Membaca suhu (°C) dan kelembaban (%)
    float temp = dht.readTemperature();
    float humi = dht.readHumidity();

    // Validasi pembacaan data DHT11
    if (isnan(temp) || isnan(humi)) {
      Serial.println("Gagal membaca data dari sensor DHT11/22!");
      return;
    }

    Serial.printf("Mengirim Sensor: Suhu %.1f°C | Humi %.0f%%\\n", temp, humi);

    // Kirim data suhu & kelembaban ke Firebase database
    FirebaseJson json;
    json.set("temperature", temp);
    json.set("humidity", (int)humi);

    if (Firebase.ready()) {
      if (Firebase.RTDB.setJSON(&fbdo, "/sensor", &json)) {
        Serial.println("Data sensor berhasil dikirim ke Firebase!");
      } else {
        Serial.printf("Gagal mengirim sensor! ALASAN: %s\\n", fbdo.errorReason().c_str());
      }
    }
  }
}

// Callback Function untuk menyinkronkan status Output Relay dari Cloud Database
void streamCallback(FirebaseStream data) {
  Serial.printf("Stream update terdeteksi! Path: %s, Event: %s, Type: %s\\n", data.dataPath().c_str(), data.eventType().c_str(), data.dataType().c_str());
  
  // Jika seluruh node "relay" berubah
  if (data.dataPath() == "/") {
    FirebaseJson &json = data.jsonObject();
    FirebaseJsonData result;
    
    json.get(result, "relay1");
    if (result.success) digitalWrite(RELAY_1, result.intValue);
    
    json.get(result, "relay2");
    if (result.success) digitalWrite(RELAY_2, result.intValue);
    
    json.get(result, "relay3");
    if (result.success) digitalWrite(RELAY_3, result.intValue);
    
    json.get(result, "relay4");
    if (result.success) digitalWrite(RELAY_4, result.intValue);
    
    Serial.println("Pembaruan seluruh status Relay sukses disinkronkan.");
  }
  // Jika hanya salah satu relay yang berubah
  else {
    String path = data.dataPath();
    int stateValue = data.intData();

    if (path == "/relay1") {
      digitalWrite(RELAY_1, stateValue);
      Serial.printf("Relay 1 diubah ke status: %d\\n", stateValue);
    } 
    else if (path == "/relay2") {
      digitalWrite(RELAY_2, stateValue);
      Serial.printf("Relay 2 diubah ke status: %d\\n", stateValue);
    } 
    else if (path == "/relay3") {
      digitalWrite(RELAY_3, stateValue);
      Serial.printf("Relay 3 diubah ke status: %d\\n", stateValue);
    } 
    else if (path == "/relay4") {
      digitalWrite(RELAY_4, stateValue);
      Serial.printf("Relay 4 diubah ke status: %d\\n", stateValue);
    }
  }
}

void streamTimeoutCallback(bool timeout) {
  if (timeout) {
    Serial.println("Stream timeout, memulai re-koneksi...");
  }
}
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(esp32Code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* SECTION HEADER */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold font-orbitron text-cyan-400 tracking-wider neon-text-cyan">HARDWARE ESP32 INTEGRATION MANUAL</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Gunakan dokumen berikut untuk perakitan fisik IOT menggunakan ESP32 NodeMCU, Sensor DHT11, dan Modul Relay 4-Channel yang terhubung ke cloud Firebase Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* PHYSICAL SCHEMATIC & DIRECTORIES - ROW WIDTH 5 */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* FOLDER STRUCTURE */}
          <div className="glass-panel rounded-2xl p-5 transition-all duration-300 hover:neon-border-cyan">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="text-cyan-400 w-4 h-4" />
              <h3 className="text-xs font-bold font-orbitron tracking-wider text-slate-200 uppercase">STRUKTUR DIREKTORI PROYEK</h3>
            </div>
            <pre className="bg-black/30 border border-white/5 font-mono text-[11px] text-cyan-400 p-4 rounded-xl leading-relaxed">
{`smart-home/
│
├── index.html          # File layout UI Utama
├── style.css           # Styling warna neon & Responsive
├── script.js           # Sistem Speech & logic Firebase
└── firebase-config.js  # Credentials Database URL`}
            </pre>
          </div>

          {/* HARDWARE SPECIFICATIONS & PINOUTS */}
          <div className="glass-panel rounded-2xl p-5 transition-all duration-300 hover:neon-border-magenta">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="text-pink-400 w-4 h-4" />
              <h3 className="text-xs font-bold font-orbitron tracking-wider text-slate-200 uppercase">SKEMA KONEKSI PINOUTS HARDWARE</h3>
            </div>
            
            <div className="overflow-x-auto text-[10px] font-mono">
              <table className="w-full border-collapse text-left text-slate-300">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2">PERANGKAT</th>
                    <th className="py-2">PIN ALAT</th>
                    <th className="py-2">PIN ESP32</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2 font-medium text-slate-200">Sensor DHT11/22</td>
                    <td className="py-2">VCC (5V/3V3)</td>
                    <td className="py-2 text-orange-400">Pin 3V3 / Vin</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-slate-200">Sensor DHT11/22</td>
                    <td className="py-2">GND</td>
                    <td className="py-2 text-slate-500">Pin GND</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-slate-200">Sensor DHT11/22</td>
                    <td className="py-2">OUT / DATA</td>
                    <td className="py-2 text-cyan-400">GPIO 4 / D4</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-pink-400">Modul Relay 4-Ch</td>
                    <td className="py-2">VCC</td>
                    <td className="py-2 text-orange-400">Pin Vin / 5V</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-pink-400">Modul Relay 4-Ch</td>
                    <td className="py-2">IN1</td>
                    <td className="py-2 text-pink-400">GPIO 12 / D12</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-pink-400">Modul Relay 4-Ch</td>
                    <td className="py-2">IN2</td>
                    <td className="py-2 text-pink-400">GPIO 13 / D13</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-pink-400">Modul Relay 4-Ch</td>
                    <td className="py-2">IN3</td>
                    <td className="py-2 text-pink-400">GPIO 14 / D14</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-pink-400">Modul Relay 4-Ch</td>
                    <td className="py-2">IN4</td>
                    <td className="py-2 text-pink-400">GPIO 27 / D27</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FIREBASE REALTIME DB JSON TREE SCHEMA */}
          <div className="glass-panel rounded-2xl p-5 transition-all duration-300 hover:neon-border-cyan">
            <div className="flex items-center gap-2 mb-3">
              <Server className="text-emerald-400 w-4 h-4" />
              <h3 className="text-xs font-bold font-orbitron tracking-wider text-slate-200 uppercase">SCHEMA DB JSON STRUCTURE</h3>
            </div>
            <pre className="bg-black/30 border border-white/5 font-mono text-[11px] text-emerald-400 p-4 rounded-xl leading-relaxed">
{`{
  "relay": {
    "relay1": 0,
    "relay2": 0,
    "relay3": 0,
    "relay4": 0
  },
  "sensor": {
    "temperature": 28.5,
    "humidity": 65
  }
}`}
            </pre>
          </div>

        </div>

        {/* ESP32 ARDUINO C++ CODE BLOCK - ROW WIDTH 7 */}
        <div className="xl:col-span-7 flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:neon-border-magenta hover:shadow-[0_0_25px_rgba(255,0,255,0.05)]">
          
          <div className="flex bg-slate-900/60 border-b border-white/5 px-4 py-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="text-orange-500 w-4 h-4" />
              <span className="text-xs font-mono font-medium tracking-wide text-slate-200">ESP32_Firebase_NexHome.ino</span>
            </div>
            
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 py-1 px-3 bg-white/5 hover:bg-orange-500/10 text-slate-300 hover:text-orange-400 border border-white/10 hover:border-orange-500/20 rounded-md text-[10px] font-medium font-mono transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">TERCOPY!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>KOPY KODE ESP32</span>
                </>
              )}
            </button>
          </div>

          <div className="p-5 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto max-h-[480px] overflow-y-auto bg-black/40">
            <pre className="whitespace-pre scrollbar-thin">
              <code>{esp32Code}</code>
            </pre>
          </div>

          <div className="bg-slate-900/40 border-t border-white/5 py-4 px-5 text-[11px] text-slate-500 leading-relaxed font-sans">
            *Catatan Penting: Ganti SSID & Password wifi Anda di baris code 15-16, dan sesuaikan Firebase URL Anda di baris code 20.*
          </div>

        </div>

      </div>

    </div>
  );
}
