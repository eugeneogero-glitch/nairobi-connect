import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0nBLLBbNUi6dTQSsYWvbHGSj1mWr1ae4",
  authDomain: "nairobi-connect-cb1e1.firebaseapp.com",
  projectId: "nairobi-connect-cb1e1",
  storageBucket: "nairobi-connect-cb1e1.firebasestorage.app",
  messagingSenderId: "398966971876",
  appId: "1:398966971876:web:f000399c6202e9d6027bf1",
  measurementId: "G-J99D6Q6QDC",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
