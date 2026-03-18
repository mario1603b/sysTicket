import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, updateDoc, addDoc, setDoc, deleteDoc, serverTimestamp, getFirestore, query, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp, deleteApp } from 'firebase/app';
import { Clock, LogOut, MessageSquare, Shield, Trash2, Plus, Users, Send, CheckCircle2, AlertCircle, Briefcase, MapPin, Calendar, Check, X, Download, Paperclip, FileText, Map, FolderKanban, Tag, UserCog, ChevronLeft, Sun, Moon, Camera } from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyC2jwIAXbafENVG5SLfKAVry7bYXup0CKg",
  authDomain: "systicket-83627.firebaseapp.com",
  projectId: "systicket-83627",
   storageBucket: "systicket-83627.firebasestorage.app",
  messagingSenderId: "637194630640",
  appId: "1:637194630640:web:72c6777ce8f207bed55935"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- DICCIONARIO DE TRADUCCIONES ---
const t = {
  es: { 
    greeting: 'Hola', logout: 'Cerrar Sesión', adminPanel: 'Panel de Administración', 
    teamStatus: 'Estado del Equipo', status: 'Estado Actual', active: 'Trabajando', 
    inactive: 'Inactivo', clockIn: 'Fichar Entrada', clockOut: 'Terminar Jornada',
    dailyLimit: 'Límite Diario (8h)', weeklyLimit: 'Total Semanal', 
    vacations: 'Días Disponibles', bonus: 'Bono Acumulado', absence: 'Gestión de Ausencias'
  },
  en: { 
    greeting: 'Hello', logout: 'Logout', adminPanel: 'Admin Dashboard', 
    teamStatus: 'Team Status', status: 'Current Status', active: 'Working', 
    inactive: 'Inactive', clockIn: 'Clock In', clockOut: 'Clock Out',
    dailyLimit: 'Daily Limit (8h)', weeklyLimit: 'Weekly Total', 
    vacations: 'Days Available', bonus: 'Earned Bonus', absence: 'Absence Management'
  }
};

