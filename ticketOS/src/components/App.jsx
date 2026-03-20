import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, updateDoc, addDoc, setDoc, deleteDoc, serverTimestamp, getFirestore, query, orderBy, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  Clock, LogOut, MessageSquare, Shield, Trash2, Plus, Users, Send,
  CheckCircle2, AlertCircle, Briefcase, MapPin, Calendar, Check, X,
  Download, Paperclip, FileText, Map, FolderKanban, Tag, UserCog,
  ChevronLeft, Sun, Moon, Camera, Edit3, Save, BarChart2, TrendingUp,
  Bell, Settings, Building2, ClipboardList, Timer, ChevronDown,
  AlertTriangle, Info, Home, Wifi
} from 'lucide-react';

// ─── FIREBASE ────────────────────────────────────────────────────────────────
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

// ─── EMAILJS CONFIG ───────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'TU_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'TU_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'TU_PUBLIC_KEY';

const sendEmailNotification = async (toEmail, toName, subject, message) => {
  try {
    if (!window.emailjs) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
    }
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: toEmail,
      to_name: toName,
      subject,
      message,
    });
    console.log('✅ Email enviado a', toEmail);
    return true;
  } catch (err) {
    console.error('❌ Error enviando email:', err);
    return false;
  }
};

// ─── TRADUCCIONES COMPLETAS ───────────────────────────────────────────────────
const LANGS = {
  es: {
    flag: 'es',
    name: 'Español',
    greeting: 'Hola',
    logout: 'Cerrar sesión',
    tabStatus: 'Estado',
    tabAbsence: 'Ausencias',
    tabProjects: 'Proyectos',
    tabReports: 'Informes',
    tabTeam: 'Equipo',
    status: 'Estado Actual',
    active: 'Trabajando',
    inactive: 'Inactivo',
    clockIn: 'Fichar Entrada',
    clockOut: 'Terminar Jornada',
    updateEntry: 'Actualizar entrada',
    save: 'Guardar',
    dailyLimit: 'Jornada Diaria (8h)',
    weeklyLimit: 'Total Semanal',
    vacations: 'Días Disponibles',
    bonus: 'Bono Acumulado',
    vacLimit: 'Límite',
    workMode: 'Modalidad',
    remote: 'Teletrabajo',
    office: 'Oficina',
    schedule: 'Horario',
    department: 'Departamento',
    absence: 'Gestión de Ausencias',
    newRequest: 'Nueva Solicitud',
    sendRequest: 'Enviar Solicitud',
    myHistory: 'Mi Historial',
    teamApproved: 'Ausencias Aprobadas (Equipo)',
    pending: 'Pendientes',
    approve: 'Aprobar',
    reject: 'Rechazar',
    medicalLeave: 'Baja Médica',
    medicalAppt: 'Cita Médica',
    invalidDates: 'Fechas inválidas',
    requestSent: 'Solicitud enviada',
    adminPanel: 'Panel de Administración',
    employees: 'Empleados',
    reports: 'Informes',
    departments: 'Departamentos',
    addEmployee: 'Añadir Empleado',
    exportCSV: 'Exportar CSV',
    teamStatus: 'Estado del Equipo',
    configSaved: 'Configuración guardada',
    extraHourValue: 'Valor Hora Extra (€)',
    vacDaysLimit: 'Límite días vacaciones',
    saveChanges: 'Guardar cambios',
    hoursProject: 'Horas por Proyecto',
    upload: 'Subir archivo',
    advancedReports: 'Informes Avanzados',
    contacts: 'Contactos',
    message: 'Mensaje...',
    emailSent: 'Email enviado',
    viewMap: 'Ver Mapa',
    projects: 'Proyectos',
    listaProyectos: ['Tareas Generales', 'Desarrollo Frontend', 'Desarrollo Backend', 'Soporte Técnico', 'Reuniones de Equipo', 'Formación / I+D', 'Gestión / Administración'],
    roles: { user: 'Empleado', supervisor: 'Supervisor', rh: 'Recursos Humanos' },
    viewProfile: 'Ver Perfil',
    close: 'Cerrar',
    employeeDetails: 'Detalles del Empleado',
    gps: 'GPS',
    action: 'Acción',
    view: 'Ver',
    // NUEVAS CLAVES
    loginEmail: 'Correo',
    loginPassword: 'Contraseña',
    loginButton: 'Iniciar Sesión',
    loginSigningIn: 'Iniciando...',
    loginInvalid: 'Credenciales incorrectas.',
    loginSubtitle: 'Plataforma de Gestión Empresarial',
    darkModeTooltip: 'Modo oscuro',
    lightModeTooltip: 'Modo claro',
    premiumBadge: 'PREMIUM',
    maxSizeError: 'Máx 5 MB',
    photoUpdated: 'Foto actualizada ✓',
    photoError: 'Error al subir imagen',
    clockInError: 'Error al fichar',
    generalError: 'Error',
    changePhoto: 'Cambiar',
    entryLabel: 'Entrada',
    saveButton: 'Guardar',
    idLabel: 'ID',
    overtimeWarning: '⚠️ {hours}h hoy — superaste las 8h',
    tableEmployees: 'Empleados',
    tableStatus: 'Estado',
    tableProjects: 'Proyectos',
    tableGPS: 'GPS',
    tableAction: 'Acción',
    viewProfileButton: 'Ver Perfil',
    closeButton: 'Cerrar',
    employeeDetailsTitle: 'Detalles del Empleado',
    employeeCount: '{count} empleados · sysTicket Premium',
    addEmployeeButton: 'Añadir Empleado',
    createEmployeeButton: 'Crear Empleado',
    roleLabel: 'Rol',
    workModeLabel: 'Modalidad',
    departmentLabel: 'Departamento',
    noDepartment: 'Sin departamento',
    fullNameLabel: 'Nombre completo',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña (mín 6)',
    positionLabel: 'Puesto / Cargo',
    startDateLabel: 'Inicio contrato',
    scheduleLabel: 'Horario',
    employeeCreated: 'Empleado creado ✓',
    errorPrefix: 'Error: ',
    deleteConfirm: '¿Eliminar empleado?',
    configTab: 'Config',
    tableWorkMode: 'Modalidad',
    tableHoursWeek: 'Hrs Sem.',
    tableGPSLink: 'Ver',
    workModeOffice: 'Oficina',
    workModeRemote: 'Teletrabajo',
    deleteButton: 'Borrar',
    departmentPlaceholder: 'Nombre del departamento',
    addButton: 'Añadir',
    departmentCreated: 'Departamento creado',
    totalEmployees: 'Total empleados',
    workingNow: 'Trabajando ahora',
    totalHoursWeek: 'Horas sem. total',
    avgHoursPerEmployee: 'Media h/empleado',
    reportEmployee: 'Empleado',
    reportHours: 'Horas',
    reportStatus: 'Estado',
    reportVacationDays: 'Vac.',
    noData: 'Sin datos aún.',
    uploadSuccess: 'Archivo subido ✓',
    uploadError: 'Error al subir',
    viewLink: 'Ver',
    reportDate: 'Fecha',
    reportClockIn: 'Entrada',
    reportClockOut: 'Salida',
    reportProject: 'Proyecto',
    inProgress: 'En curso',
    vacationOption: '🏖 Vacaciones',
    medicalLeaveOption: '🏥 {medicalLeave}',
    medicalApptOption: '🩺 {medicalAppt}',
    daysUnit: 'días',
    viewJustification: 'Ver justificante',
    noPendingRequests: 'Sin solicitudes pendientes ✓',
    requestApproved: '✅ Solicitud aprobada',
    requestRejected: '❌ Solicitud rechazada',
    noContacts: 'Sin contactos',
    fileAttachment: 'Archivo',
    //Encabezados de la tabla aprobadas
    reportType: 'Tipo',
    reportDates: 'Fechas',
    reportDays: 'Días',
    //Ausencias aprobadas
    typeVacation: 'Vacaciones',
    typeMedicalLeave: 'Baja médica',
    typeMedicalAppt: 'Cita médica',
    statusApproved: 'Aprobada',
    statusRejected: 'Rechazada',
    statusPending: 'Pendiente',
    //Adjunto archivos
    selectFile: 'Seleccionar archivo',
    noFileSelected: 'Ningún archivo seleccionado',
  },
  en: {
    flag: 'us',
    name: 'English',
    greeting: 'Hello',
    logout: 'Logout',
    tabStatus: 'Status',
    tabAbsence: 'Absences',
    tabProjects: 'Projects',
    tabReports: 'Reports',
    tabTeam: 'Team',
    status: 'Current Status',
    active: 'Working',
    inactive: 'Inactive',
    clockIn: 'Clock In',
    clockOut: 'Clock Out',
    updateEntry: 'Update entry',
    save: 'Save',
    dailyLimit: 'Daily Shift (8h)',
    weeklyLimit: 'Weekly Total',
    vacations: 'Days Available',
    bonus: 'Earned Bonus',
    vacLimit: 'Limit',
    workMode: 'Work mode',
    remote: 'Remote',
    office: 'Office',
    schedule: 'Schedule',
    department: 'Department',
    absence: 'Absence Management',
    newRequest: 'New Request',
    sendRequest: 'Send Request',
    myHistory: 'My History',
    teamApproved: 'Approved Absences (Team)',
    pending: 'Pending',
    approve: 'Approve',
    reject: 'Reject',
    medicalLeave: 'Medical Leave',
    medicalAppt: 'Medical Appointment',
    invalidDates: 'Invalid dates',
    requestSent: 'Request sent',
    adminPanel: 'Admin Dashboard',
    employees: 'Employees',
    reports: 'Reports',
    departments: 'Departments',
    addEmployee: 'Add Employee',
    exportCSV: 'Export CSV',
    teamStatus: 'Team Status',
    configSaved: 'Config saved',
    extraHourValue: 'Extra Hour Value (€)',
    vacDaysLimit: 'Vacation days limit',
    saveChanges: 'Save changes',
    hoursProject: 'Hours by Project',
    upload: 'Upload file',
    advancedReports: 'Advanced Reports',
    contacts: 'Contacts',
    message: 'Message...',
    emailSent: 'Email sent',
    viewMap: 'View Map',
    projects: 'Projects',
    listaProyectos: ['General Tasks', 'Frontend Dev', 'Backend Dev', 'Tech Support', 'Team Meetings', 'Training / R&D', 'Management'],
    roles: { user: 'Employee', supervisor: 'Supervisor', rh: 'HR' },
    viewProfile: 'View Profile',
    close: 'Close',
    employeeDetails: 'Employee Details',
    gps: 'GPS',
    action: 'Action',
    view: 'View',
    // NUEVAS CLAVES
    loginEmail: 'Email',
    loginPassword: 'Password',
    loginButton: 'Sign In',
    loginSigningIn: 'Signing in...',
    loginInvalid: 'Invalid credentials.',
    loginSubtitle: 'Business Management Platform',
    darkModeTooltip: 'Dark mode',
    lightModeTooltip: 'Light mode',
    premiumBadge: 'PREMIUM',
    maxSizeError: 'Max 5 MB',
    photoUpdated: 'Photo updated ✓',
    photoError: 'Error uploading image',
    clockInError: 'Error clocking in',
    generalError: 'Error',
    changePhoto: 'Change',
    entryLabel: 'Clock-in',
    saveButton: 'Save',
    idLabel: 'ID',
    overtimeWarning: '⚠️ {hours}h today — you exceeded 8h',
    tableEmployees: 'Employees',
    tableStatus: 'Status',
    tableProjects: 'Projects',
    tableGPS: 'GPS',
    tableAction: 'Action',
    viewProfileButton: 'View Profile',
    closeButton: 'Close',
    employeeDetailsTitle: 'Employee Details',
    employeeCount: '{count} employees · sysTicket Premium',
    addEmployeeButton: 'Add Employee',
    createEmployeeButton: 'Create Employee',
    roleLabel: 'Role',
    workModeLabel: 'Work mode',
    departmentLabel: 'Department',
    noDepartment: 'No department',
    fullNameLabel: 'Full name',
    emailLabel: 'Email',
    passwordLabel: 'Password (min 6)',
    positionLabel: 'Position',
    startDateLabel: 'Start date',
    scheduleLabel: 'Schedule',
    employeeCreated: 'Employee created ✓',
    errorPrefix: 'Error: ',
    deleteConfirm: 'Delete employee?',
    configTab: 'Config',
    tableWorkMode: 'Work mode',
    tableHoursWeek: 'Hrs Week',
    tableGPSLink: 'View',
    workModeOffice: 'Office',
    workModeRemote: 'Remote',
    deleteButton: 'Delete',
    departmentPlaceholder: 'Department name',
    addButton: 'Add',
    departmentCreated: 'Department created',
    totalEmployees: 'Total employees',
    workingNow: 'Working now',
    totalHoursWeek: 'Total weekly hours',
    avgHoursPerEmployee: 'Avg hours/employee',
    reportEmployee: 'Employee',
    reportHours: 'Hours',
    reportStatus: 'Status',
    reportVacationDays: 'Vac.',
    noData: 'No data yet.',
    uploadSuccess: 'File uploaded ✓',
    uploadError: 'Error uploading',
    viewLink: 'View',
    reportDate: 'Date',
    reportClockIn: 'Clock In',
    reportClockOut: 'Clock Out',
    reportProject: 'Project',
    inProgress: 'In progress',
    vacationOption: '🏖 Vacation',
    medicalLeaveOption: '🏥 {medicalLeave}',
    medicalApptOption: '🩺 {medicalAppt}',
    daysUnit: 'days',
    viewJustification: 'View proof',
    noPendingRequests: 'No pending requests ✓',
    requestApproved: '✅ Request approved',
    requestRejected: '❌ Request rejected',
    noContacts: 'No contacts',
    fileAttachment: 'File',
    //Encabezados de la tabla aprobadas
    reportType: 'Type',
    reportDates: 'Dates',
    reportDays: 'Days',
    //Ausencias aprobadas
    typeVacation: 'Vacation',
    typeMedicalLeave: 'Medical leave',
    typeMedicalAppt: 'Medical appointment',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    statusPending: 'Pending',
    //Adjunto archivos
    selectFile: 'Select file',
    noFileSelected: 'No file selected',
  },
  fr: {
    flag: 'fr',
    name: 'Français',
    greeting: 'Bonjour',
    logout: 'Déconnexion',
    tabStatus: 'Statut',
    tabAbsence: 'Absences',
    tabProjects: 'Projets',
    tabReports: 'Rapports',
    tabTeam: 'Équipe',
    status: 'Statut actuel',
    active: 'En travail',
    inactive: 'Inactif',
    clockIn: 'Pointer entrée',
    clockOut: 'Terminer journée',
    updateEntry: "Modifier l'heure",
    save: 'Enregistrer',
    dailyLimit: 'Journée (8h)',
    weeklyLimit: 'Total hebdo',
    vacations: 'Jours disponibles',
    bonus: 'Bonus accumulé',
    vacLimit: 'Limite',
    workMode: 'Mode travail',
    remote: 'Télétravail',
    office: 'Bureau',
    schedule: 'Horaire',
    department: 'Département',
    absence: 'Gestion des absences',
    newRequest: 'Nouvelle demande',
    sendRequest: 'Envoyer',
    myHistory: 'Mon historique',
    teamApproved: 'Absences approuvées (équipe)',
    pending: 'En attente',
    approve: 'Approuver',
    reject: 'Refuser',
    medicalLeave: 'Congé maladie',
    medicalAppt: 'Rendez-vous médical',
    invalidDates: 'Dates invalides',
    requestSent: 'Demande envoyée',
    adminPanel: "Panneau d'admin",
    employees: 'Employés',
    reports: 'Rapports',
    departments: 'Départements',
    addEmployee: 'Ajouter employé',
    exportCSV: 'Exporter CSV',
    teamStatus: "État de l'équipe",
    configSaved: 'Config sauvegardée',
    extraHourValue: 'Valeur heure supp. (€)',
    vacDaysLimit: 'Limite jours congés',
    saveChanges: 'Sauvegarder',
    hoursProject: 'Heures par projet',
    upload: 'Télécharger fichier',
    advancedReports: 'Rapports avancés',
    contacts: 'Contacts',
    message: 'Message...',
    emailSent: 'Email envoyé',
    viewMap: 'Voir la carte',
    projects: 'Projets',
    listaProyectos: ['Tâches générales', 'Dev Frontend', 'Dev Backend', 'Support technique', 'Réunions', 'Formation / R&D', 'Gestion / Admin'],
    roles: { user: 'Employé', supervisor: 'Superviseur', rh: 'RH' },
    viewProfile: 'Voir le profil',
    close: 'Fermer',
    employeeDetails: "Détails de l'employé",
    gps: 'GPS',
    action: 'Action',
    view: 'Voir',
    // NUEVAS CLAVES
    loginEmail: 'Email',
    loginPassword: 'Mot de passe',
    loginButton: 'Connexion',
    loginSigningIn: 'Connexion en cours...',
    loginInvalid: 'Identifiants incorrects.',
    loginSubtitle: "Plateforme de gestion d'entreprise",
    darkModeTooltip: 'Mode sombre',
    lightModeTooltip: 'Mode clair',
    premiumBadge: 'PREMIUM',
    maxSizeError: 'Max 5 Mo',
    photoUpdated: 'Photo mise à jour ✓',
    photoError: 'Erreur lors du téléchargement',
    clockInError: 'Erreur de pointage',
    generalError: 'Erreur',
    changePhoto: 'Changer',
    entryLabel: 'Entrée',
    saveButton: 'Enregistrer',
    idLabel: 'ID',
    overtimeWarning: "⚠️ {hours}h aujourd'hui — vous avez dépassé 8h",
    tableEmployees: 'Employés',
    tableStatus: 'Statut',
    tableProjects: 'Projets',
    tableGPS: 'GPS',
    tableAction: 'Action',
    viewProfileButton: 'Voir le profil',
    closeButton: 'Fermer',
    employeeDetailsTitle: "Détails de l'employé",
    employeeCount: '{count} employés · sysTicket Premium',
    addEmployeeButton: 'Ajouter un employé',
    createEmployeeButton: 'Créer un employé',
    roleLabel: 'Rôle',
    workModeLabel: 'Mode de travail',
    departmentLabel: 'Département',
    noDepartment: 'Aucun département',
    fullNameLabel: 'Nom complet',
    emailLabel: 'Email',
    passwordLabel: 'Mot de passe (min 6)',
    positionLabel: 'Poste',
    startDateLabel: 'Date de début',
    scheduleLabel: 'Horaire',
    employeeCreated: 'Employé créé ✓',
    errorPrefix: 'Erreur : ',
    deleteConfirm: "Supprimer l'employé ?",
    configTab: 'Config',
    tableWorkMode: 'Mode de travail',
    tableHoursWeek: 'Heures/sem.',
    tableGPSLink: 'Voir',
    workModeOffice: 'Bureau',
    workModeRemote: 'Télétravail',
    deleteButton: 'Supprimer',
    departmentPlaceholder: 'Nom du département',
    addButton: 'Ajouter',
    departmentCreated: 'Département créé',
    totalEmployees: 'Total employés',
    workingNow: 'En travail maintenant',
    totalHoursWeek: 'Heures totales semaine',
    avgHoursPerEmployee: 'Moyenne heures/employé',
    reportEmployee: 'Employé',
    reportHours: 'Heures',
    reportStatus: 'Statut',
    reportVacationDays: 'Congés',
    noData: 'Aucune donnée pour le moment.',
    uploadSuccess: 'Fichier téléchargé ✓',
    uploadError: 'Erreur de téléchargement',
    viewLink: 'Voir',
    reportDate: 'Date',
    reportClockIn: 'Entrée',
    reportClockOut: 'Sortie',
    reportProject: 'Projet',
    inProgress: 'En cours',
    vacationOption: '🏖 Vacances',
    medicalLeaveOption: '🏥 {medicalLeave}',
    medicalApptOption: '🩺 {medicalAppt}',
    daysUnit: 'jours',
    viewJustification: 'Voir justificatif',
    noPendingRequests: 'Aucune demande en attente ✓',
    requestApproved: '✅ Demande approuvée',
    requestRejected: '❌ Demande rejetée',
    noContacts: 'Aucun contact',
    fileAttachment: 'Fichier',
    //Encabezados de la tabla aprobadas
    reportType: 'Type',
    reportDates: 'Dates',
    reportDays: 'Jours',
    //Ausencias aprobadas
    typeVacation: 'Vacances',
    typeMedicalLeave: 'Congé maladie',
    typeMedicalAppt: 'Rendez-vous médical',
    statusApproved: 'Approuvée',
    statusRejected: 'Rejetée',
    statusPending: 'En attente',
    //Adjunto archivos
    selectFile: 'Sélectionner un fichier',
    noFileSelected: 'Aucun fichier sélectionné',
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getMonthsDiff = (startDate) => {
  if (!startDate) return 0;
  const start = new Date(startDate); const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12 - start.getMonth() + now.getMonth();
  return months <= 0 ? 0 : months;
};
const formatDate = (ds) => {
  if (!ds) return '';
  const [y, m, d] = ds.split('-');
  return `${d}/${m}/${y}`;
};
const calculateDays = (s, e) => Math.ceil(Math.abs(new Date(e) - new Date(s)) / 86400000) + 1;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);
  const c = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-indigo-500', warning: 'bg-amber-500' };
  return (
    <div className={`fixed top-5 right-5 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl text-white shadow-2xl ${c[type]}`}
      style={{ animation: 'slideInRight 0.3s ease' }}>
      {type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
      {type === 'error'   && <AlertCircle   className="w-5 h-5 flex-shrink-0" />}
      {type === 'info'    && <Info           className="w-5 h-5 flex-shrink-0" />}
      {type === 'warning' && <AlertTriangle  className="w-5 h-5 flex-shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [chatOpen, setChatOpen]   = useState(false);
  const [darkMode, setDarkMode]   = useState(() => localStorage.getItem('st_dark') === 'true');
  const [lang, setLang]           = useState(() => localStorage.getItem('st_lang') || 'es');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [config, setConfig]       = useState({ bono_hora: 8, limite_dias_vacaciones: 21 });
  const [toast, setToast]         = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  const showToast = (message, type = 'success') => setToast({ message, type });
  const T = LANGS[lang] || LANGS.es;

  // Aplicar dark mode al elemento raíz
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('st_dark', darkMode);
  }, [darkMode]);

  useEffect(() => { localStorage.setItem('st_lang', lang); }, [lang]);

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, 'config', 'general'), snap => {
      if (snap.exists()) setConfig(snap.data());
      else setDoc(doc(db, 'config', 'general'), { bono_hora: 8, limite_dias_vacaciones: 21 });
    });
    let unsubUser = null;
    const unsubAuth = onAuthStateChanged(auth, async (fu) => {
      if (fu) {
        unsubUser = onSnapshot(doc(db, 'usuarios', fu.uid), (snap) => {
          if (snap.exists()) {
            setUser({ uid: fu.uid, ...snap.data() });
          } else {
            const adminData = { role: 'admin', nombre: 'Administrador Principal', correo: fu.email, empleadoId: 'ADMIN-000', modalidadTrabajo: 'office' };
            setDoc(doc(db, 'usuarios', fu.uid), adminData);
            setUser({ uid: fu.uid, ...adminData });
          }
          setLoading(false);
        });
      } else {
        setUser(null); setLoading(false);
        if (unsubUser) unsubUser();
      }
    });
    return () => { unsubAuth(); unsubConfig(); if (unsubUser) unsubUser(); };
  }, []);

  useEffect(() => {
    if (!user) return;
    const canApprove = ['admin', 'rh', 'supervisor'].includes(user.role);
    if (!canApprove) return;
    const unsub = onSnapshot(
      query(collection(db, 'vacaciones'), where('estado', '==', 'pendiente')),
      snap => setNotifCount(snap.size)
    );
    return () => unsub();
  }, [user]);

  const handleLogout = async () => { try { await signOut(auth); } catch (e) {} };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <Clock className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="text-gray-400 text-sm">sysTicket</p>
      </div>
    </div>
  );

