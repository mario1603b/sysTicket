import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, updateDoc, addDoc, setDoc, deleteDoc, serverTimestamp, getFirestore, query, orderBy } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { Clock, LogOut, MessageSquare, Shield, Trash2, Plus, Users, Send, CheckCircle2, AlertCircle, Briefcase, MapPin, Calendar, Check, X } from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ---
// Asegúrate de poner aquí tus claves reales de Firebase
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

// --- FUNCIONES AUXILIARES (Fechas) ---
const getMonthsDiff = (startDate) => {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12;
  months -= start.getMonth();
  months += now.getMonth();
  return months <= 0 ? 0 : months;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const calculateDays = (start, end) => {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
  return diffDays;
};

// --- CONTENEDOR PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'usuarios', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUser({ uid: firebaseUser.uid, ...userDoc.data() });
        } else {
          setUser({ uid: firebaseUser.uid, role: 'admin', nombre: 'Administrador Principal', correo: firebaseUser.email });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (error) { console.error(error); }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Clock className="w-12 h-12 animate-pulse text-indigo-600" /></div>;
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-10">
      <nav className="bg-indigo-600 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Clock className="w-6 h-6" /> sysTicket
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-90 hidden sm:inline">Hola, {user.nombre}</span>
          <button onClick={handleLogout} className="p-2 hover:bg-indigo-700 rounded-full transition" title="Cerrar Sesión">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {user.role === 'admin' ? <AdminDashboard adminUser={user} /> : <UserProfile userData={user} />}
        
        {/* MÓDULO DE VACACIONES */}
        <VacationModule currentUser={user} />
      </main>
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
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Credenciales incorrectas.');
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
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
function UserProfile({ userData, isAdminView = false }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getWorkLocation = (id) => {
    if (!id) return 'No definido';
    if (id.startsWith('A003')) return 'Teletrabajo';
    if (id.startsWith('B003')) return 'Oficina';
    return 'No definido';
  };

  const handleClockIn = async () => {
    setIsProcessing(true);
    try { await updateDoc(doc(db, 'usuarios', userData.uid), { isClockedIn: true, clockInTime: new Date().toISOString() }); } catch (error) { console.error(error); }
    setIsProcessing(false);
  };

  const handleClockOut = async () => {
    setIsProcessing(true);
    try {
      const inTime = new Date(userData.clockInTime);
      const outTime = new Date();
      const hoursWorkedSession = (outTime - inTime) / (1000 * 60 * 60); 
      const newTotalHours = (userData.total_horas_semana || 0) + hoursWorkedSession;
      await updateDoc(doc(db, 'usuarios', userData.uid), { isClockedIn: false, clockInTime: null, total_horas_semana: newTotalHours });
    } catch (error) { console.error(error); }
    setIsProcessing(false);
  };

  const metaHoras = 40;
  const horasTotales = userData.total_horas_semana || 0;
  const superado = horasTotales > metaHoras;
  const metaProximaSemana = superado ? (metaHoras - (horasTotales - metaHoras)).toFixed(1) : metaHoras;

  // Cálculo de Vacaciones
  const mesesTrabajados = getMonthsDiff(userData.fecha_inicio_contrato);
  const diasVacacionesGenerados = mesesTrabajados * 2;
  const diasGastados = userData.dias_vacaciones_gastados || 0;
  const diasDisponibles = diasVacacionesGenerados - diasGastados;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-indigo-50"></div>
          <img src={`https://ui-avatars.com/api/?name=${userData.nombre}&background=4f46e5&color=fff&size=150`} alt="Perfil" className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-md relative z-10" />
          <h2 className="text-xl font-bold text-gray-800 relative z-10">{userData.nombre}</h2>
          <p className="text-gray-500 text-sm mb-4 relative z-10">{userData.puesto || 'Empleado'}</p>
          
          <div className="w-full space-y-3 text-sm text-left mt-2 border-t pt-4">
            <div className="flex items-center justify-between"><span className="text-gray-500 flex items-center gap-2"><Shield className="w-4 h-4" /> ID</span> <span className="font-mono">{userData.empleadoId}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Modalidad</span> <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getWorkLocation(userData.empleadoId) === 'Teletrabajo' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{getWorkLocation(userData.empleadoId)}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-500 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Horario</span> <span>{userData.horario_definido}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Antigüedad</span> <span>{mesesTrabajados} meses</span></div>
          </div>

          <div className="w-full mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between items-center">
            <span className="text-blue-800 text-sm font-semibold">Días Vacaciones</span>
            <span className="text-xl font-black text-blue-600">{diasDisponibles}</span>
          </div>
        </div>
        {!isAdminView && (
          <button onClick={() => setChatOpen(!chatOpen)} className="w-full bg-white text-indigo-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition border border-gray-200 shadow-sm">
            <MessageSquare className="w-5 h-5" /> Chat Interno
          </button>
        )}
      </div>

      <div className="col-span-1 md:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-500" /> Fichaje Diario</h3>
          <div className="flex flex-col sm:flex-row justify-between items-center p-5 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Estado Actual</p>
              <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                <div className={`w-3 h-3 rounded-full animate-pulse ${userData.isClockedIn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className={`font-semibold text-xl ${userData.isClockedIn ? 'text-green-700' : 'text-gray-600'}`}>{userData.isClockedIn ? 'Trabajando' : 'Inactivo'}</span>
              </div>
            </div>
            <div className="flex gap-3">
              {!userData.isClockedIn ? (
                <button onClick={handleClockIn} disabled={isProcessing || isAdminView} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-xl transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Entrar</button>
              ) : (
                <button onClick={handleClockOut} disabled={isProcessing || isAdminView} className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-xl transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Salir</button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Semanal</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-gray-800">{horasTotales.toFixed(1)}</span>
              <span className="text-gray-500 font-medium">/ 40h</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
              <div className={`h-full rounded-full ${superado ? 'bg-orange-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min((horasTotales / 40) * 100, 100)}%` }}></div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm p-6 border flex flex-col justify-center ${superado ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {superado ? <AlertCircle className="w-5 h-5 text-orange-600" /> : <CheckCircle2 className="w-5 h-5 text-green-600" />}
              <h4 className={`font-semibold ${superado ? 'text-orange-800' : 'text-green-800'}`}>{superado ? 'Exceso de jornada' : 'Jornada correcta'}</h4>
            </div>
            {superado ? (
              <p className="text-orange-700 text-sm">Objetivo ajustado prox. semana: <strong>{metaProximaSemana}h</strong></p>
            ) : (
              <p className="text-green-700 text-sm">No hay desviaciones en tu horario.</p>
            )}
          </div>
        </div>
      </div>

      {!isAdminView && chatOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col h-96">
          <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
            <span className="font-semibold text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Admin Chat</span>
            <button onClick={() => setChatOpen(false)} className="hover:text-indigo-200"><X className="w-5 h-5"/></button>
          </div>
          <ChatBox currentUserId={userData.uid} otherParty="admin" />
        </div>
      )}
    </div>
  );
}

// --- MÓDULO DE VACACIONES ---
function VacationModule({ currentUser }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    const q = query(collection(db, 'vacaciones'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSolicitudes(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSolicitar = async (e) => {
    e.preventDefault();
    if (!fechaInicio || !fechaFin || new Date(fechaInicio) > new Date(fechaFin)) {
      alert("Fechas inválidas."); return;
    }
    
    setIsSubmitting(true);
    const dias = calculateDays(fechaInicio, fechaFin);
    
    try {
      await addDoc(collection(db, 'vacaciones'), {
        empleadoUid: currentUser.uid,
        nombreEmpleado: currentUser.nombre,
        fechaInicio,
        fechaFin,
        diasSolicitados: dias,
        estado: 'pendiente',
        timestamp: serverTimestamp()
      });
      setFechaInicio(''); setFechaFin('');
      alert("Solicitud enviada al administrador.");
    } catch (error) { console.error("Error", error); }
    setIsSubmitting(false);
  };

  const handleAprobarRechazar = async (solicitudId, empleadoUid, dias, accion) => {
    if(!window.confirm(`¿Seguro que deseas ${accion} esta solicitud?`)) return;
    
    try {
      await updateDoc(doc(db, 'vacaciones', solicitudId), { estado: accion });
      
      if (accion === 'aprobada') {
        const userRef = doc(db, 'usuarios', empleadoUid);
        const userSnap = await getDoc(userRef);
        if(userSnap.exists()){
            const actualesGastados = userSnap.data().dias_vacaciones_gastados || 0;
            await updateDoc(userRef, { dias_vacaciones_gastados: actualesGastados + dias });
        }
      }
    } catch (error) { console.error("Error", error); }
  };

  const aprobadas = solicitudes.filter(s => s.estado === 'aprobada');
  const misSolicitudes = solicitudes.filter(s => s.empleadoUid === currentUser.uid);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        <h2 className="text-lg font-bold">Gestión de Vacaciones</h2>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {!isAdmin ? (
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">Solicitar Días</h3>
              <form onSubmit={handleSolicitar} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fecha Inicio</label>
                  <input type="date" required value={fechaInicio} onChange={e=>setFechaInicio(e.target.value)} className="w-full border p-2 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fecha Fin</label>
                  <input type="date" required value={fechaFin} onChange={e=>setFechaFin(e.target.value)} className="w-full border p-2 rounded-lg text-sm" />
                </div>
                <div className="text-xs text-gray-500 bg-white p-2 border rounded text-center">
                  Días a consumir: <strong className="text-gray-800">{fechaInicio && fechaFin && new Date(fechaInicio) <= new Date(fechaFin) ? calculateDays(fechaInicio, fechaFin) : 0}</strong>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  Enviar Solicitud
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 max-h-[400px] overflow-y-auto">
              <h3 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">Pendientes <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">{solicitudes.filter(s=>s.estado==='pendiente').length}</span></h3>
              <div className="space-y-3">
                {solicitudes.filter(s => s.estado === 'pendiente').map(s => (
                  <div key={s.id} className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm text-sm">
                    <p className="font-bold text-gray-800">{s.nombreEmpleado}</p>
                    <p className="text-gray-500 mt-1">{formatDate(s.fechaInicio)} al {formatDate(s.fechaFin)}</p>
                    <p className="text-orange-600 font-medium mb-2">{s.diasSolicitados} días solicitados</p>
                    <div className="flex gap-2">
                      <button onClick={()=>handleAprobarRechazar(s.id, s.empleadoUid, s.diasSolicitados, 'aprobada')} className="flex-1 bg-green-100 text-green-700 hover:bg-green-200 py-1.5 rounded flex items-center justify-center gap-1"><Check className="w-4 h-4"/> Aprobar</button>
                      <button onClick={()=>handleAprobarRechazar(s.id, s.empleadoUid, s.diasSolicitados, 'rechazada')} className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 py-1.5 rounded flex items-center justify-center gap-1"><X className="w-4 h-4"/> Rechazar</button>
                    </div>
                  </div>
                ))}
                {solicitudes.filter(s=>s.estado==='pendiente').length === 0 && <p className="text-sm text-gray-500 text-center py-4">No hay solicitudes pendientes.</p>}
              </div>
            </div>
          )}

          {!isAdmin && (
             <div className="bg-white border rounded-xl overflow-hidden">
                <div className="bg-gray-50 p-3 border-b"><h3 className="text-sm font-semibold text-gray-700">Mi Historial</h3></div>
                <div className="max-h-48 overflow-y-auto p-3 space-y-2">
                  {misSolicitudes.map(s => (
                    <div key={s.id} className="text-xs flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                      <div>
                        <p className="font-medium text-gray-800">{formatDate(s.fechaInicio)} - {formatDate(s.fechaFin)}</p>
                        <p className="text-gray-500">{s.diasSolicitados} días</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full font-semibold uppercase text-[9px] ${s.estado==='aprobada'?'bg-green-100 text-green-700': s.estado==='rechazada'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>
                        {s.estado}
                      </span>
                    </div>
                  ))}
                  {misSolicitudes.length === 0 && <p className="text-xs text-center text-gray-400">Sin historial</p>}
                </div>
             </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="border border-gray-200 rounded-xl overflow-hidden h-full">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Ausencias Programadas (Equipo)</h3>
              <p className="text-xs text-gray-500">Solo se muestran las vacaciones aprobadas por dirección.</p>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wider border-b">
                    <th className="pb-2 font-medium">Empleado</th>
                    <th className="pb-2 font-medium">Desde</th>
                    <th className="pb-2 font-medium">Hasta</th>
                    <th className="pb-2 font-medium text-right">Días</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {aprobadas.map(vac => (
                    <tr key={vac.id} className="hover:bg-blue-50/50 transition">
                      <td className="py-3 flex items-center gap-2">
                        <img src={`https://ui-avatars.com/api/?name=${vac.nombreEmpleado}&background=random&size=24`} className="rounded-full" alt=""/>
                        <span className="font-medium text-gray-700 text-sm">{vac.nombreEmpleado}</span>
                      </td>
                      <td className="py-3 text-sm text-gray-600">{formatDate(vac.fechaInicio)}</td>
                      <td className="py-3 text-sm text-gray-600">{formatDate(vac.fechaFin)}</td>
                      <td className="py-3 text-sm font-semibold text-blue-600 text-right">{vac.diasSolicitados} d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {aprobadas.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No hay ausencias programadas próximamente.</div>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- PANEL DE ADMINISTRADOR ---
function AdminDashboard({ adminUser }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const q = collection(db, 'usuarios');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(u => u.role !== 'admin');
      setUsers(usersData);
      if (selectedUser) {
        const updated = usersData.find(u => u.uid === selectedUser.uid);
        if (updated) setSelectedUser(updated);
      }
    });
    return () => unsubscribe();
  }, [selectedUser]);

  const handleDelete = async (uid) => {
    if(window.confirm('¿Seguro que deseas eliminar este registro de usuario?')) {
      try {
        await deleteDoc(doc(db, 'usuarios', uid));
        if(selectedUser?.uid === uid) setSelectedUser(null);
      } catch (error) { console.error(error); }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    const formData = new FormData(e.target);
    const correo = formData.get('correo');
    const password = formData.get('password');

    try {
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, correo, password);
      const newUid = userCredential.user.uid;
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);

      await setDoc(doc(db, 'usuarios', newUid), {
        nombre: formData.get('nombre'),
        correo: correo,
        puesto: formData.get('puesto'),
        empleadoId: formData.get('empleadoId'),
        horario_definido: formData.get('horario_definido'),
        fecha_inicio_contrato: formData.get('fecha_inicio_contrato'),
        dias_vacaciones_gastados: 0,
        total_horas_semana: 0,
        isClockedIn: false,
        clockInTime: null,
        role: 'user'
      });

      setShowAddForm(false);
      alert("¡Usuario creado con éxito!");
    } catch (error) { alert("Error: " + error.message); } 
    finally { setIsCreating(false); }
  };

  if (selectedUser) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedUser(null)} className="text-indigo-600 hover:underline font-medium text-sm flex items-center gap-1">&larr; Volver al Panel</button>
        <div className="bg-white border p-4 rounded-xl flex justify-between items-center shadow-sm">
          <h2 className="font-bold text-gray-800">Gestionando a: <span className="text-indigo-600">{selectedUser.nombre}</span></h2>
          <button onClick={() => handleDelete(selectedUser.uid)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-100 transition flex items-center gap-1"><Trash2 className="w-4 h-4"/> Eliminar Ficha</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><UserProfile userData={selectedUser} isAdminView={true} /></div>
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
             <div className="bg-gray-50 border-b p-3 rounded-t-xl"><h3 className="font-semibold text-gray-700 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Chat Directo</h3></div>
             <ChatBox currentUserId="admin" otherParty={selectedUser.uid} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Users className="w-6 h-6 text-indigo-600" /> Panel de Administración</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona empleados, fichajes y vacaciones.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className={`text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 shadow-sm ${showAddForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showAddForm ? 'Cancelar' : 'Nuevo Empleado'}
        </button>
      </div>
      
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Datos del nuevo empleado</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Contraseña Acceso</label><input name="password" required type="text" placeholder="min. 6 caracteres" minLength="6" className="border border-indigo-200 bg-indigo-50 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Nombre Completo</label><input name="nombre" required type="text" placeholder="Ej: Ana García" className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Correo</label><input name="correo" required type="email" placeholder="ana@systicket.com" className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Puesto</label><input name="puesto" required type="text" placeholder="Ej: Frontend" className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">ID Interno</label><input name="empleadoId" required type="text" placeholder="Ej: A003-XXX" className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Fecha Alta Contrato</label><input name="fecha_inicio_contrato" required type="date" className="border border-blue-200 bg-blue-50 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" title="Necesario para calcular vacaciones" /></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Horario Base</label><input name="horario_definido" required type="text" defaultValue="09:00 - 17:00" className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            
            <div className="col-span-full flex justify-end mt-2 pt-4 border-t">
              <button type="submit" disabled={isCreating} className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 font-bold shadow-md">
                {isCreating ? 'Procesando...' : 'Crear Ficha de Empleado'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="p-4 font-semibold">Empleado</th>
              <th className="p-4 font-semibold">Tipo</th>
              <th className="p-4 font-semibold text-center">Horas Sem.</th>
              <th className="p-4 font-semibold text-center">Vac. Disp.</th>
              <th className="p-4 font-semibold text-center">Estado</th>
              <th className="p-4 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => {
              const meses = getMonthsDiff(u.fecha_inicio_contrato);
              const diasDisp = (meses * 2) - (u.dias_vacaciones_gastados || 0);
              return (
              <tr key={u.uid} className="hover:bg-indigo-50/50 transition cursor-pointer" onClick={() => setSelectedUser(u)}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={`https://ui-avatars.com/api/?name=${u.nombre}&background=e0e7ff&color=4f46e5`} className="w-10 h-10 rounded-full border border-indigo-100" alt="" />
                    <div><p className="font-bold text-gray-800">{u.nombre}</p><p className="text-xs text-gray-500 font-mono">{u.empleadoId}</p></div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.empleadoId?.startsWith('A003') ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{u.empleadoId?.startsWith('A003') ? 'Teletrabajo' : 'Oficina'}</span>
                </td>
                <td className="p-4 text-center"><span className={`font-bold ${(u.total_horas_semana || 0) > 40 ? 'text-orange-600' : 'text-gray-700'}`}>{(u.total_horas_semana || 0).toFixed(1)}h</span></td>
                <td className="p-4 text-center"><span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{diasDisp} d</span></td>
                <td className="p-4 text-center"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.isClockedIn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}><span className={`w-1.5 h-1.5 rounded-full ${u.isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>{u.isClockedIn ? 'Activo' : 'Inactivo'}</span></td>
                <td className="p-4 text-right text-indigo-600 font-semibold text-sm group-hover:underline">Abrir &rarr;</td>
              </tr>
            )})}
          </tbody>
        </table>
        {users.length === 0 && <div className="p-10 text-center text-gray-400">No hay empleados registrados. Usa el botón "Nuevo Empleado".</div>}
      </div>
    </div>
  );
}

// --- CHAT BOX ---
function ChatBox({ currentUserId, otherParty }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const q = collection(db, 'mensajes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = allMsgs.filter(m => (m.from === currentUserId && m.to === otherParty) || (m.from === otherParty && m.to === currentUserId)).sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
      setMessages(filtered);
    });
    return () => unsubscribe();
  }, [currentUserId, otherParty]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try { await addDoc(collection(db, 'mensajes'), { from: currentUserId, to: otherParty, text: text.trim(), timestamp: serverTimestamp() }); setText(''); } catch (error) { console.error(error); }
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.from === currentUserId ? 'items-end' : 'items-start'}`}>
            <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${m.from === currentUserId ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Mensaje..." className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" />
        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition shadow-sm hover:shadow-md transform hover:scale-105"><Send className="w-4 h-4" /></button>
      </form>
    </div>
  );
}