const getMonthsDiff = (startDate) => {
  if (!startDate) return 0;
  const start = new Date(startDate); const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12;
  months -= start.getMonth(); months += now.getMonth();
  return months <= 0 ? 0 : months;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const calculateDays = (start, end) => {
  const d1 = new Date(start); const d2 = new Date(end);
  return Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1; 
};

// --- CONTENEDOR PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState('es');
  const [config, setConfig] = useState({ bono_hora: 8 });

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, 'config', 'general'), snap => {
      if(snap.exists()) setConfig(snap.data());
      else setDoc(doc(db, 'config', 'general'), { bono_hora: 8 });
    });

    let unsubUser = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        unsubUser = onSnapshot(doc(db, 'usuarios', firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUser({ uid: firebaseUser.uid, ...docSnap.data() });
          } else {
            const adminData = { role: 'admin', nombre: 'Administrador Principal', correo: firebaseUser.email, empleadoId: 'ADMIN-000' };
            setDoc(doc(db, 'usuarios', firebaseUser.uid), adminData);
            setUser({ uid: firebaseUser.uid, ...adminData });
          }
          setLoading(false);
        });
      } else { 
        setUser(null); 
        setLoading(false); 
        if(unsubUser) unsubUser(); 
      }
    });
    return () => { unsubscribeAuth(); unsubConfig(); if(unsubUser) unsubUser(); };
  }, []);

  const handleLogout = async () => { try { await signOut(auth); } catch (error) { console.error(error); } };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900"><Clock className="w-12 h-12 animate-pulse text-indigo-600" /></div>;
  if (!user) return <LoginScreen />;

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 font-sans pb-10 transition-colors duration-200">
        <nav className="bg-indigo-600 dark:bg-indigo-950 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-2 text-xl font-bold"><Clock className="w-6 h-6" /> sysTicket</div>
          <div className="flex items-center gap-3 sm:gap-5">
            <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="text-xl hover:scale-110 transition" title="Idioma">{lang === 'es' ? '🇪🇸' : '🇬🇧'}</button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-white/10 rounded-full transition">{darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}</button>
            <span className="text-sm opacity-90 hidden sm:flex items-center gap-1 border-l border-white/20 pl-4">
              {user.role === 'supervisor' && <UserCog className="w-4 h-4 text-indigo-200" />} 
              {t[lang].greeting}, {user.nombre}
            </span>
            <button onClick={handleLogout} className="p-2 hover:bg-red-500 rounded-full transition" title={t[lang].logout}><LogOut className="w-5 h-5" /></button>
          </div>
        </nav>

        <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
          {user.role === 'admin' ? (
            <AdminDashboard adminUser={user} config={config} lang={lang} t={t} />
          ) : (
            <>
              <UserProfile userData={user} config={config} lang={lang} t={t} isAdminView={false} />
              {user.role === 'supervisor' && <TeamStatus lang={lang} t={t} />}
              <AbsenceModule currentUser={user} lang={lang} t={t} />
            </>
          )}
        </main>

        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
          {chatOpen && (
            <div className="w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-10">
              <GlobalChatManager currentUser={user} onClose={() => setChatOpen(false)} />
            </div>
          )}
          <button onClick={() => setChatOpen(!chatOpen)} className="bg-indigo-600 dark:bg-indigo-500 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 transition duration-200">
            {chatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- PANTALLA DE LOGIN ---
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setIsLoggingIn(true);
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch (err) { setError('Credenciales incorrectas.'); } 
    finally { setIsLoggingIn(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-100 p-3 rounded-full mb-2"><Clock className="w-8 h-8 text-indigo-600" /></div>
          <h1 className="text-2xl font-bold text-gray-800">sysTicket</h1>
          <p className="text-gray-500 text-sm mt-2">Plataforma de Fichado</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required /></div>
          <button disabled={isLoggingIn} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition disabled:bg-indigo-400">{isLoggingIn ? 'Iniciando...' : 'Iniciar Sesión'}</button>
        </form>
      </div>
    </div>
  );
}

// --- PERFIL DE USUARIO ---
function UserProfile({ userData, config, lang, t, isAdminView = false }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('Tareas Generales');
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const listaProyectos = ['Tareas Generales', 'Desarrollo Frontend', 'Desarrollo Backend', 'Soporte Técnico', 'Reuniones de Equipo', 'Formación / I+D'];

  const getWorkLocation = (id) => {
    if (!id) return 'No definido';
    if (id.startsWith('A003')) return 'Teletrabajo';
    if (id.startsWith('B003')) return 'Oficina';
    return 'No definido';
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    setIsUploadingPic(true);
    try {
      const fileRef = ref(storage, `perfiles/${userData.uid}_${Date.now()}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await updateDoc(doc(db, 'usuarios', userData.uid), { photoURL: url });
    } catch(err) { alert("Error al subir imagen"); }
    setIsUploadingPic(false);
  };

  const handleClockIn = async () => {
    setIsProcessing(true);
    let ubicacion = null;
    try {
      if ("geolocation" in navigator) {
        ubicacion = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
            () => resolve(null), { timeout: 10000 }
          );
        });
      }
      const updateData = { isClockedIn: true, clockInTime: new Date().toISOString(), proyectoActual: proyectoSeleccionado };
      if (ubicacion) updateData.ultimaUbicacion = ubicacion;
      await updateDoc(doc(db, 'usuarios', userData.uid), updateData);
    } catch (error) { console.error(error); alert("Hubo un error al fichar."); }
    setIsProcessing(false);
  };

  const handleClockOut = async () => {
    setIsProcessing(true);
    try {
      const inTime = new Date(userData.clockInTime);
      const outTime = new Date();
      const hoursWorkedSession = (outTime - inTime) / (1000 * 60 * 60); 
      
      const todayString = outTime.toISOString().split('T')[0];
      let newHorasHoy = hoursWorkedSession;
      if (userData.fecha_ultimo_fichaje === todayString) {
         newHorasHoy += (userData.horas_hoy || 0);
      }
      
      const newTotalHours = (userData.total_horas_semana || 0) + hoursWorkedSession;
      
      await updateDoc(doc(db, 'usuarios', userData.uid), { 
        isClockedIn: false, clockInTime: null, 
        total_horas_semana: newTotalHours,
        horas_hoy: newHorasHoy, fecha_ultimo_fichaje: todayString,
        ultimaUbicacion: null, proyectoActual: null 
      });

      if (newHorasHoy > 8) {
         alert(`⚠️ ¡Atención! Has superado las 8 horas diarias (${newHorasHoy.toFixed(1)}h hoy). Notificado a RH.`);
      }
    } catch (error) {}
    setIsProcessing(false);
  };

  const horasSemanales = userData.total_horas_semana || 0;
  const horasHoy = userData.horas_hoy || 0;
  const sameDay = userData.fecha_ultimo_fichaje === new Date().toISOString().split('T')[0];
  const horasDiariasReales = sameDay ? horasHoy : 0;

  const mesesTrabajados = getMonthsDiff(userData.fecha_inicio_contrato);
  const diasGenerados = mesesTrabajados * 2;
  const diasGastados = userData.dias_vacaciones_gastados || 0;
  
  let diasDisponibles = diasGenerados - diasGastados;
  let bonoEuros = 0;
  if (diasDisponibles > 21) {
    const diasSobrantes = diasDisponibles - 21;
    diasDisponibles = 21;
    bonoEuros = diasSobrantes * 8 * (config?.bono_hora || 8);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 flex flex-col items-center text-center border border-gray-100 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-indigo-50 dark:bg-indigo-900/30"></div>
          
          <label className={`relative group cursor-pointer z-10 ${isUploadingPic ? 'opacity-50' : ''}`}>
            <img src={userData.photoURL || `https://ui-avatars.com/api/?name=${userData.nombre}&background=4f46e5&color=fff&size=150`} alt="Perfil" className="w-24 h-24 rounded-full mb-4 border-4 border-white dark:border-slate-800 shadow-md object-cover bg-white" />
            {!isAdminView && (
              <div className="absolute inset-0 mb-4 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6"/>
              </div>
            )}
            {!isAdminView && <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingPic}/>}
          </label>
          
          <h2 className="text-xl font-bold flex items-center gap-2">
            {userData.nombre} {userData.role === 'supervisor' && <UserCog className="w-5 h-5 text-indigo-600 dark:text-indigo-400" title="Supervisor"/>}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{userData.puesto || 'Empleado'}</p>
          
          <div className="w-full space-y-3 text-sm text-left mt-2 border-t dark:border-slate-700 pt-4">
            <div className="flex justify-between"><span className="text-gray-500 flex items-center gap-2"><Shield className="w-4 h-4" /> ID</span> <span className="font-mono">{userData.empleadoId}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Modalidad</span> <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getWorkLocation(userData.empleadoId) === 'Teletrabajo' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'}`}>{getWorkLocation(userData.empleadoId)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Horario</span> <span>{userData.horario_definido}</span></div>
          </div>

          <div className="w-full mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 flex justify-between items-center">
            <span className="text-blue-800 dark:text-blue-300 text-sm font-semibold">{t[lang].vacations}</span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">{diasDisponibles}</span>
          </div>
          {bonoEuros > 0 && (
            <div className="w-full mt-2 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800 flex justify-between items-center">
              <span className="text-emerald-800 dark:text-emerald-300 text-sm font-semibold">{t[lang].bonus}</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">+{bonoEuros.toFixed(2)}€</span>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-500" /> {t[lang].status}</h3>
            {isAdminView && userData.isClockedIn && userData.ultimaUbicacion && (
              <a href={`https://www.google.com/maps?q=${userData.ultimaUbicacion.lat},${userData.ultimaUbicacion.lng}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full font-semibold"><Map className="w-3 h-3"/> Mapa</a>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center p-5 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className={`w-3 h-3 rounded-full animate-pulse ${userData.isClockedIn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className={`font-semibold text-xl ${userData.isClockedIn ? 'text-green-600' : 'text-gray-500'}`}>{userData.isClockedIn ? t[lang].active : t[lang].inactive}</span>
              </div>
              {userData.isClockedIn && userData.proyectoActual && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-md"><FolderKanban className="w-3.5 h-3.5" /> {userData.proyectoActual}</div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
              {!userData.isClockedIn ? (
                <>
                  <div className="flex items-center bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 w-full sm:w-auto">
                    <Tag className="w-4 h-4 text-gray-400 mr-2" />
                    <select disabled={isAdminView} value={proyectoSeleccionado} onChange={e => setProyectoSeleccionado(e.target.value)} className="text-sm bg-transparent outline-none flex-1">
                      {listaProyectos.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <button onClick={handleClockIn} disabled={isProcessing || isAdminView} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg transition">{t[lang].clockIn}</button>
                </>
              ) : (
                <button onClick={handleClockOut} disabled={isProcessing || isAdminView} className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-xl transition">{t[lang].clockOut}</button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
             <p className="text-sm font-medium text-gray-500 mb-1">{t[lang].dailyLimit}</p>
             <div className="flex items-baseline gap-1">
               <span className={`text-4xl font-black ${horasDiariasReales > 8 ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>{horasDiariasReales.toFixed(1)}</span>
               <span className="text-gray-500 font-medium">/ 8h</span>
             </div>
             <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 mt-4 overflow-hidden">
               <div className={`h-full rounded-full ${horasDiariasReales > 8 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min((horasDiariasReales / 8) * 100, 100)}%` }}></div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
             <p className="text-sm font-medium text-gray-500 mb-1">{t[lang].weeklyLimit}</p>
             <div className="flex items-baseline gap-1">
               <span className={`text-4xl font-black ${horasSemanales > 40 ? 'text-orange-500' : 'text-gray-800 dark:text-white'}`}>{horasSemanales.toFixed(1)}</span>
               <span className="text-gray-500 font-medium">/ 40h</span>
             </div>
             <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 mt-4 overflow-hidden">
               <div className={`h-full rounded-full ${horasSemanales > 40 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min((horasSemanales / 40) * 100, 100)}%` }}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- GESTOR DE CHAT ---
function GlobalChatManager({ currentUser, onClose }) {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeContact, setActiveContact] = useState(null);

  useEffect(() => {
    const unU = onSnapshot(collection(db, 'usuarios'), snap => setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() }))));
    const unM = onSnapshot(collection(db, 'mensajes'), snap => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unU(); unM(); };
  }, []);

  const allowedContacts = users.filter(u => {
    if (u.uid === currentUser.uid) return false;
    const hasAdminHistory = messages.some(m => (m.from === u.uid && m.to === currentUser.uid && u.role === 'admin') || (m.from === currentUser.uid && m.to === u.uid && u.role === 'admin'));
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'rh') return u.role === 'user' || u.role === 'supervisor' || (u.role === 'admin' && hasAdminHistory);
    if (currentUser.role === 'supervisor') return u.role === 'user' || u.role === 'rh' || u.role === 'supervisor' || (u.role === 'admin' && hasAdminHistory);
    return u.role === 'supervisor' || u.role === 'rh' || (u.role === 'admin' && hasAdminHistory);
  });

  if (activeContact) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900">
        <div className="bg-indigo-600 dark:bg-indigo-800 text-white p-3 flex items-center gap-2 shadow-sm z-10">
          <button onClick={() => setActiveContact(null)} className="hover:bg-white/20 p-1.5 rounded-lg transition"><ChevronLeft className="w-5 h-5"/></button>
          <img src={activeContact.photoURL || `https://ui-avatars.com/api/?name=${activeContact.nombre}`} className="w-8 h-8 rounded-full border border-indigo-400 object-cover bg-white" alt=""/>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-bold text-sm truncate">{activeContact.nombre}</h3>
            <p className="text-[10px] text-indigo-200 uppercase tracking-wider">{activeContact.role}</p>
          </div>
        </div>
        <ChatBox currentUserId={currentUser.uid} otherParty={activeContact.uid} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800">
      <div className="bg-indigo-600 dark:bg-indigo-800 text-white p-4 shadow-sm z-10 flex justify-between"><h3 className="font-bold">Contactos</h3><button onClick={onClose}><X className="w-5 h-5"/></button></div>
      <div className="flex-1 overflow-y-auto p-2">
        {allowedContacts.map(c => (
          <button key={c.uid} onClick={() => setActiveContact(c)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition text-left border border-transparent">
            <img src={c.photoURL || `https://ui-avatars.com/api/?name=${c.nombre}`} className="w-12 h-12 rounded-full object-cover bg-white shadow-sm" alt=""/>
            <div className="flex-1 border-b border-gray-100 dark:border-slate-700 pb-2">
              <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{c.nombre}</p>
              <p className="text-[10px] uppercase font-bold text-indigo-500 mt-0.5">{c.role}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatBox({ currentUserId, otherParty }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const unM = onSnapshot(collection(db, 'mensajes'), snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs.filter(m => (m.from === currentUserId && m.to === otherParty) || (m.from === otherParty && m.to === currentUserId)).sort((a, b) => (a.timestamp?.toMillis()||0) - (b.timestamp?.toMillis()||0)));
    });
    return () => unM();
  }, [currentUserId, otherParty]);

  const handleSend = async (e) => {
    e.preventDefault(); if (!text.trim()) return;
    try { await addDoc(collection(db, 'mensajes'), { from: currentUserId, to: otherParty, text: text.trim(), timestamp: serverTimestamp() }); setText(''); } catch (e) {}
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.from === currentUserId ? 'items-end ml-12' : 'items-start mr-12'}`}>
            <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${m.from === currentUserId ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 dark:text-white rounded-bl-sm'}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex gap-2">
        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Mensaje..." className="flex-1 bg-gray-100 dark:bg-slate-700 dark:text-white rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 shadow-sm"><Send className="w-4 h-4" /></button>
      </form>
    </div>
  );
}

// --- MÓDULO DE AUSENCIAS ---
function AbsenceModule({ currentUser, lang, t }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [fInicio, setFInicio] = useState(''); const [fFin, setFFin] = useState('');
  const [tipoAus, setTipoAus] = useState('vacaciones'); const [archivo, setArchivo] = useState(null);
  const [isSub, setIsSub] = useState(false);

  const canApprove = currentUser.role === 'admin' || currentUser.role === 'rh';
  const isWorker = currentUser.role === 'user' || currentUser.role === 'supervisor' || currentUser.role === 'rh';

  useEffect(() => {
    const unQ = onSnapshot(query(collection(db, 'vacaciones'), orderBy('timestamp', 'desc')), snap => setSolicitudes(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unQ();
  }, []);

  const handleSolicitar = async (e) => {
    e.preventDefault(); if(!fInicio || !fFin || new Date(fInicio) > new Date(fFin)) return alert("Fechas inválidas");
    setIsSub(true); const dias = calculateDays(fInicio, fFin); let urlJust = null;
    try {
      if (archivo) {
        const fileRef = ref(storage, `justificantes/${currentUser.uid}_${Date.now()}`);
        await uploadBytes(fileRef, archivo); urlJust = await getDownloadURL(fileRef);
      }
      await addDoc(collection(db, 'vacaciones'), { empleadoUid: currentUser.uid, nombreEmpleado: currentUser.nombre, fechaInicio: fInicio, fechaFin: fFin, diasSolicitados: dias, tipo: tipoAus, urlJustificante: urlJust, estado: 'pendiente', timestamp: serverTimestamp() });
      setFInicio(''); setFFin(''); setArchivo(null); setTipoAus('vacaciones'); alert("Enviado.");
    } catch(e) {} setIsSub(false);
  };

  const handleAprobar = async (id, eUid, dias, accion, tipo) => {
    if(!window.confirm(`¿${accion}?`)) return;
    try {
      await updateDoc(doc(db, 'vacaciones', id), { estado: accion });
      if (accion === 'aprobada' && tipo === 'vacaciones') {
        const uRef = doc(db, 'usuarios', eUid); const uSnap = await getDoc(uRef);
        if(uSnap.exists()) await updateDoc(uRef, { dias_vacaciones_gastados: (uSnap.data().dias_vacaciones_gastados || 0) + dias });
      }
    } catch(e){}
  };

  const aprobadas = solicitudes.filter(s => s.estado === 'aprobada');
  const misSolicitudes = solicitudes.filter(s => s.empleadoUid === currentUser.uid);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mt-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white flex items-center gap-2"><Calendar className="w-5 h-5" /><h2 className="text-lg font-bold">{t[lang].absence}</h2></div>
      <div className="p-6 flex flex-col gap-8">
        <div className={`grid grid-cols-1 ${isWorker && canApprove ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-8`}>
          {isWorker && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-slate-900/50 p-5 rounded-xl border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold mb-4">Nueva Solicitud</h3>
                <form onSubmit={handleSolicitar} className="space-y-4">
                  <select value={tipoAus} onChange={e=>setTipoAus(e.target.value)} className="w-full border dark:border-slate-600 p-2 rounded-lg text-sm dark:bg-slate-700">
                    <option value="vacaciones">Vacaciones</option><option value="baja_medica">Baja Médica</option>
                  </select>
                  <div className="flex gap-2">
                    <input type="date" required value={fInicio} onChange={e=>setFInicio(e.target.value)} className="w-full border dark:border-slate-600 p-2 rounded-lg text-sm dark:bg-slate-700" />
                    <input type="date" required value={fFin} onChange={e=>setFFin(e.target.value)} className="w-full border dark:border-slate-600 p-2 rounded-lg text-sm dark:bg-slate-700" />
                  </div>
                  {tipoAus === 'baja_medica' && <input type="file" required accept="image/*,.pdf" onChange={e => setArchivo(e.target.files[0])} className="w-full text-xs" />}
                  <button type="submit" disabled={isSub} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">{isSub ? '...' : 'Enviar'}</button>
                </form>
              </div>
              {/* Historial (Simplificado UI) */}
              <div className="border dark:border-slate-700 rounded-xl overflow-hidden"><div className="bg-gray-50 dark:bg-slate-900 p-3 border-b dark:border-slate-700"><h3 className="text-sm font-semibold">Mi Historial</h3></div>
              <div className="max-h-48 overflow-y-auto p-3 space-y-2">{misSolicitudes.map(s => (<div key={s.id} className="text-xs flex justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded border dark:border-slate-600"><span>{formatDate(s.fechaInicio)} - {formatDate(s.fechaFin)}</span><span className="uppercase font-bold text-[9px]">{s.estado}</span></div>))}</div></div>
            </div>
          )}
          {canApprove && (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-xl border border-orange-200 dark:border-orange-800 max-h-[600px] overflow-y-auto">
              <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-4 flex items-center gap-2">Pendientes <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">{solicitudes.filter(s=>s.estado==='pendiente').length}</span></h3>
              <div className="space-y-3">{solicitudes.filter(s => s.estado === 'pendiente').map(s => (
                  <div key={s.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-orange-100 dark:border-slate-600 shadow-sm text-sm relative">
                    <p className="font-bold">{s.nombreEmpleado} <span className="text-[10px] text-gray-500">({s.tipo})</span></p>
                    <p className="text-gray-500 my-1">{formatDate(s.fechaInicio)} al {formatDate(s.fechaFin)} ({s.diasSolicitados}d)</p>
                    {s.urlJustificante && <a href={s.urlJustificante} target="_blank" rel="noreferrer" className="text-blue-500 text-xs hover:underline flex gap-1 items-center mb-2"><FileText className="w-3 h-3"/>Ver Archivo</a>}
                    <div className="flex gap-2"><button onClick={()=>handleAprobar(s.id, s.empleadoUid, s.diasSolicitados, 'aprobada', s.tipo)} className="flex-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 py-1.5 rounded">Aprobar</button><button onClick={()=>handleAprobar(s.id, s.empleadoUid, s.diasSolicitados, 'rechazada', s.tipo)} className="flex-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 py-1.5 rounded">Rechazar</button></div>
                  </div>
              ))}</div>
            </div>
          )}
        </div>
        <div className="border dark:border-slate-700 rounded-xl overflow-hidden w-full"><div className="bg-gray-50 dark:bg-slate-900/50 p-4 border-b dark:border-slate-700"><h3 className="font-semibold">Ausencias Aprobadas (Equipo)</h3></div>
          <div className="p-4 overflow-x-auto"><table className="w-full text-left text-sm">
            <thead><tr className="text-xs text-gray-400 uppercase border-b dark:border-slate-700"><th className="pb-2">Empleado</th><th className="pb-2">Fechas</th><th className="pb-2 text-right">Días</th></tr></thead>
            <tbody>{aprobadas.map(vac => (<tr key={vac.id} className="border-b border-gray-50 dark:border-slate-700/50"><td className="py-2 flex gap-2 items-center"><img src={vac.photoURL || `https://ui-avatars.com/api/?name=${vac.nombreEmpleado}`} className="w-6 h-6 rounded-full object-cover" alt=""/>{vac.nombreEmpleado}</td><td className="py-2">{formatDate(vac.fechaInicio)} - {formatDate(vac.fechaFin)}</td><td className="py-2 text-right font-bold text-blue-500">{vac.diasSolicitados}d</td></tr>))}</tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}

// --- TEAM STATUS ---
function TeamStatus({ lang, t }) {
  const [team, setTeam] = useState([]);
  useEffect(() => {
    const un = onSnapshot(collection(db, 'usuarios'), snap => setTeam(snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(u => u.role === 'user')));
    return () => un();
  }, []);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mt-6">
      <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 border-b dark:border-slate-700 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /><h3 className="font-bold text-indigo-900 dark:text-indigo-300">{t[lang].teamStatus}</h3></div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500"><tr className="border-b dark:border-slate-700"><th className="p-3 pl-6">Empleado</th><th className="p-3 text-center">Estado</th><th className="p-3">Proyecto</th></tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">{team.map(u => (
              <tr key={u.uid} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                <td className="p-3 pl-6 font-medium flex items-center gap-2"><img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.nombre}`} className="w-6 h-6 rounded-full object-cover" alt=""/>{u.nombre}</td>
                <td className="p-3 text-center"><span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${u.isClockedIn ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}><span className={`w-1.5 h-1.5 rounded-full ${u.isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>{u.isClockedIn ? t[lang].active : t[lang].inactive}</span></td>
                <td className="p-3 text-gray-600 dark:text-gray-400">{u.isClockedIn && u.proyectoActual ? <span className="flex items-center gap-1"><FolderKanban className="w-3.5 h-3.5 text-indigo-400"/> {u.proyectoActual}</span> : '-'}</td>
              </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

// --- PANEL DE ADMINISTRADOR ---
function AdminDashboard({ adminUser, config, lang, t }) {
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [bonoInput, setBonoInput] = useState(config?.bono_hora || 8);

  useEffect(() => {
    const un = onSnapshot(collection(db, 'usuarios'), snap => setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(u => u.uid !== adminUser.uid && u.role !== 'admin')));
    return () => un();
  }, [adminUser.uid]);

  const updateConfig = async () => { await updateDoc(doc(db, 'config', 'general'), { bono_hora: Number(bonoInput) }); alert("Precio de hora extra actualizado."); };

  const handleCreateUser = async (e) => {
    e.preventDefault(); const fd = new FormData(e.target);
    try {
      const secApp = initializeApp(firebaseConfig, "SecApp"); const secAuth = getAuth(secApp);
      const uc = await createUserWithEmailAndPassword(secAuth, fd.get('c'), fd.get('p'));
      await signOut(secAuth); await deleteApp(secApp);
      await setDoc(doc(db, 'usuarios', uc.user.uid), { nombre: fd.get('n'), correo: fd.get('c'), puesto: fd.get('pu'), empleadoId: fd.get('id'), horario_definido: fd.get('h'), fecha_inicio_contrato: fd.get('f'), role: fd.get('r'), dias_vacaciones_gastados: 0, total_horas_semana: 0, isClockedIn: false, clockInTime: null, ultimaUbicacion: null, proyectoActual: null, horas_hoy: 0, fecha_ultimo_fichaje: '' });
      setShowAdd(false); alert("¡Creado!");
    } catch (err) { alert("Error: " + err.message); }
  };

  const exportToCSV = () => {
    const head = ['Nombre', 'Correo', 'Rol', 'Puesto', 'ID', 'Hrs Sem.', 'Vac. Disp.', 'Estado', 'Proyecto', 'GPS'];
    const rows = users.map(u => {
      const dDisp = (getMonthsDiff(u.fecha_inicio_contrato)*2) - (u.dias_vacaciones_gastados||0);
      return [`"${u.nombre}"`, `"${u.correo}"`, `"${u.role}"`, `"${u.puesto}"`, `"${u.empleadoId}"`, (u.total_horas_semana||0).toFixed(1), dDisp, u.isClockedIn ? 'Trabajando' : 'Inactivo', u.isClockedIn ? `"${u.proyectoActual||'-'}"` : '"-"', u.ultimaUbicacion ? `"${u.ultimaUbicacion.lat},${u.ultimaUbicacion.lng}"` : '"-"'].join(',');
    });
    const link = document.createElement("a"); link.setAttribute("href", encodeURI("data:text/csv;charset=utf-8," + [head.join(','), ...rows].join('\n'))); link.setAttribute("download", `informe.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-indigo-600" /> {t[lang].adminPanel}</h1></div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 p-2 rounded-lg border dark:border-slate-700">
            <label className="text-xs font-bold text-gray-500">Valor Hora Extra (€):</label>
            <input type="number" value={bonoInput} onChange={e=>setBonoInput(e.target.value)} className="w-16 px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-slate-600" />
            <button onClick={updateConfig} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-bold">Guardar</button>
          </div>
          <button onClick={exportToCSV} className="text-green-700 bg-green-50 dark:bg-green-900/30 px-4 py-2.5 rounded-lg font-medium border border-green-200 dark:border-green-800 flex items-center gap-2"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={() => setShowAdd(!showAdd)} className="text-white px-5 py-2.5 rounded-lg font-medium bg-indigo-600 flex items-center gap-2"><Plus className="w-4 h-4" /> Empleado</button>
        </div>
      </div>
      
      {showAdd && (
        <form onSubmit={handleCreateUser} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-5">
          <select name="r" className="border dark:border-slate-600 dark:bg-slate-700 p-2 rounded w-full"><option value="user">Empleado</option><option value="supervisor">Supervisor</option><option value="rh">Recursos Humanos</option></select>
          <input name="n" required placeholder="Nombre" className="border dark:border-slate-600 dark:bg-slate-700 p-2 rounded w-full" />
          <input name="c" required type="email" placeholder="Correo" className="border dark:border-slate-600 dark:bg-slate-700 p-2 rounded w-full" />
          <input name="p" required placeholder="Contraseña" minLength="6" className="border dark:border-slate-600 dark:bg-slate-700 p-2 rounded w-full" />
          <input name="pu" required placeholder="Puesto" className="border dark:border-slate-600 dark:bg-slate-700 p-2 rounded w-full" />
          <input name="id" required placeholder="ID (A003-XXX)" className="border dark:border-slate-600 dark:bg-slate-700 p-2 rounded w-full" />
          <input name="f" required type="date" className="border dark:border-slate-600 dark:bg-slate-700 p-2 rounded w-full" />
          <input name="h" required defaultValue="09:00 - 17:00" className="border dark:border-slate-600 dark:bg-slate-700 p-2 rounded w-full" />
          <button type="submit" className="col-span-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Crear Ficha</button>
        </form>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden p-4">
         <table className="w-full text-left text-sm">
           <thead><tr className="border-b dark:border-slate-700 text-gray-500"><th className="pb-2">Empleado</th><th className="pb-2 text-center">Horas Sem.</th><th className="pb-2 text-center">Estado</th><th className="pb-2 text-right">Borrar</th></tr></thead>
           <tbody>{users.map(u => (
              <tr key={u.uid} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                <td className="py-3 flex gap-3 items-center"><img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.nombre}`} className="w-8 h-8 rounded-full object-cover" alt=""/><div><p className="font-bold">{u.nombre} <span className="text-[10px] text-indigo-500 uppercase">{u.role}</span></p></div></td>
                <td className="py-3 text-center font-bold">{(u.total_horas_semana||0).toFixed(1)}h</td>
                <td className="py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-bold ${u.isClockedIn ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700'}`}>{u.isClockedIn ? 'Activo' : 'Inactivo'}</span></td>
                <td className="py-3 text-right"><button onClick={async () => { if(window.confirm('¿Borrar?')) await deleteDoc(doc(db, 'usuarios', u.uid)); }} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded"><Trash2 className="w-4 h-4"/></button></td>
              </tr>
           ))}</tbody>
         </table>
      </div>
    </div>
  );
}