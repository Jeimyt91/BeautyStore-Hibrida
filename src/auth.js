import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
export const firebaseConfigured = Object.values(config).every((value) => typeof value === 'string' && value.trim() !== '');
const auth = firebaseConfigured ? getAuth(initializeApp(config)) : null;

export function onUserChanged(callback) {
  if (!auth) { callback(null); return () => {}; }
  return onAuthStateChanged(auth, callback);
}
export async function registerUser(nombre, correo, clave) {
  if (!auth) throw new Error('Configura Firebase en .env para crear cuentas reales.');
  const credential = await createUserWithEmailAndPassword(auth, correo, clave);
  await updateProfile(credential.user, { displayName: nombre });
  return credential.user;
}
export async function loginUser(correo, clave) {
  if (!auth) throw new Error('Configura Firebase en .env para ingresar con correo.');
  return (await signInWithEmailAndPassword(auth, correo, clave)).user;
}
export async function logoutUser() { if (auth) await signOut(auth); }
