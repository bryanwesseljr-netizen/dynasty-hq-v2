import {
  EmailAuthProvider,
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { auth, db } from '../services/firebase';

interface SignUpInput {
  displayName: string;
  email: string;
  password: string;
  remember: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<void>;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signInWithGoogle: (remember: boolean) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  upgradeGuest: (email: string, password: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function writeUserProfile(user: User, displayName?: string) {
  await setDoc(
    doc(db, 'users', user.uid),
    {
      uid: user.uid,
      email: user.email ?? null,
      displayName: displayName || user.displayName || 'Dynasty Coach',
      photoURL: user.photoURL ?? null,
      isAnonymous: user.isAnonymous,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setLoading(false);

      if (nextUser) {
        try {
          await writeUserProfile(nextUser);
        } catch (error) {
          console.error('Unable to update user profile:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  const signUp = useCallback(async ({ displayName, email, password, remember }: SignUpInput) => {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    await writeUserProfile(credential.user, displayName);
    await sendEmailVerification(credential.user);
  }, []);

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await writeUserProfile(credential.user);
  }, []);

  const signInWithGoogle = useCallback(async (remember: boolean) => {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const credential = auth.currentUser?.isAnonymous
      ? await linkWithPopup(auth.currentUser, provider)
      : await signInWithPopup(auth, provider);

    await writeUserProfile(credential.user);
  }, []);

  const continueAsGuest = useCallback(async () => {
    await setPersistence(auth, browserLocalPersistence);
    const credential = await signInAnonymously(auth);
    await writeUserProfile(credential.user, 'Guest Coach');
  }, []);

  const upgradeGuest = useCallback(async (email: string, password: string, displayName: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser?.isAnonymous) {
      throw new Error('Only guest accounts can be upgraded from this screen.');
    }

    const emailCredential = EmailAuthProvider.credential(email, password);
    const upgraded = await linkWithCredential(currentUser, emailCredential);
    await updateProfile(upgraded.user, { displayName });
    await writeUserProfile(upgraded.user, displayName);
    await sendEmailVerification(upgraded.user);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const logOut = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      continueAsGuest,
      upgradeGuest,
      resetPassword,
      logOut,
    }),
    [continueAsGuest, loading, logOut, resetPassword, signIn, signInWithGoogle, signUp, upgradeGuest, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