if (!user) return <LoginScreen darkMode={darkMode} setDarkMode={setDarkMode} T={T}/>;

  return (
    <>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .custom-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
          padding-right: 2.5rem;
        }
        .dark .custom-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        }
        .custom-select option {
          background: white;
          color: #1e293b;
        }
        .dark .custom-select option {
          background: #1e293b;
          color: #f1f5f9;
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-200">

        {/* ── NAV ── */}
        <nav className="bg-indigo-600 dark:bg-indigo-950 text-white shadow-md flex justify-between items-center sticky top-0 z-40 px-4 h-14">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Clock className="w-5 h-5" /> sysTicket
            <span className="hidden sm:inline text-[9px] font-normal bg-white/20 px-1.5 py-0.5 rounded-full">PREMIUM</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Selector idioma con banderas (requiere flag-icons) */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(v => !v)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/15 transition text-base leading-none"
              >
                <span className={`fi fi-${LANGS[lang].flag}`} style={{ fontSize: '1.2em', lineHeight: 1 }}></span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden min-w-[140px]">
                  {Object.entries(LANGS).map(([code, data]) => (
                    <button
                      key={code}
                      onClick={() => { setLang(code); setShowLangMenu(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 transition ${lang === code ? 'font-bold bg-indigo-50 dark:bg-indigo-900/40' : ''}`}
                    >
                      <span className={`fi fi-${data.flag}`} style={{ fontSize: '1.2em' }}></span>
                      {data.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setDarkMode(d => !d)}
              className="p-2 rounded-full hover:bg-white/15 transition"
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {['admin', 'rh', 'supervisor'].includes(user.role) && (
              <button onClick={() => setActiveTab('absence')} className="relative p-2 rounded-full hover:bg-white/15 transition">
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center">{notifCount}</span>
                )}
              </button>
            )}

            <span className="hidden sm:flex items-center gap-1 text-sm opacity-90 border-l border-white/20 pl-3 ml-1">
              {user.role === 'supervisor' && <UserCog className="w-4 h-4 text-indigo-200" />}
              {T.greeting}, {user.nombre?.split(' ')[0]}
            </span>
            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-500 transition ml-1" title={T.logout}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </nav>

        {/* ── TABS (solo no-admin) ── */}
        {user.role !== 'admin' && (
          <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-14 z-30">
            <div className="max-w-6xl mx-auto flex overflow-x-auto scrollbar-none">
              {[
                { id: 'dashboard', label: T.tabStatus,   icon: <Clock className="w-4 h-4" /> },
                { id: 'absence',   label: T.tabAbsence,  icon: <Calendar className="w-4 h-4" /> },
                { id: 'projects',  label: T.tabProjects, icon: <FolderKanban className="w-4 h-4" /> },
                { id: 'reports',   label: T.tabReports,  icon: <BarChart2 className="w-4 h-4" /> },
                ...(user.role === 'supervisor'
                  ? [{ id: 'team', label: T.tabTeam, icon: <Users className="w-4 h-4" /> }]
                  : []),
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── MAIN ── */}
        <main className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 pb-24">
          {user.role === 'admin' ? (
            <AdminDashboard adminUser={user} config={config} T={T} showToast={showToast} />
          ) : (
            <>
              {activeTab === 'dashboard' && <UserProfile userData={user} config={config} T={T} isAdminView={false} showToast={showToast} />}
              {activeTab === 'absence'   && <AbsenceModule currentUser={user} T={T} showToast={showToast} />}
              {activeTab === 'projects'  && <ProjectsTab currentUser={user} T={T} showToast={showToast} />}
              {activeTab === 'reports'   && <ReportsTab currentUser={user} T={T} />}
              {activeTab === 'team' && user.role === 'supervisor' && <TeamStatus T={T} />}
            </>
          )}
        </main>

        {/* ── CHAT FLOTANTE ── */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {chatOpen && (
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col"
              style={{ width: '340px', height: '500px' }}
            >
              <GlobalChatManager currentUser={user} onClose={() => setChatOpen(false)} T={T} />
            </div>
          )}
          <button
            onClick={() => setChatOpen(v => !v)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform"
          >
            {chatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ darkMode, setDarkMode, T }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError(T.loginInvalid);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4 relative transition-colors duration-200">
      <button
        onClick={() => setDarkMode(prev => !prev)}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md hover:scale-105 transition z-10"
        title={darkMode ? T.lightModeTooltip : T.darkModeTooltip}
      >
        {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
      </button>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl mb-3 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-white">sysTicket</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{T.loginSubtitle}</p>
          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold mt-1">{T.premiumBadge}</span>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-4 flex items-center gap-2 border border-red-100 dark:border-red-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{T.loginEmail}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
              placeholder={T.loginEmail}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{T.loginPassword}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
              placeholder={T.loginPassword}
            />
          </div>
          <button
            disabled={busy}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
          >
            {busy ? T.loginSigningIn : T.loginButton}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── PERFIL DE USUARIO (con soporte para vista de solo lectura) ───────────────
function UserProfile({ userData, config, T, isAdminView = false, showToast, isReadOnly = false }) {
  const [isProcessing, setIsProcessing]         = useState(false);
  const [proyecto, setProyecto]                 = useState(userData.proyectoActual || (T.listaProyectos[0]));
  const [isUploadingPic, setIsUploadingPic]     = useState(false);
  const [editClockIn, setEditClockIn]           = useState(false);
  const [newClockInTime, setNewClockInTime]     = useState('');

  const listaProyectos = T.listaProyectos;

  const handleImageUpload = async (e) => {
    if (isReadOnly) return;
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast(T.maxSizeError, 'error'); return; }
    setIsUploadingPic(true);
    try {
      const fRef = ref(storage, `perfiles/${userData.uid}_${Date.now()}`);
      await uploadBytes(fRef, file);
      const url = await getDownloadURL(fRef);
      await updateDoc(doc(db, 'usuarios', userData.uid), { photoURL: url });
      showToast(T.photoUpdated);
    } catch { showToast(T.photoError, 'error'); }
    setIsUploadingPic(false);
  };

  const handleClockIn = async () => {
    if (isReadOnly) return;
    setIsProcessing(true);
    let ubicacion = null;
    try {
      if ('geolocation' in navigator) {
        ubicacion = await new Promise(resolve => {
          navigator.geolocation.getCurrentPosition(
            p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => resolve(null), { timeout: 8000 }
          );
        });
      }
      await updateDoc(doc(db, 'usuarios', userData.uid), {
        isClockedIn: true,
        clockInTime: new Date().toISOString(),
        proyectoActual: proyecto,
        ...(ubicacion ? { ultimaUbicacion: ubicacion } : {}),
      });
      await addDoc(collection(db, 'fichajes'), {
        uid: userData.uid, nombre: userData.nombre,
        entrada: new Date().toISOString(), salida: null,
        proyecto, ubicacion,
        fecha: new Date().toISOString().split('T')[0],
      });
      showToast(T.clockIn + ' ✓');
    } catch (err) { console.error(err); showToast(T.clockInError, 'error'); }
    setIsProcessing(false);
  };

  const handleClockOut = async () => {
    if (isReadOnly) return;
    setIsProcessing(true);
    try {
      const inTime  = new Date(userData.clockInTime);
      const outTime = new Date();
      const hrs     = (outTime - inTime) / 3600000;
      const today   = outTime.toISOString().split('T')[0];
      const horasHoy = userData.fecha_ultimo_fichaje === today
        ? (userData.horas_hoy || 0) + hrs : hrs;
      const totalSem = (userData.total_horas_semana || 0) + hrs;

      await updateDoc(doc(db, 'usuarios', userData.uid), {
        isClockedIn: false, clockInTime: null,
        total_horas_semana: totalSem,
        horas_hoy: horasHoy, fecha_ultimo_fichaje: today,
        ultimaUbicacion: null, proyectoActual: null,
      });
      if (horasHoy > 8) showToast(T.overtimeWarning.replace('{hours}', horasHoy.toFixed(1)), 'warning');
      else              showToast(`${T.clockOut} — ${hrs.toFixed(1)}h`);
    } catch (err) { console.error(err); showToast(T.generalError, 'error'); }
    setIsProcessing(false);
  };

  const handleUpdateClockIn = async () => {
    if (isReadOnly) return;
    if (!newClockInTime) return;
    const today = new Date().toISOString().split('T')[0];
    await updateDoc(doc(db, 'usuarios', userData.uid), {
      clockInTime: new Date(`${today}T${newClockInTime}`).toISOString(),
    });
    showToast(T.updateEntry + ' ✓');
    setEditClockIn(false);
  };

  const horasSemanales   = userData.total_horas_semana || 0;
  const today            = new Date().toISOString().split('T')[0];
  const horasDiarias     = userData.fecha_ultimo_fichaje === today ? (userData.horas_hoy || 0) : 0;
  const limiteVac        = config?.limite_dias_vacaciones || 21;
  const meses            = getMonthsDiff(userData.fecha_inicio_contrato);
  const diasGen          = meses * 2;
  const diasGast         = userData.dias_vacaciones_gastados || 0;
  const diasDisp         = Math.min(diasGen - diasGast, limiteVac);
  const diasSobrantes    = (diasGen - diasGast) - limiteVac;
  const bonoEuros        = diasSobrantes > 0 ? diasSobrantes * 8 * (config?.bono_hora || 8) : 0;
  const clockInFmt       = userData.clockInTime
    ? new Date(userData.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
  const modalidad        = userData.modalidadTrabajo === 'remote' ? T.remote : T.office;
  const modalidadColor   = userData.modalidadTrabajo === 'remote'
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Tarjeta perfil */}
      <div className="col-span-1">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="h-20 bg-gradient-to-br from-indigo-500 to-indigo-700" />
          <div className="px-6 pb-6 -mt-10 flex flex-col items-center text-center">
            <label className={`relative group ${isUploadingPic ? 'opacity-50 cursor-wait' : ''} ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
              <img
                src={userData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.nombre || 'U')}&background=4f46e5&color=fff&size=150`}
                alt="Avatar"
                className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 shadow-lg object-cover bg-white"
              />
              {!isReadOnly && !isAdminView && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition gap-0.5">
                  <Camera className="w-5 h-5" />
                  <span className="text-[9px] font-bold">{isUploadingPic ? '...' : T.changePhoto}</span>
                </div>
              )}
              {!isReadOnly && !isAdminView && <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingPic} />}
            </label>

            <h2 className="text-lg font-bold mt-3 flex items-center gap-1">
              {userData.nombre}
              {userData.role === 'supervisor' && <UserCog className="w-4 h-4 text-indigo-500" />}
            </h2>
            <p className="text-gray-400 text-sm">{userData.puesto || T.roles.user}</p>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${
              userData.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
              : userData.role === 'supervisor' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
              : userData.role === 'rh' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300'
            }`}>{userData.role}</span>

            <div className="w-full mt-4 space-y-2 text-sm border-t dark:border-slate-700 pt-4">
              <Row icon={<Shield className="w-3.5 h-3.5" />} label={T.idLabel}>
                <span className="font-mono text-xs bg-gray-50 dark:bg-slate-700 px-2 py-0.5 rounded">{userData.empleadoId}</span>
              </Row>
              <Row icon={<MapPin className="w-3.5 h-3.5" />} label={T.workMode}>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${modalidadColor}`}>{modalidad}</span>
              </Row>
              <Row icon={<Briefcase className="w-3.5 h-3.5" />} label={T.schedule}>
                <span className="text-xs">{userData.horario_definido}</span>
              </Row>
              {userData.departamento && (
                <Row icon={<Building2 className="w-3.5 h-3.5" />} label={T.department}>
                  <span className="text-xs">{userData.departamento}</span>
                </Row>
              )}
            </div>

            <div className="w-full mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-blue-800 dark:text-blue-300 text-xs font-semibold">{T.vacations}</p>
                <p className="text-[10px] text-blue-400">{T.vacLimit}: {limiteVac}d</p>
              </div>
              <span className={`text-2xl font-black ${diasDisp <= 3 ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>{diasDisp}</span>
            </div>
            {bonoEuros > 0 && (
              <div className="w-full mt-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-3 flex justify-between items-center">
                <span className="text-emerald-800 dark:text-emerald-300 text-xs font-semibold">{T.bonus}</span>
                <span className="text-lg font-black text-emerald-600">+{bonoEuros.toFixed(2)}€</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="col-span-1 md:col-span-2 space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold flex items-center gap-2 text-base">
              <Clock className="w-5 h-5 text-indigo-500" /> {T.status}
            </h3>
            {!isReadOnly && isAdminView && userData.isClockedIn && userData.ultimaUbicacion && (
              <a href={`https://www.google.com/maps?q=${userData.ultimaUbicacion.lat},${userData.ultimaUbicacion.lng}`}
                target="_blank" rel="noreferrer"
                className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1">
                <Map className="w-3 h-3" /> {T.viewMap}
              </a>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${userData.isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className={`font-bold text-lg ${userData.isClockedIn ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                  {userData.isClockedIn ? T.active : T.inactive}
                </span>
              </div>

              {userData.isClockedIn && (
                <div className="mt-2 space-y-1">
                  {userData.proyectoActual && (
                    <div className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-md">
                      <FolderKanban className="w-3.5 h-3.5" /> {userData.proyectoActual}
                    </div>
                  )}
                  {clockInFmt && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Timer className="w-3 h-3" /> {T.entryLabel}: {clockInFmt}
                      {!isReadOnly && !isAdminView && (
                        <button onClick={() => setEditClockIn(v => !v)} className="ml-1 text-indigo-500 hover:text-indigo-700">
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                  {editClockIn && !isReadOnly && !isAdminView && (
                    <div className="flex items-center gap-2 mt-2">
                      <input type="time" value={newClockInTime} onChange={e => setNewClockInTime(e.target.value)}
                        className="border dark:border-slate-600 dark:bg-slate-700 rounded-lg px-2 py-1 text-xs" />
                      <button onClick={handleUpdateClockIn}
                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-lg flex items-center gap-1">
                        <Save className="w-3 h-3" /> {T.saveButton}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isReadOnly && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {!userData.isClockedIn ? (
                  <>
                    <div className="relative flex items-center bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2.5 w-full sm:w-auto min-w-0">
                      <Tag className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <select
                        disabled={isAdminView}
                        value={proyecto}
                        onChange={e => setProyecto(e.target.value)}
                        className="text-sm bg-transparent outline-none flex-1 text-gray-800 dark:text-gray-100 cursor-pointer min-w-0 max-w-[200px] custom-select"
                      >
                        {listaProyectos.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <button
                      onClick={handleClockIn}
                      disabled={isProcessing || isAdminView}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2.5 px-6 rounded-xl transition disabled:opacity-50 shadow-md shadow-indigo-200 dark:shadow-none whitespace-nowrap"
                    >
                      {T.clockIn}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleClockOut}
                    disabled={isProcessing || isAdminView}
                    className="w-full sm:w-auto bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold py-2.5 px-8 rounded-xl transition disabled:opacity-50"
                  >
                    {T.clockOut}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <MetricCard label={T.dailyLimit} value={horasDiarias}   max={8}  danger={horasDiarias > 8}    color="indigo" />
          <MetricCard label={T.weeklyLimit} value={horasSemanales} max={40} danger={horasSemanales > 40} color="green"  />
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, children }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400 flex items-center gap-1.5">{icon} {label}</span>
      {children}
    </div>
  );
}

function MetricCard({ label, value, max, danger, color }) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = {
    indigo: danger ? 'bg-red-500' : 'bg-indigo-500',
    green:  danger ? 'bg-orange-500' : 'bg-green-500',
  }[color];
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-baseline gap-1 mb-3">
        <span className={`text-4xl font-black ${danger ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>{value.toFixed(1)}</span>
        <span className="text-gray-400 text-sm">/ {max}h</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── TEAM STATUS (con modal de perfil) ────────────────────────────────────────
function TeamStatus({ T }) {
  const [team, setTeam] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [config, setConfig] = useState({ bono_hora: 8, limite_dias_vacaciones: 21 });

  useEffect(() => {
    const un = onSnapshot(collection(db, 'usuarios'), snap =>
      setTeam(snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(u => ['user', 'supervisor'].includes(u.role)))
    );
    const unC = onSnapshot(doc(db, 'config', 'general'), snap => {
      if (snap.exists()) setConfig(snap.data());
    });
    return () => { un(); unC(); };
  }, []);

  const handleViewProfile = (user) => {
    setSelectedUser(user);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 border-b dark:border-slate-700 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-indigo-900 dark:text-indigo-300">{T.teamStatus}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-900/50 text-xs text-gray-400 uppercase border-b dark:border-slate-700">
              <tr>
                <th className="p-3 pl-5">{T.tableEmployees}</th>
                <th className="p-3 text-center">{T.tableStatus}</th>
                <th className="p-3">{T.tableProjects}</th>
                <th className="p-3">{T.tableGPS}</th>
                <th className="p-3 text-center">{T.tableAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {team.map(u => (
                <tr key={u.uid} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <td className="p-3 pl-5 font-medium">
                    <div className="flex items-center gap-2">
                      <img src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre || 'U')}&background=4f46e5&color=fff`}
                        className="w-7 h-7 rounded-full object-cover" alt="" />
                      {u.nombre}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${u.isClockedIn ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                      {u.isClockedIn ? T.active : T.inactive}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {u.isClockedIn && u.proyectoActual
                      ? <span className="flex items-center gap-1"><FolderKanban className="w-3 h-3 text-indigo-400" />{u.proyectoActual}</span>
                      : '-'}
                  </td>
                  <td className="p-3">
                    {u.isClockedIn && u.ultimaUbicacion
                      ? <a href={`https://www.google.com/maps?q=${u.ultimaUbicacion.lat},${u.ultimaUbicacion.lng}`} target="_blank" rel="noreferrer"
                          className="text-indigo-500 hover:underline text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {T.tableGPSLink}
                        </a>
                      : '-'}
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleViewProfile(u)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full transition">
                      {T.viewProfileButton}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{T.employeeDetailsTitle}</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <UserProfile userData={selectedUser} config={config} T={T} isAdminView={false} showToast={() => {}} isReadOnly={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── ADMIN DASHBOARD (con modal de perfil) ────────────────────────────────────
function AdminDashboard({ adminUser, config, T, showToast }) {
  const [users, setUsers]             = useState([]);
  const [showAdd, setShowAdd]         = useState(false);
  const [bonoInput, setBonoInput]     = useState(config?.bono_hora || 8);
  const [limVacInput, setLimVacInput] = useState(config?.limite_dias_vacaciones || 21);
  const [activeTab, setActiveTab]     = useState('employees');
  const [departments, setDepts]       = useState([]);
  const [newDept, setNewDept]         = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const un = onSnapshot(collection(db, 'usuarios'), snap =>
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(u => u.uid !== adminUser.uid && u.role !== 'admin'))
    );
    const unD = onSnapshot(collection(db, 'departamentos'), snap =>
      setDepts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { un(); unD(); };
  }, [adminUser.uid]);

  const updateConfig = async () => {
    await updateDoc(doc(db, 'config', 'general'), { bono_hora: Number(bonoInput), limite_dias_vacaciones: Number(limVacInput) });
    showToast(T.configSaved);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const secApp  = initializeApp(firebaseConfig, `Sec_${Date.now()}`);
      const secAuth = getAuth(secApp);
      const uc      = await createUserWithEmailAndPassword(secAuth, fd.get('c'), fd.get('p'));
      await signOut(secAuth); await deleteApp(secApp);
      const nextId = String(users.length + 1).padStart(3, '0');
      await setDoc(doc(db, 'usuarios', uc.user.uid), {
        nombre: fd.get('n'), correo: fd.get('c'),
        puesto: fd.get('pu'), empleadoId: nextId,
        horario_definido: fd.get('h'),
        fecha_inicio_contrato: fd.get('f'),
        role: fd.get('r'),
        departamento: fd.get('dept') || '',
        modalidadTrabajo: fd.get('modalidad') || 'office',
        dias_vacaciones_gastados: 0, total_horas_semana: 0,
        isClockedIn: false, clockInTime: null,
        ultimaUbicacion: null, proyectoActual: null,
        horas_hoy: 0, fecha_ultimo_fichaje: '',
      });
      setShowAdd(false);
      showToast(T.employeeCreated);
    } catch (err) { showToast(T.errorPrefix + err.message, 'error'); }
  };

  const exportToCSV = () => {
    const head = ['ID', 'Nombre', 'Correo', 'Rol', 'Puesto', 'Depto', 'Modalidad', 'Hrs Sem.', 'Vac. Disp.', 'Estado', 'Proyecto'];
    const rows = users.map(u => {
      const dDisp = (getMonthsDiff(u.fecha_inicio_contrato) * 2) - (u.dias_vacaciones_gastados || 0);
      return [
        `"${u.empleadoId}"`, `"${u.nombre}"`, `"${u.correo}"`, `"${u.role}"`,
        `"${u.puesto}"`, `"${u.departamento || '-'}"`, `"${u.modalidadTrabajo || '-'}"`,
        (u.total_horas_semana || 0).toFixed(1), dDisp,
        u.isClockedIn ? 'Trabajando' : 'Inactivo',
        `"${u.proyectoActual || '-'}"`,
      ].join(',');
    });
    const link = document.createElement('a');
    link.href = encodeURI('data:text/csv;charset=utf-8,' + [head.join(','), ...rows].join('\n'));
    link.download = 'informe_empleados.csv';
    link.click();
  };

  const TABS = [
    { id: 'employees',   label: T.employees,   icon: <Users className="w-4 h-4" /> },
    { id: 'absence',     label: T.tabAbsence || 'Ausencias', icon: <Calendar className="w-4 h-4" /> },
    { id: 'departments', label: T.departments, icon: <Building2 className="w-4 h-4" /> },
    { id: 'reports',     label: T.reports,     icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'config',      label: T.configTab,   icon: <Settings className="w-4 h-4" /> },
  ];

  const handleViewProfile = (user) => {
    setSelectedUser(user);
  };

  return (
    <>
      <div className="space-y-5">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600" /> {T.adminPanel}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {T.employeeCount.replace('{count}', users.length)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportToCSV}
              className="flex items-center gap-1.5 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-100 transition">
              <Download className="w-4 h-4" /> {T.exportCSV}
            </button>
            <button onClick={() => setShowAdd(v => !v)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-indigo-200 dark:shadow-none">
              <Plus className="w-4 h-4" /> {T.addEmployeeButton}
            </button>
          </div>
        </div>

        {showAdd && (
          <form onSubmit={handleCreateUser}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{T.roleLabel}</label>
              <select name="r" className="border dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 p-2.5 rounded-xl text-sm custom-select">
                <option value="user">{T.roles.user}</option>
                <option value="supervisor">{T.roles.supervisor}</option>
                <option value="rh">{T.roles.rh}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{T.workModeLabel}</label>
              <select name="modalidad" className="border dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 p-2.5 rounded-xl text-sm custom-select">
                <option value="office">{T.workModeOffice}</option>
                <option value="remote">{T.workModeRemote}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{T.departmentLabel}</label>
              <select name="dept" className="border dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 p-2.5 rounded-xl text-sm custom-select">
                <option value="">{T.noDepartment}</option>
                {departments.map(d => <option key={d.id} value={d.nombre}>{d.nombre}</option>)}
              </select>
            </div>
            {[
              { name: 'n',  placeholder: T.fullNameLabel,    type: 'text'  },
              { name: 'c',  placeholder: T.emailLabel,       type: 'email' },
              { name: 'p',  placeholder: T.passwordLabel,    type: 'text', minLength: 6 },
              { name: 'pu', placeholder: T.positionLabel,    type: 'text'  },
              { name: 'f',  placeholder: T.startDateLabel,   type: 'date'  },
              { name: 'h',  placeholder: T.scheduleLabel,    type: 'text', defaultValue: '09:00 - 17:00' },
            ].map(inp => (
              <div key={inp.name} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{inp.placeholder}</label>
                <input required {...inp}
                  className="border dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 p-2.5 rounded-xl text-sm" />
              </div>
            ))}
            <button type="submit"
              className="col-span-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition">
              {T.createEmployeeButton}
            </button>
          </form>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="flex overflow-x-auto border-b dark:border-slate-700">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'employees' && (
              <EmployeeTable users={users} T={T} departments={departments} onViewProfile={handleViewProfile} />
            )}
            {activeTab === 'absence' && (
              <AbsenceModule currentUser={adminUser} T={T} showToast={showToast} adminMode />
            )}
            {activeTab === 'departments' && (
              <DepartmentsTab departments={departments} newDept={newDept} setNewDept={setNewDept} showToast={showToast} T={T} />
            )}
            {activeTab === 'reports' && (
              <AdminReports users={users} T={T} />
            )}
            {activeTab === 'config' && (
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{T.extraHourValue}</label>
                  <input type="number" value={bonoInput} onChange={e => setBonoInput(e.target.value)}
                    className="w-full border dark:border-slate-600 dark:bg-slate-700 p-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{T.vacDaysLimit}</label>
                  <input type="number" value={limVacInput} onChange={e => setLimVacInput(e.target.value)}
                    className="w-full border dark:border-slate-600 dark:bg-slate-700 p-2.5 rounded-xl text-sm" />
                </div>
                <button onClick={updateConfig}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {T.saveChanges}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{T.employeeDetailsTitle}</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <UserProfile userData={selectedUser} config={config} T={T} isAdminView={true} showToast={showToast} isReadOnly={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmployeeTable({ users, T, departments, onViewProfile }) {
  const [editUid, setEditUid] = useState(null);
  const [editModalidad, setEditModalidad] = useState('office');

  const startEdit = (u) => { setEditUid(u.uid); setEditModalidad(u.modalidadTrabajo || 'office'); };
  const saveModalidad = async (uid) => {
    await updateDoc(doc(db, 'usuarios', uid), { modalidadTrabajo: editModalidad });
    setEditUid(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-400 uppercase border-b dark:border-slate-700">
          <tr>
            <th className="pb-3">{T.tableEmployees}</th>
            <th className="pb-3 text-center">{T.tableWorkMode}</th>
            <th className="pb-3 text-center">{T.tableHoursWeek}</th>
            <th className="pb-3 text-center">{T.tableStatus}</th>
            <th className="pb-3 text-center">{T.tableGPS}</th>
            <th className="pb-3 text-center">{T.tableAction}</th>
            <th className="pb-3 text-right">{T.deleteButton}</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.uid} className="border-b dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <img src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre || 'U')}&background=4f46e5&color=fff`}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
                  <div>
                    <p className="font-bold">{u.nombre}</p>
                    <p className="text-xs text-gray-400">{u.puesto} · <span className="text-indigo-500 font-semibold uppercase">{u.role}</span> · ID:{u.empleadoId}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 text-center">
                {editUid === u.uid ? (
                  <div className="flex items-center gap-1 justify-center">
                    <select value={editModalidad} onChange={e => setEditModalidad(e.target.value)}
                      className="border dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 text-xs rounded-lg p-1 custom-select">
                      <option value="office">{T.workModeOffice}</option>
                      <option value="remote">{T.workModeRemote}</option>
                    </select>
                    <button onClick={() => saveModalidad(u.uid)} className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-lg">✓</button>
                    <button onClick={() => setEditUid(null)} className="text-gray-400 text-xs px-1">✕</button>
                  </div>
                ) : (
                  <button onClick={() => startEdit(u)}
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 mx-auto hover:opacity-80 transition ${
                      u.modalidadTrabajo === 'remote'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                    {u.modalidadTrabajo === 'remote' ? <><Wifi className="w-3 h-3" /> {T.workModeRemote}</> : <><Home className="w-3 h-3" /> {T.workModeOffice}</>}
                    <Edit3 className="w-2.5 h-2.5 opacity-60" />
                  </button>
                )}
              </td>
              <td className="py-3 text-center font-bold">{(u.total_horas_semana || 0).toFixed(1)}h</td>
              <td className="py-3 text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.isClockedIn ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700'}`}>
                  {u.isClockedIn ? T.active : T.inactive}
                </span>
              </td>
              <td className="py-3 text-center">
                {u.isClockedIn && u.ultimaUbicacion
                  ? <a href={`https://www.google.com/maps?q=${u.ultimaUbicacion.lat},${u.ultimaUbicacion.lng}`} target="_blank" rel="noreferrer"
                      className="text-indigo-500 hover:underline text-xs flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" /> {T.tableGPSLink}
                    </a>
                  : '-'}
              </td>
              <td className="py-3 text-center">
                <button onClick={() => onViewProfile(u)}
                  className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full transition">
                  {T.viewProfileButton}
                </button>
              </td>
              <td className="py-3 text-right">
                <button onClick={async () => { if (window.confirm(T.deleteConfirm)) await deleteDoc(doc(db, 'usuarios', u.uid)); }}
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── COMPONENTES RESTANTES (sin cambios, solo se añade clase custom-select a los selects) ───
// (Se incluyen aquí de forma resumida, pero en tu código deben estar completos)
function DepartmentsTab({ departments, newDept, setNewDept, showToast, T }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={newDept}
          onChange={e => setNewDept(e.target.value)}
          placeholder={T.departmentPlaceholder}
          className="flex-1 border dark:border-slate-600 dark:bg-slate-700 p-2.5 rounded-xl text-sm"
        />
        <button
          onClick={async () => {
            if (!newDept.trim()) return;
            await addDoc(collection(db, 'departamentos'), { nombre: newDept.trim(), timestamp: serverTimestamp() });
            setNewDept('');
            showToast(T.departmentCreated);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1 transition"
        >
          <Plus className="w-4 h-4" /> {T.addButton}
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {departments.map(d => (
          <div key={d.id} className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-3 rounded-xl flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-400" />
              {d.nombre}
            </span>
            <button
              onClick={async () => await deleteDoc(doc(db, 'departamentos', d.id))}
              className="text-red-400 hover:text-red-600 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminReports({ users, T }) {
  const working  = users.filter(u => u.isClockedIn).length;
  const totalHrs = users.reduce((a, u) => a + (u.total_horas_semana || 0), 0);
  const stats = [
    { label: T.totalEmployees,   value: users.length,                                    color: 'indigo', icon: <Users className="w-5 h-5" /> },
    { label: T.workingNow,       value: working,                                          color: 'green',  icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: T.totalHoursWeek,   value: totalHrs.toFixed(0) + 'h',                        color: 'blue',   icon: <Clock className="w-5 h-5" /> },
    { label: T.avgHoursPerEmployee, value: users.length ? (totalHrs / users.length).toFixed(1) + 'h' : '0h', color: 'purple', icon: <TrendingUp className="w-5 h-5" /> },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`bg-${s.color}-50 dark:bg-${s.color}-900/20 border border-${s.color}-100 dark:border-${s.color}-800 p-4 rounded-xl`}>
            <div className={`text-${s.color}-500 mb-2`}>{s.icon}</div>
            <p className={`text-2xl font-black text-${s.color}-700 dark:text-${s.color}-300`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-400 uppercase border-b dark:border-slate-700">
          <tr>
            <th className="pb-2">{T.reportEmployee}</th>
            <th className="pb-2 text-center">{T.reportHours}</th>
            <th className="pb-2 text-center">{T.reportStatus}</th>
            <th className="pb-2 text-center">{T.reportVacationDays}</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            const d = (getMonthsDiff(u.fecha_inicio_contrato) * 2) - (u.dias_vacaciones_gastados || 0);
            return (
              <tr key={u.uid} className="border-b dark:border-slate-700/50">
                <td className="py-2 flex items-center gap-2">
                  <img src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre || 'U')}&background=4f46e5&color=fff`} className="w-6 h-6 rounded-full" alt="" />
                  {u.nombre}
                </td>
                <td className="py-2 text-center">{(u.total_horas_semana || 0).toFixed(1)}h</td>
                <td className="py-2 text-center"><span className={`text-xs font-bold ${u.isClockedIn ? 'text-green-600' : 'text-gray-400'}`}>{u.isClockedIn ? T.active : T.inactive}</span></td>
                <td className="py-2 text-center font-bold">{d}d</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProjectsTab({ currentUser, T, showToast }) {
  const [fichajes, setFichajes] = useState([]);
  const [file, setFile]         = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const un = onSnapshot(
      query(collection(db, 'fichajes'), where('uid', '==', currentUser.uid), orderBy('fecha', 'desc')),
      snap => setFichajes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unA = onSnapshot(
      query(collection(db, 'archivos'), where('uid', '==', currentUser.uid), orderBy('timestamp', 'desc')),
      snap => setArchivos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { un(); unA(); };
  }, [currentUser.uid]);

  const horasPorProyecto = fichajes.reduce((acc, f) => {
    if (f.entrada && f.salida) {
      const h = (new Date(f.salida) - new Date(f.entrada)) / 3600000;
      acc[f.proyecto] = (acc[f.proyecto] || 0) + h;
    }
    return acc;
  }, {});

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fRef = ref(storage, `archivos/${currentUser.uid}_${Date.now()}_${file.name}`);
      await uploadBytes(fRef, file);
      const url = await getDownloadURL(fRef);
      await addDoc(collection(db, 'archivos'), { uid: currentUser.uid, nombre: currentUser.nombre, nombreArchivo: file.name, url, timestamp: serverTimestamp() });
      showToast(T.uploadSuccess);
      setFile(null);
    } catch {
      showToast(T.uploadError, 'error');
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-indigo-500" /> {T.hoursProject}</h3>
        {Object.keys(horasPorProyecto).length === 0
          ? <p className="text-gray-400 text-sm">{T.noData}</p>
          : <div className="space-y-3">
              {Object.entries(horasPorProyecto).map(([proj, h]) => (
                <div key={proj}>
                  <div className="flex justify-between text-sm mb-1"><span className="font-medium">{proj}</span><span className="text-gray-400">{h.toFixed(1)}h</span></div>
                  <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min((h / 40) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Paperclip className="w-5 h-5 text-indigo-500" /> {T.upload}</h3>
        <div className="flex gap-3 items-center mb-4 flex-wrap">
          <div className="relative flex-1 min-w-0">
            <input
              type="file"
              id="file-upload-projects"
              onChange={e => setFile(e.target.files[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById('file-upload-projects').click()}
              className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl text-sm font-medium transition"
            >
              {T.selectFile}
            </button>
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              {file ? file.name : T.noFileSelected}
            </span>
          </div>
          <button onClick={handleUpload} disabled={!file || uploading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center gap-1.5 transition whitespace-nowrap">
            <Paperclip className="w-4 h-4" /> {uploading ? '...' : T.upload}
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {archivos.map(a => (
            <div key={a.id} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-slate-700 p-2.5 rounded-xl">
              <span className="flex items-center gap-1.5 truncate"><FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />{a.nombreArchivo}</span>
              <a href={a.url} target="_blank" rel="noreferrer"
                className="text-indigo-600 hover:underline ml-2 flex-shrink-0 flex items-center gap-1">
                <Download className="w-3 h-3" /> {T.viewLink}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsTab({ currentUser, T }) {
  const [fichajes, setFichajes] = useState([]);
  useEffect(() => {
    const un = onSnapshot(
      query(collection(db, 'fichajes'), where('uid', '==', currentUser.uid), orderBy('fecha', 'desc')),
      snap => setFichajes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => un();
  }, [currentUser.uid]);

  const exportCSV = () => {
    const head = [T.reportDate, T.reportClockIn, T.reportClockOut, T.reportHours, T.reportProject];
    const rows = fichajes.map(f => {
      const h = f.entrada && f.salida ? ((new Date(f.salida) - new Date(f.entrada)) / 3600000).toFixed(1) : '-';
      return [
        `"${f.fecha}"`,
        `"${f.entrada ? new Date(f.entrada).toLocaleTimeString() : '-'}"`,
        `"${f.salida ? new Date(f.salida).toLocaleTimeString() : '-'}"`,
        h,
        `"${f.proyecto || '-'}"`
      ].join(',');
    });
    const link = document.createElement('a');
    link.href = encodeURI('data:text/csv;charset=utf-8,' + [head.join(','), ...rows].join('\n'));
    link.download = `informe_${currentUser.nombre}.csv`;
    link.click();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-500" /> {T.advancedReports}</h3>
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-green-100 transition">
          <Download className="w-3.5 h-3.5" /> {T.exportCSV}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase border-b dark:border-slate-700">
            <tr>
              <th className="pb-2">{T.reportDate}</th>
              <th className="pb-2">{T.reportClockIn}</th>
              <th className="pb-2">{T.reportClockOut}</th>
              <th className="pb-2">{T.reportHours}</th>
              <th className="pb-2">{T.reportProject}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
            {fichajes.slice(0, 30).map(f => {
              const h = f.entrada && f.salida ? ((new Date(f.salida) - new Date(f.entrada)) / 3600000).toFixed(1) : '-';
              return (
                <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <td className="py-2">{f.fecha}</td>
                  <td className="py-2">
                    {f.entrada ? new Date(f.entrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="py-2">
                    {f.salida
                      ? new Date(f.salida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : <span className="text-green-500 font-medium">{T.inProgress}</span>
                    }
                  </td>
                  <td className="py-2 font-bold">{h}h</td>
                  <td className="py-2 text-gray-500">{f.proyecto || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AbsenceModule({ currentUser, T, showToast, adminMode = false }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [fInicio, setFInicio]         = useState('');
  const [fFin, setFFin]               = useState('');
  const [tipoAus, setTipoAus]         = useState('vacaciones');
  const [archivo, setArchivo]         = useState(null);
  const [isSub, setIsSub]             = useState(false);
  const [usersMap, setUsersMap]       = useState({});

  const canApprove = ['admin', 'rh', 'supervisor'].includes(currentUser.role);
  const isWorker   = !adminMode && ['user', 'supervisor', 'rh'].includes(currentUser.role);

  useEffect(() => {
    const unQ = onSnapshot(query(collection(db, 'vacaciones'), orderBy('timestamp', 'desc')),
      snap => setSolicitudes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unU = onSnapshot(collection(db, 'usuarios'), snap => {
      const m = {}; snap.docs.forEach(d => { m[d.id] = d.data(); }); setUsersMap(m);
    });
    return () => { unQ(); unU(); };
  }, []);

  const handleSolicitar = async (e) => {
    e.preventDefault();
    if (!fInicio || !fFin || new Date(fInicio) > new Date(fFin)) { showToast(T.invalidDates, 'error'); return; }
    setIsSub(true);
    const dias = calculateDays(fInicio, fFin);
    let urlJust = null;
    try {
      if (archivo) {
        const fRef = ref(storage, `justificantes/${currentUser.uid}_${Date.now()}`);
        await uploadBytes(fRef, archivo);
        urlJust = await getDownloadURL(fRef);
      }
      await addDoc(collection(db, 'vacaciones'), {
        empleadoUid: currentUser.uid, nombreEmpleado: currentUser.nombre,
        correoEmpleado: currentUser.correo || '',
        fechaInicio: fInicio, fechaFin: fFin, diasSolicitados: dias,
        tipo: tipoAus, urlJustificante: urlJust,
        estado: 'pendiente', timestamp: serverTimestamp(),
      });
      setFInicio(''); setFFin(''); setArchivo(null); setTipoAus('vacaciones');
      showToast(T.requestSent);
    } catch { showToast(T.generalError, 'error'); }
    setIsSub(false);
  };

  const handleAprobar = async (id, eUid, dias, accion, tipo, fechaInicio, fechaFin) => {
    try {
      await updateDoc(doc(db, 'vacaciones', id), { estado: accion });
      if (accion === 'aprobada' && tipo === 'vacaciones') {
        const uRef  = doc(db, 'usuarios', eUid);
        const uSnap = await getDoc(uRef);
        if (uSnap.exists()) await updateDoc(uRef, { dias_vacaciones_gastados: (uSnap.data().dias_vacaciones_gastados || 0) + dias });
      }
      const emp = usersMap[eUid];
      if (emp?.correo) {
        const emoji = accion === 'aprobada' ? '✅' : '❌';
        await sendEmailNotification(
          emp.correo, emp.nombre,
          `[sysTicket] Tu solicitud de ${tipo} ha sido ${accion}`,
          `Hola ${emp.nombre},\n\nTu solicitud de ${tipo} ha sido ${emoji} ${accion.toUpperCase()}.\n\nFechas: ${formatDate(fechaInicio)} → ${formatDate(fechaFin)} (${dias} días)\n\nsysTicket`
        );
      }
      showToast(accion === 'aprobada' ? T.requestApproved : T.requestRejected, accion === 'aprobada' ? 'success' : 'warning');
    } catch { showToast(T.generalError, 'error'); }
  };

  const pendientes    = solicitudes.filter(s => s.estado === 'pendiente');
  const aprobadas     = solicitudes.filter(s => s.estado === 'aprobada');
  const misSolicitudes = solicitudes.filter(s => s.empleadoUid === currentUser.uid);

  return (
    <div className={adminMode ? '' : 'bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden'}>
      {!adminMode && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <h2 className="text-lg font-bold">{T.absence}</h2>
        </div>
      )}
      <div className="p-4 sm:p-6 space-y-6">
        <div className={`grid grid-cols-1 ${isWorker && canApprove ? 'lg:grid-cols-2' : ''} gap-6`}>
          {isWorker && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-slate-900/50 p-5 rounded-xl border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> {T.newRequest}</h3>
                <form onSubmit={handleSolicitar} className="space-y-3">
                  <select value={tipoAus} onChange={e => setTipoAus(e.target.value)}
                    className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 p-2.5 rounded-xl text-sm custom-select">
                    <option value="vacaciones">{T.vacationOption}</option>
                    <option value="baja_medica">{T.medicalLeaveOption.replace('{medicalLeave}', T.medicalLeave)}</option>
                    <option value="cita_medica">{T.medicalApptOption.replace('{medicalAppt}', T.medicalAppt)}</option>
                  </select>
                  <div className="flex gap-2">
                    <input type="date" required value={fInicio} onChange={e => setFInicio(e.target.value)}
                      className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 p-2.5 rounded-xl text-sm" />
                    <input type="date" required value={fFin} onChange={e => setFFin(e.target.value)}
                      className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 p-2.5 rounded-xl text-sm" />
                  </div>
                  {(tipoAus !== 'vacaciones') && (
                    <div className="border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-xl p-3 text-center">
                      <Paperclip className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <div className="relative">
                          <input
                            type="file"
                            id="file-upload-absence"
                            required
                            accept="image/*,.pdf"
                            onChange={e => setArchivo(e.target.files[0])}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('file-upload-absence').click()}
                            className="bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-xl text-sm font-medium transition"
                          >
                            {T.selectFile}
                          </button>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {archivo ? archivo.name : T.noFileSelected}
                        </span>
                      </div>
                    </div>
                  )}
                  {fInicio && fFin && new Date(fInicio) <= new Date(fFin) && (
                    <p className="text-xs text-indigo-500 font-semibold">{calculateDays(fInicio, fFin)} {T.daysUnit}</p>
                  )}
                  <button type="submit" disabled={isSub}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 transition">
                    {isSub ? '...' : T.sendRequest}
                  </button>
                </form>
              </div>
              <div className="border dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-gray-50 dark:bg-slate-900 p-3 border-b dark:border-slate-700 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold">{T.myHistory}</h3>
                </div>
                <div className="max-h-52 overflow-y-auto p-2 space-y-1.5">
                  {misSolicitudes.map(s => (
                    <div key={s.id} className="text-xs flex justify-between items-center p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                      <span className="flex items-center gap-1.5">
                        {s.tipo === 'vacaciones' ? '🏖' : s.tipo === 'baja_medica' ? '🏥' : '🩺'}
                        {formatDate(s.fechaInicio)} – {formatDate(s.fechaFin)}
                      </span>
                      <span className={`uppercase font-bold text-[9px] px-1.5 py-0.5 rounded-full ${
                        s.estado === 'aprobada' ? 'bg-green-100 text-green-700' : s.estado === 'rechazada' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {s.estado === 'aprobada' ? T.statusApproved : s.estado === 'rechazada' ? T.statusRejected : T.statusPending}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {canApprove && (
            <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-xl border border-orange-200 dark:border-orange-800 max-h-[550px] overflow-y-auto">
              <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-4 flex items-center gap-2">
                {T.pending}
                <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">{pendientes.length}</span>
              </h3>
              <div className="space-y-3">
                {pendientes.map(s => (
                  <div key={s.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-orange-100 dark:border-slate-600 shadow-sm text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={usersMap[s.empleadoUid]?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.nombreEmpleado || 'U')}&background=4f46e5&color=fff`}
                        className="w-7 h-7 rounded-full object-cover" alt="" />
                      <div>
                        <p className="font-bold">{s.nombreEmpleado}</p>
                        <p className="text-[10px] text-gray-400 uppercase">
                          {s.tipo === 'vacaciones' ? T.typeVacation : s.tipo === 'baja_medica' ? T.typeMedicalLeave : T.typeMedicalAppt}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{formatDate(s.fechaInicio)} → {formatDate(s.fechaFin)} · <strong>{s.diasSolicitados}{T.daysUnit}</strong></p>
                    {s.urlJustificante && (
                      <a href={s.urlJustificante} target="_blank" rel="noreferrer" className="text-blue-500 text-xs hover:underline flex gap-1 items-center mb-2">
                        <FileText className="w-3 h-3" /> {T.viewJustification}
                      </a>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => handleAprobar(s.id, s.empleadoUid, s.diasSolicitados, 'aprobada', s.tipo, s.fechaInicio, s.fechaFin)}
                        className="flex-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-green-200 transition">
                        <Check className="w-3.5 h-3.5" /> {T.approve}
                      </button>
                      <button onClick={() => handleAprobar(s.id, s.empleadoUid, s.diasSolicitados, 'rechazada', s.tipo, s.fechaInicio, s.fechaFin)}
                        className="flex-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-red-200 transition">
                        <X className="w-3.5 h-3.5" /> {T.reject}
                      </button>
                    </div>
                  </div>
                ))}
                {pendientes.length === 0 && <p className="text-sm text-orange-400 text-center py-4">{T.noPendingRequests}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="border dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="bg-gray-50 dark:bg-slate-900/50 p-4 border-b dark:border-slate-700">
            <h3 className="font-semibold text-sm">{T.teamApproved}</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b dark:border-slate-700">
                  <th className="pb-2">{T.reportEmployee}</th>
                  <th className="pb-2">{T.reportType}</th>
                  <th className="pb-2">{T.reportDates}</th>
                  <th className="pb-2 text-right">{T.reportDays}</th>
                </tr>
              </thead>
              <tbody>
                {aprobadas.map(v => (
                  <tr key={v.id} className="border-b border-gray-50 dark:border-slate-700/50">
                    <td className="py-2 flex items-center gap-2">
                      <img src={usersMap[v.empleadoUid]?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.nombreEmpleado || 'U')}&background=4f46e5&color=fff`}
                        className="w-6 h-6 rounded-full object-cover" alt="" />
                      {v.nombreEmpleado}
                    </td>
                    <td className="py-2 text-xs text-gray-500">
                      {v.tipo === 'vacaciones' ? '🏖' : v.tipo === 'baja_medica' ? '🏥' : '🩺'}
                      {' '}
                      {v.tipo === 'vacaciones' ? T.typeVacation : v.tipo === 'baja_medica' ? T.typeMedicalLeave : T.typeMedicalAppt}
                    </td>
                    <td className="py-2 text-xs">{formatDate(v.fechaInicio)} – {formatDate(v.fechaFin)}</td>
                    <td className="py-2 text-right font-bold text-blue-500">{v.diasSolicitados}{T.daysUnit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalChatManager({ currentUser, onClose, T }) {
  const [users, setUsers]             = useState([]);
  const [messages, setMessages]       = useState([]);
  const [activeContact, setActiveContact] = useState(null);

  useEffect(() => {
    const unU = onSnapshot(collection(db, 'usuarios'), snap => setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() }))));
    const unM = onSnapshot(collection(db, 'mensajes'),  snap => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unU(); unM(); };
  }, []);

  const allowedContacts = users.filter(u => {
    if (u.uid === currentUser.uid) return false;
    const hist = messages.some(m => (m.from === u.uid && m.to === currentUser.uid) || (m.from === currentUser.uid && m.to === u.uid));
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'rh')   return u.role === 'user' || u.role === 'supervisor' || (u.role === 'admin' && hist);
    if (currentUser.role === 'supervisor') return u.role !== 'admin' || hist;
    return u.role === 'supervisor' || u.role === 'rh' || (u.role === 'admin' && hist);
  });

  const unread = (uid) => messages.filter(m => m.from === uid && m.to === currentUser.uid && !m.read).length;

  if (activeContact) return (
    <div className="flex flex-col h-full">
      <div className="bg-indigo-600 dark:bg-indigo-800 text-white p-3 flex items-center gap-2">
        <button onClick={() => setActiveContact(null)} className="hover:bg-white/20 p-1.5 rounded-lg transition"><ChevronLeft className="w-5 h-5" /></button>
        <img src={activeContact.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeContact.nombre || 'U')}`}
          className="w-8 h-8 rounded-full object-cover border border-indigo-400" alt="" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm truncate">{activeContact.nombre}</h3>
          <p className="text-[10px] text-indigo-200 uppercase">{activeContact.role}</p>
        </div>
      </div>
      <ChatBox currentUserId={currentUser.uid} otherParty={activeContact.uid} T={T} />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="bg-indigo-600 dark:bg-indigo-800 text-white p-3 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2"><MessageSquare className="w-4 h-4" /> {T.contacts}</h3>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-lg transition"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 bg-white dark:bg-slate-800">
        {allowedContacts.map(c => (
          <button key={c.uid} onClick={() => setActiveContact(c)}
            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition text-left">
            <div className="relative flex-shrink-0">
              <img src={c.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nombre || 'U')}`}
                className="w-11 h-11 rounded-full object-cover" alt="" />
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${c.isClockedIn ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
            <div className="flex-1 min-w-0 border-b border-gray-100 dark:border-slate-700 pb-2">
              <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{c.nombre}</p>
              <p className="text-[10px] uppercase font-bold text-indigo-500 mt-0.5">{c.role}</p>
            </div>
            {unread(c.uid) > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{unread(c.uid)}</span>
            )}
          </button>
        ))}
        {allowedContacts.length === 0 && <p className="text-center text-gray-400 text-sm py-8">{T.noContacts}</p>}
      </div>
    </div>
  );
}

function ChatBox({ currentUserId, otherParty, T }) {
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState('');
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef               = useRef(null);
  const fileInputRef            = useRef(null);

  useEffect(() => {
    const un = onSnapshot(collection(db, 'mensajes'), snap => {
      const filtered = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(m => (m.from === currentUserId && m.to === otherParty) || (m.from === otherParty && m.to === currentUserId))
        .sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
      setMessages(filtered);
    });
    return () => un();
  }, [currentUserId, otherParty]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setUploading(true);
    try {
      let fileUrl = null, fileName = null;
      if (file) {
        const fRef = ref(storage, `chat/${currentUserId}_${Date.now()}_${file.name}`);
        await uploadBytes(fRef, file);
        fileUrl = await getDownloadURL(fRef);
        fileName = file.name;
        setFile(null);
      }
      await addDoc(collection(db, 'mensajes'), {
        from: currentUserId, to: otherParty,
        text: text.trim(), fileUrl, fileName,
        timestamp: serverTimestamp(), read: false,
      });
      setText('');
    } catch {}
    setUploading(false);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-gray-50 dark:bg-slate-900">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.from === currentUserId ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm shadow-sm break-words ${
              m.from === currentUserId
                ? 'bg-indigo-600 text-white rounded-br-none'
                : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white rounded-bl-none'
            }`}>
              {m.text && <p>{m.text}</p>}
              {m.fileUrl && (
                <a href={m.fileUrl} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-1 text-xs mt-1 underline ${m.from === currentUserId ? 'text-indigo-200' : 'text-indigo-500'}`}>
                  <Paperclip className="w-3 h-3" /> {m.fileName || T.fileAttachment}
                </a>
              )}
            </div>
            <span className="text-[9px] text-gray-400 mt-0.5 px-1">
              {m.timestamp?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
        {file && (
          <div className="flex items-center gap-2 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg mb-2">
            <Paperclip className="w-3 h-3" /> {file.name}
            <button onClick={() => setFile(null)} className="ml-auto text-red-400"><X className="w-3 h-3" /></button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-indigo-500 transition flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={e => setFile(e.target.files[0])} />
          <input
            type="text" value={text} onChange={e => setText(e.target.value)}
            placeholder={T.message}
            className="flex-1 bg-gray-100 dark:bg-slate-700 dark:text-white rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button type="submit" disabled={uploading || (!text.trim() && !file)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition disabled:opacity-40 flex-shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}