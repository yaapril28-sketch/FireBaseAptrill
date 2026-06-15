import React, { useState } from "react";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile,
  Auth
} from "firebase/auth";
import { 
  Cpu, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle2,
  LogIn, 
  UserPlus, 
  Chrome, 
  ShieldCheck, 
  HelpCircle,
  Activity
} from "lucide-react";

interface LoginPageProps {
  auth: Auth;
  triggerToast: (title: string, desc: string, type: string) => void;
  addLog: (text: string, type?: string) => void;
}

export default function LoginPage({ auth, triggerToast, addLog }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [helperVisible, setHelperVisible] = useState(false);

  // Custom translate error Firebase Indonesian
  const getIndonesianErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Alamat email tidak valid.";
      case "auth/user-disabled":
        return "Pengguna ini telah dinonaktifkan.";
      case "auth/user-not-found":
        return "Pengguna tidak ditemukan. Silakan mendaftar terlebih dahulu.";
      case "auth/wrong-password":
        return "Kata sandi salah. Silakan coba lagi.";
      case "auth/email-already-in-use":
        return "Email sudah terdaftar. Gunakan email lain.";
      case "auth/weak-password":
        return "Kata sandi terlalu lemah. Minimal 6 karakter.";
      case "auth/popup-closed-by-user":
        return "Pop-up login Google ditutup oleh pengguna.";
      case "auth/operation-not-allowed":
        return "Metode autentikasi ini dinonaktifkan di Firebase Console.";
      default:
        return "Terjadi kesalahan otentikasi. Silakan cek koneksi Anda.";
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }
    if (isSignUp && !displayName) {
      setError("Nama lengkap wajib diisi untuk pendaftaran");
      return;
    }

    setError(null);
    setLoading(true);
    addLog(isSignUp ? `Mendaftarkan profil baru: ${email}...` : `Mengotentikasi pengguna: ${email}...`, "info");

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update user profile displayName
        await updateProfile(userCredential.user, { displayName });
        triggerToast("Pendaftaran Sukses", `Akun baru ${displayName} berhasil didaftarkan.`, "success");
        addLog(`Pendaftaran berhasil. Profil: ${displayName}`, "success");
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const name = userCredential.user.displayName || userCredential.user.email || "Pengguna";
        triggerToast("Login Berhasil", `Selamat datang kembali, ${name}!`, "success");
        addLog(`Otentikasi sukses. User logged in: ${name}`, "success");
      }
    } catch (err: any) {
      console.error(err);
      const friendlyMsg = getIndonesianErrorMessage(err.code);
      setError(friendlyMsg);
      triggerToast("Otentikasi Gagal", friendlyMsg, "error");
      addLog(`Gagal login/daftar: ${err.message}`, "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    addLog("Membuka otentikasi eksternal Google Sign-In...", "info");

    try {
      const provider = new GoogleAuthProvider();
      // Force user selection of Google account for convenience
      provider.setCustomParameters({
        prompt: "select_account"
      });
      
      const userCredential = await signInWithPopup(auth, provider);
      const name = userCredential.user.displayName || "Google User";
      triggerToast("Login Google Sukses", `Selamat Datang, ${name}! Portal NexusSmart dibuka.`, "success");
      addLog(`Google OAuth sukses. User logged in: ${name}`, "success");
    } catch (err: any) {
      console.error(err);
      const friendlyMsg = getIndonesianErrorMessage(err.code);
      setError(friendlyMsg);
      triggerToast("Google OAuth Gagal", friendlyMsg, "error");
      addLog(`Koneksi OAuth Google gagal: ${friendlyMsg}`, "warning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
      
      {/* Decorative Orbs behind login page */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-pink-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md relative">
        {/* Neon outer border glow effect based on sign-up state */}
        <div className={`absolute -inset-1 rounded-2xl opacity-40 blur-xl transition-all duration-700 ${
          isSignUp 
            ? "bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 shadow-[0_0_40px_rgba(236,72,153,0.3)]" 
            : "bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 shadow-[0_0_40px_rgba(0,243,255,0.3)]"
        }`} />

        <div id="login-card" className="glass-panel relative rounded-2xl border border-white/10 p-8 sm:p-10 shadow-2xl flex flex-col gap-6 overflow-hidden">
          
          {/* Header Identity */}
          <div className="flex flex-col items-center text-center">
            
            {/* Logo box */}
            <div className={`p-3.5 rounded-2xl mb-4 transition-all duration-500 ${
              isSignUp 
                ? "bg-pink-500/10 border border-pink-500/30 neon-border-magenta shadow-[0_0_15px_rgba(236,72,153,0.3)]" 
                : "bg-cyan-500/10 border border-cyan-500/30 neon-border-cyan shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            }`}>
              <Cpu className={`w-8 h-8 transition-colors duration-500 ${
                isSignUp ? "text-pink-400" : "text-cyan-400"
              }`} />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white font-orbitron">
              NEXUS<span className={isSignUp ? "text-pink-500" : "text-cyan-400"}>SMART</span>
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 font-orbitron mt-1">
              Gateway Otentikasi IoT v2.4
            </p>
          </div>

          {/* Alert Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 flex items-start gap-3 text-xs animate-[pulse_2s_infinite]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
            
            {/* Display Name field (only for Signup) */}
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-orbitron">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <User className="w-4 h-4 text-pink-400" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Andi Wijaya"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-black/40 border border-white/10 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-3.5 w-full focus:outline-none focus:border-pink-500/50 focus:bg-black/70 transition-all font-sans placeholder:text-slate-600 focus:ring-1 focus:ring-pink-500/20"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-orbitron">
                Alamat Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Mail className={`w-4 h-4 ${isSignUp ? "text-pink-400" : "text-cyan-400"}`} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-black/40 border border-white/10 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-3.5 w-full focus:outline-none transition-all font-sans placeholder:text-slate-600 focus:ring-1 ${
                    isSignUp 
                      ? "focus:border-pink-500/50 focus:bg-black/70 focus:ring-pink-500/20" 
                      : "focus:border-cyan-500/50 focus:bg-black/70 focus:ring-cyan-500/20"
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-orbitron">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Lock className={`w-4 h-4 ${isSignUp ? "text-pink-400" : "text-cyan-400"}`} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-black/40 border border-white/10 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-3.5 w-full focus:outline-none transition-all font-sans placeholder:text-slate-600 focus:ring-1 ${
                    isSignUp 
                      ? "focus:border-pink-500/50 focus:bg-black/70 focus:ring-pink-500/20" 
                      : "focus:border-cyan-500/50 focus:bg-black/70 focus:ring-cyan-500/20"
                  }`}
                />
              </div>
            </div>

            {/* Submit Auth Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold font-orbitron text-xs tracking-wider py-4 rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 border ${
                isSignUp 
                  ? "bg-pink-500 hover:bg-pink-400 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)] focus:ring-pink-500/30" 
                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] focus:ring-cyan-500/30"
              } disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <div className={`w-4 h-4 border-2 rounded-full animate-spin border-t-transparent ${isSignUp ? "border-white" : "border-slate-950"}`} />
                  <span>SINKRONISASI IDENTITAS...</span>
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  <span>{isSignUp ? "DAFTAR AKUN" : "MASUK KE DASHBOARD"}</span>
                </>
              )}
            </button>
          </form>

          {/* Partition Line */}
          <div className="flex items-center gap-3 py-1">
            <div className="h-[1px] bg-white/5 flex-grow" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 font-orbitron">Atau Hubungkan Lewat</span>
            <div className="h-[1px] bg-white/5 flex-grow" />
          </div>

          {/* OAuth Google Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-slate-900 border border-white/10 hover:border-slate-700 hover:bg-slate-800/80 text-white font-extrabold font-orbitron text-xs tracking-wider py-4 rounded-xl active:scale-95 transition-all text-center flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-md"
          >
            <Chrome className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <span>MASUK DENGAN GOOGLE</span>
          </button>

          {/* Toggle Switch Signup / Signin */}
          <div className="text-center mt-2">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs text-slate-400 hover:text-white hover:underline transition-all underline-offset-4 cursor-pointer"
            >
              {isSignUp 
                ? "Sudah memiliki kredensial? Masuk Sekarang" 
                : "Belum terdaftar? Daftarkan Akun Baru"}
            </button>
          </div>

          {/* Instruction Guide Toggler */}
          <div className="border-t border-white/5 pt-4 mt-2 flex flex-col items-center">
            <button 
              onClick={() => setHelperVisible(!helperVisible)}
              className="text-[10px] font-bold font-orbitron tracking-widest text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>DOKUMEN PANDUAN FIREBASE CONSOLE</span>
            </button>

            {helperVisible && (
              <div className="mt-3 text-left w-full bg-black/40 border border-white/5 rounded-xl p-4 text-[11px] text-slate-400 space-y-2 leading-relaxed">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold border-b border-white/5 pb-1 mb-1 font-orbitron text-[9px] uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Konfigurasi Firebase Console</span>
                </div>
                <p>Agar login berfungsi dengan sukses di server Firebase Anda, pastikan Anda telah menyalakan dua provider berikut pada console:</p>
                <ol className="list-decimal pl-4 space-y-1.5 font-sans">
                  <li>
                    <span className="font-bold text-slate-200">Email/Password:</span> Buka laman <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded text-[9px]">Authentication &gt; Sign-in method</code>, aktifkan <code className="text-slate-300">Email/Password</code>, lalu simpan.
                  </li>
                  <li>
                    <span className="font-bold text-slate-200">Google Login:</span> Aktifkan provider <code className="text-slate-300">Google</code>, masukkan email support, dan simpan konfigurasi.
                  </li>
                </ol>
                <div className="text-[10px] text-slate-500 flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-lg mt-2">
                  <Activity className="w-3.5 h-3.5 animate-pulse text-pink-400" />
                  <span>Autentikasi ini 100% aman disinkronisasi ke Firebase Cloud SDK Anda secara langsung.</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
