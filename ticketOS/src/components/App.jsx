import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, updateDoc, addDoc, setDoc, deleteDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { Clock, LogOut, MessageSquare, Shield, Trash2, Plus, Users, Send, CheckCircle2, AlertCircle, Briefcase, MapPin } from 'lucide-react';

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
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-indigo-600">
        <Clock className="w-12 h-12 animate-pulse" />
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <nav className="bg-indigo-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Clock className="w-6 h-6" /> sysTicket
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-90">Hola, {user.nombre}</span>
          <button onClick={handleLogout} className="p-2 hover:bg-indigo-700 rounded-full transition" title="Cerrar Sesión">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-6xl mx-auto">
        {user.role === 'admin' ? (
          <AdminDashboard adminUser={user} />
        ) : (
          <UserProfile userData={user} />
        )}
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
      setError('Credenciales incorrectas o usuario no encontrado.');
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-100 p-3 rounded-full mb-2">
            <Clock className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">sysTicket</h1>
          <p className="text-gray-500 text-sm text-center mt-2">Plataforma de Fichado</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="admin@systicket.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" required />
          </div>
          <button disabled={isLoggingIn} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition disabled:bg-indigo-400">
            {isLoggingIn ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
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
    try {
      await updateDoc(doc(db, 'usuarios', userData.uid), { isClockedIn: true, clockInTime: new Date().toISOString() });
    } catch (error) { console.error("Error", error); }
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
    } catch (error) { console.error("Error", error); }
    setIsProcessing(false);
  };

  const metaHoras = 40;
  const horasTotales = userData.total_horas_semana || 0;
  const superado = horasTotales > metaHoras;
  const metaProximaSemana = superado ? (metaHoras - (horasTotales - metaHoras)).toFixed(1) : metaHoras;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center border border-gray-100">
          <img src={`https://ui-avatars.com/api/?name=${userData.nombre}&background=random`} alt="Perfil" className="w-24 h-24 rounded-full mb-4" />
          <h2 className="text-xl font-bold text-gray-800">{userData.nombre}</h2>
          <p className="text-gray-500 text-sm mb-4">{userData.puesto || 'Empleado'}</p>
          <div className="w-full space-y-3 text-sm text-left mt-2">
            <div className="flex items-center gap-2 text-gray-600"><Shield className="w-4 h-4" /> <strong>ID:</strong> {userData.empleadoId}</div>
            <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" /> <strong>Modalidad:</strong> <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{getWorkLocation(userData.empleadoId)}</span></div>
            <div className="flex items-center gap-2 text-gray-600"><Briefcase className="w-4 h-4" /> <strong>Horario:</strong> {userData.horario_definido}</div>
          </div>
        </div>
        {!isAdminView && (
          <button onClick={() => setChatOpen(!chatOpen)} className="w-full bg-blue-50 text-blue-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 transition border border-blue-200">
            <MessageSquare className="w-5 h-5" /> Chat con Administrador
          </button>
        )}
      </div>

      <div className="col-span-1 md:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-500" /> Control de Presencia</h3>
          <div className="flex flex-col sm:flex-row justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 font-medium">Estado</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${userData.isClockedIn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-semibold text-lg">{userData.isClockedIn ? 'Trabajando' : 'Fuera de turno'}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              {!userData.isClockedIn ? (
                <button onClick={handleClockIn} disabled={isProcessing || isAdminView} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition">Fichar Entrada</button>
              ) : (
                <button onClick={handleClockOut} disabled={isProcessing || isAdminView} className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition">Fichar Salida</button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Horas Totales (Esta semana)</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-800">{horasTotales.toFixed(1)}</span>
              <span className="text-gray-500 mb-1">/ 40 h</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div className={`h-2.5 rounded-full ${superado ? 'bg-orange-500' : 'bg-indigo-600'}`} style={{ width: `${Math.min((horasTotales / 40) * 100, 100)}%` }}></div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm p-6 border flex flex-col justify-center ${superado ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {superado ? <AlertCircle className="w-5 h-5 text-orange-600" /> : <CheckCircle2 className="w-5 h-5 text-green-600" />}
              <h4 className={`font-semibold ${superado ? 'text-orange-800' : 'text-green-800'}`}>{superado ? 'Horas Excedidas' : 'Dentro del objetivo'}</h4>
            </div>
            {superado ? (
              <p className="text-orange-700 text-sm">Próxima semana objetivo: {metaProximaSemana}h</p>
            ) : (
              <p className="text-green-700 text-sm">Dentro del límite. Todo en orden.</p>
            )}
          </div>
        </div>
      </div>

      {!isAdminView && chatOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          <div className="bg-indigo-600 text-white p-3 flex justify-between items-center rounded-t-xl">
            <span className="font-semibold text-sm">Chat con Administrador</span>
            <button onClick={() => setChatOpen(false)}>&times;</button>
          </div>
          <ChatBox currentUserId={userData.uid} otherParty="admin" />
        </div>
      )}
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
      } catch (error) { console.error("Error al borrar usuario", error); }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    const formData = new FormData(e.target);
    const correo = formData.get('correo');
    const password = formData.get('password');

    try {
      // 1. Creamos una App secundaria para no cerrar la sesión del admin actual
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Creamos el usuario en Firebase Authentication con la app secundaria
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, correo, password);
      const newUid = userCredential.user.uid;

      // 3. Cerramos sesión y borramos la app secundaria para limpiar
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);

      // 4. Guardamos los datos del usuario en Firestore (usando nuestra app principal)
      await setDoc(doc(db, 'usuarios', newUid), {
        nombre: formData.get('nombre'),
        correo: correo,
        puesto: formData.get('puesto'),
        empleadoId: formData.get('empleadoId'),
        horario_definido: formData.get('horario_definido'),
        total_horas_semana: 0,
        isClockedIn: false,
        clockInTime: null,
        role: 'user'
      });

      setShowAddForm(false);
      alert("¡Usuario creado con éxito!");
    } catch (error) {
      console.error("Error al crear usuario", error);
      alert("Error al crear usuario: " + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (selectedUser) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedUser(null)} className="text-indigo-600 hover:underline font-medium text-sm flex items-center gap-1">&larr; Volver a la lista</button>
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex justify-between items-center">
          <h2 className="font-bold text-indigo-900">Perfil de empleado: {selectedUser.nombre}</h2>
          <button onClick={() => handleDelete(selectedUser.uid)} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-200 transition flex items-center gap-1"><Trash2 className="w-4 h-4"/> Borrar Datos</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><UserProfile userData={selectedUser} isAdminView={true} /></div>
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
             <div className="bg-gray-50 border-b border-gray-200 p-3 rounded-t-xl"><h3 className="font-semibold text-gray-700 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Chat con {selectedUser.nombre.split(' ')[0]}</h3></div>
             <ChatBox currentUserId="admin" otherParty={selectedUser.uid} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Users className="w-6 h-6 text-indigo-600" /> Panel de Administración</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"><Plus className="w-4 h-4" /> {showAddForm ? 'Cancelar' : 'Nuevo Empleado'}</button>
      </div>
      
      {/* NUEVO FORMULARIO AUTOMATIZADO */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Alta de nuevo empleado</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="col-span-1">
              <label className="block text-xs text-gray-500 mb-1">Contraseña de acceso</label>
              <input name="password" required type="text" placeholder="Ej: temporal123" minLength="6" className="border p-2 rounded-lg w-full bg-indigo-50 border-indigo-200" />
            </div>
            
            <div className="col-span-1">
              <label className="block text-xs text-gray-500 mb-1">Nombre completo</label>
              <input name="nombre" required type="text" placeholder="Ej: Ana García" className="border p-2 rounded-lg w-full" />
            </div>
            
            <div className="col-span-1">
              <label className="block text-xs text-gray-500 mb-1">Correo electrónico</label>
              <input name="correo" required type="email" placeholder="ana@systicket.com" className="border p-2 rounded-lg w-full" />
            </div>
            
            <div className="col-span-1">
              <label className="block text-xs text-gray-500 mb-1">Puesto</label>
              <input name="puesto" required type="text" placeholder="Ej: Desarrollador" className="border p-2 rounded-lg w-full" />
            </div>
            
            <div className="col-span-1">
              <label className="block text-xs text-gray-500 mb-1">ID Empleado</label>
              <input name="empleadoId" required type="text" placeholder="Ej: A003-XXX" className="border p-2 rounded-lg w-full" />
            </div>
            
            <div className="col-span-1">
              <label className="block text-xs text-gray-500 mb-1">Horario definido</label>
              <input name="horario_definido" required type="text" defaultValue="09:00 - 17:00" className="border p-2 rounded-lg w-full" />
            </div>
            
            <div className="col-span-full flex justify-end mt-4">
              <button type="submit" disabled={isCreating} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 font-medium">
                {isCreating ? 'Creando cuenta...' : 'Crear y Guardar Empleado'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-sm">
              <th className="p-4 font-semibold">Empleado</th>
              <th className="p-4 font-semibold">ID / Tipo</th>
              <th className="p-4 font-semibold text-center">Horas Sem.</th>
              <th className="p-4 font-semibold text-center">Estado</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.uid} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={`https://ui-avatars.com/api/?name=${u.nombre}&background=random`} className="w-10 h-10 rounded-full" alt="" />
                    <div><p className="font-bold text-gray-800">{u.nombre}</p><p className="text-xs text-gray-500">{u.correo}</p></div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-mono text-sm text-gray-700">{u.empleadoId}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${u.empleadoId?.startsWith('A003') ? 'text-blue-500' : 'text-green-500'}`}>{u.empleadoId?.startsWith('A003') ? 'Teletrabajo' : 'Oficina'}</span>
                </td>
                <td className="p-4 text-center"><span className={`font-semibold ${(u.total_horas_semana || 0) > 40 ? 'text-orange-600' : 'text-gray-700'}`}>{(u.total_horas_semana || 0).toFixed(1)}h</span></td>
                <td className="p-4 text-center"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.isClockedIn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}><span className={`w-1.5 h-1.5 rounded-full ${u.isClockedIn ? 'bg-green-500' : 'bg-gray-400'}`}></span>{u.isClockedIn ? 'Activo' : 'Inactivo'}</span></td>
                <td className="p-4 text-right">
                  <button onClick={() => setSelectedUser(u)} className="text-indigo-600 hover:text-indigo-900 text-sm font-semibold mr-3">Ver Perfil</button>
                  <button onClick={() => handleDelete(u.uid)} className="text-red-500 hover:text-red-700 text-sm p-1"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
    try {
      await addDoc(collection(db, 'mensajes'), { from: currentUserId, to: otherParty, text: text.trim(), timestamp: serverTimestamp() });
      setText('');
    } catch (error) { console.error("Error al enviar mensaje", error); }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[400px]">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.from === currentUserId ? 'items-end' : 'items-start'}`}>
            <div className={`px-3 py-2 rounded-lg max-w-[85%] text-sm ${m.from === currentUserId ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2 text-sm focus:bg-white focus:border-indigo-500 outline-none" />
        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700"><Send className="w-4 h-4" /></button>
      </form>
    </div>
  );
}