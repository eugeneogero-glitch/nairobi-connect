/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [activeUser, setActiveUser] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const registerWithEmail = (userEmail, userPassword) => {
    return createUserWithEmailAndPassword(auth, userEmail, userPassword);
  };

  const authenticateWithEmail = (userEmail, userPassword) => {
    return signInWithEmailAndPassword(auth, userEmail, userPassword);
  };

  const authenticateWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const terminateSession = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribeListener = onAuthStateChanged(auth, (firebaseUser) => {
      setActiveUser(firebaseUser);
      setIsSessionLoading(false);
    });

    return () => unsubscribeListener();
  }, []);

  const providerContextValue = {
    activeUser,
    registerWithEmail,
    authenticateWithEmail,
    authenticateWithGoogle,
    terminateSession,
  };

  return (
    <SessionContext.Provider value={providerContextValue}>
      {!isSessionLoading && children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const contextInstance = useContext(SessionContext);
  if (!contextInstance) {
    throw new Error("useSession must be wrapped within a SessionProvider");
  }
  return contextInstance;
};
