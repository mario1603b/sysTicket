import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Sustituye con las credenciales de tu proyecto en Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC2jwIAXbafENVG5SLfKAVry7bYXup0CKg",
  authDomain: "systicket-83627.firebaseapp.com",
  projectId: "systicket-83627",
   storageBucket: "systicket-83627.firebasestorage.app",
  messagingSenderId: "637194630640",
  appId: "1:637194630640:web:72c6777ce8f207bed55935"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


// Este archivo se encarga de inicializar Firebase y exportar las instancias de autenticación y Firestore para su uso en el resto de la aplicación. Asegúrate de reemplazar las credenciales con las de tu proyecto en Firebase.
// Puedes importar `auth` y `db` en otros archivos para interactuar con Firebase Authentication y Firestore respectivamente.
// Ejemplo de uso en otro archivo:
// import { auth, db } from './firebase/client';
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { collection, addDoc } from "firebase/firestore";

// // Para iniciar sesión
// signInWithEmailAndPassword(auth, email, password)
//   .then((userCredential) => {
//     // Usuario autenticado
//     const user = userCredential.user;
//   })
//   .catch((error) => {
//     // Manejar errores
//     const errorCode = error.code;
//     const errorMessage = error.message;
//   });

// // Para agregar un documento a Firestore
// addDoc(collection(db, "tickets"), {
//   title: "Nuevo ticket",
//   description: "Descripción del ticket",
//   status: "abierto"
// })
// .then((docRef) => {
//   console.log("Documento agregado con ID: ", docRef.id);
// })
// .catch((error) => {
//   console.error("Error al agregar documento: ", error
// });