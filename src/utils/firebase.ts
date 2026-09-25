import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Vehicle, EmailAlertLog, WhatsAppAlertLog } from '../types/fleet';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure Google OAuth Provider with Gmail Scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://mail.google.com/');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.compose');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Listen for auth state changes
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o Token de Acesso do Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro na autenticação do Google/Gmail:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Firestore Database Sync Methods
export const syncVehicleToFirestore = async (vehicle: Vehicle) => {
  try {
    const docRef = doc(db, 'vehicles', vehicle.id);
    await setDoc(docRef, vehicle, { merge: true });
  } catch (err) {
    console.warn('Aviso ao sincronizar veículo com Firestore:', err);
  }
};

export const syncEmailLogToFirestore = async (log: EmailAlertLog) => {
  try {
    const docRef = doc(db, 'emailLogs', log.id);
    await setDoc(docRef, log, { merge: true });
  } catch (err) {
    console.warn('Aviso ao sincronizar log de e-mail com Firestore:', err);
  }
};

export const syncWhatsAppLogToFirestore = async (log: WhatsAppAlertLog) => {
  try {
    const docRef = doc(db, 'whatsappLogs', log.id);
    await setDoc(docRef, log, { merge: true });
  } catch (err) {
    console.warn('Aviso ao sincronizar log de WhatsApp com Firestore:', err);
  }
};

export const loadVehiclesFromFirestore = async (): Promise<Vehicle[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'vehicles'));
    const list: Vehicle[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Vehicle);
    });
    return list;
  } catch (err) {
    console.warn('Erro ao carregar veículos do Firestore:', err);
    return [];
  }
};

export const loadEmailLogsFromFirestore = async (): Promise<EmailAlertLog[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'emailLogs'));
    const list: EmailAlertLog[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as EmailAlertLog);
    });
    return list;
  } catch (err) {
    console.warn('Erro ao carregar logs do Firestore:', err);
    return [];
  }
};

export const loadWhatsAppLogsFromFirestore = async (): Promise<WhatsAppAlertLog[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'whatsappLogs'));
    const list: WhatsAppAlertLog[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as WhatsAppAlertLog);
    });
    return list;
  } catch (err) {
    console.warn('Erro ao carregar logs de WhatsApp do Firestore:', err);
    return [];
  }
};
