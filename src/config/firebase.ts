import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKMpgaBvt8yzWFwOAiWjeXuMl0JuYgXBw",
  authDomain: "to-do-7bbbe.firebaseapp.com",
  projectId: "to-do-7bbbe",
  storageBucket: "to-do-7bbbe.firebasestorage.app",
  messagingSenderId: "420972725621",
  appId: "1:420972725621:web:18bc3cabe54a8269d93f3c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
