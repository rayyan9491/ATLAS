import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signInAnonymously,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, formatAuthError } from '../lib/firebase.ts';

export interface UserProfile {
  uid: string;
  displayName: string;
  createdAt: string;
  timeZone: string;
  avatarSeed?: string;
  gamificationEnabled: boolean;
  defaultAvailabilityMinutes: number;
  dailyAvailability?: Record<string, number>;
  autoReplanWithAi?: boolean;
  selectedCategories?: string[];
  roleTitle?: string;
  hasChosenName?: boolean;
  isAnonymous?: boolean;
  isLocalOnly?: boolean;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  initializeUser: (displayName: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const LOCAL_STORAGE_PROFILE_KEY = 'irl_os_local_profile';
const LOCAL_STORAGE_UID_KEY = 'irl_os_local_uid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const isInitializingRef = useRef<boolean>(false);

  const clearAuthError = () => setAuthError(null);

  // Helper: fallback local profile if Firebase anonymous fails or is offline
  const setupLocalFallback = () => {
    let localUid = localStorage.getItem(LOCAL_STORAGE_UID_KEY);
    if (!localUid) {
      localUid = `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem(LOCAL_STORAGE_UID_KEY, localUid);
    }

    // Try reading cached profile
    try {
      const cached = localStorage.getItem(`${LOCAL_STORAGE_PROFILE_KEY}_${localUid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setUserProfile(parsed);
      } else {
        setUserProfile({
          uid: localUid,
          displayName: '',
          hasChosenName: false,
          createdAt: new Date().toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          gamificationEnabled: true,
          defaultAvailabilityMinutes: 240,
          roleTitle: 'Systems Strategist',
          isLocalOnly: true,
          isAnonymous: true,
        });
      }
    } catch {
      setUserProfile({
        uid: localUid,
        displayName: '',
        hasChosenName: false,
        createdAt: new Date().toISOString(),
        timeZone: 'UTC',
        gamificationEnabled: true,
        defaultAvailabilityMinutes: 240,
        roleTitle: 'Systems Strategist',
        isLocalOnly: true,
        isAnonymous: true,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);

        // Real-time listener for user profile doc
        unsubscribeSnapshot = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile;
              // Check if they have chosen a valid display name
              const hasName = Boolean(data.displayName && data.displayName.trim() !== '' && data.hasChosenName !== false);
              const loadedProfile: UserProfile = {
                ...data,
                uid: firebaseUser.uid,
                hasChosenName: hasName,
                isAnonymous: firebaseUser.isAnonymous,
                isLocalOnly: false,
              };
              setUserProfile(loadedProfile);
              try {
                localStorage.setItem(`${LOCAL_STORAGE_PROFILE_KEY}_${firebaseUser.uid}`, JSON.stringify(loadedProfile));
              } catch {}
              setLoading(false);
            } else {
              // Document doesn't exist yet in Firestore.
              // Check if there is a local cached profile from previous session
              let cachedProfile: UserProfile | null = null;
              try {
                const raw = localStorage.getItem(`${LOCAL_STORAGE_PROFILE_KEY}_${firebaseUser.uid}`);
                if (raw) cachedProfile = JSON.parse(raw);
              } catch {}

              if (cachedProfile && cachedProfile.displayName) {
                // Restore cached profile to Firestore
                try {
                  await setDoc(userDocRef, { ...cachedProfile, uid: firebaseUser.uid }, { merge: true });
                  setUserProfile({ ...cachedProfile, uid: firebaseUser.uid, hasChosenName: true });
                } catch {
                  setUserProfile({ ...cachedProfile, uid: firebaseUser.uid, hasChosenName: true });
                }
              } else {
                // First-time visitor: not initialized yet, waiting for "What should we call you?"
                setUserProfile({
                  uid: firebaseUser.uid,
                  displayName: '',
                  hasChosenName: false,
                  createdAt: new Date().toISOString(),
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                  avatarSeed: firebaseUser.uid.substring(0, 8),
                  gamificationEnabled: true,
                  defaultAvailabilityMinutes: 240,
                  autoReplanWithAi: true,
                  roleTitle: 'Systems Strategist',
                  isAnonymous: true,
                  isLocalOnly: false,
                });
              }
              setLoading(false);
            }
          },
          (error) => {
            console.warn('Firestore snapshot notice, falling back to local storage profile:', error?.message);
            setupLocalFallback();
          }
        );
      } else {
        // No current Firebase user session: attempt behind-the-scenes anonymous sign-in!
        if (!isInitializingRef.current) {
          isInitializingRef.current = true;
          try {
            await signInAnonymously(auth);
            // onAuthStateChanged will trigger with the anonymous user
          } catch (anonErr: any) {
            console.warn('Firebase anonymous authentication unavailable. Activating private local session:', anonErr?.message);
            setupLocalFallback();
          } finally {
            isInitializingRef.current = false;
          }
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // First-visit initialization: save display name and activate personal workspace
  const initializeUser = async (displayName: string) => {
    const cleanName = displayName.trim();
    if (!cleanName) throw new Error('Please enter a display name.');

    const uid = user?.uid || userProfile?.uid || `local_${Date.now()}`;
    const newProfile: UserProfile = {
      uid,
      displayName: cleanName,
      hasChosenName: true,
      createdAt: new Date().toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      avatarSeed: uid.substring(0, 8),
      gamificationEnabled: true,
      defaultAvailabilityMinutes: 240,
      autoReplanWithAi: true,
      selectedCategories: ['career', 'learning'],
      roleTitle: 'Systems Strategist',
      isAnonymous: true,
      isLocalOnly: !user,
    };

    // Save to Firestore if connected
    if (user && !userProfile?.isLocalOnly) {
      try {
        await updateProfile(user, { displayName: cleanName });
      } catch {}
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, newProfile, { merge: true });
      } catch (err) {
        console.warn('Could not persist profile to Firestore:', err);
      }
    }

    // Persist to local cache
    try {
      localStorage.setItem(`${LOCAL_STORAGE_PROFILE_KEY}_${uid}`, JSON.stringify(newProfile));
    } catch {}

    setUserProfile(newProfile);
  };

  const updateDisplayName = async (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) throw new Error('Display name cannot be empty');

    if (user && !userProfile?.isLocalOnly) {
      try {
        await updateProfile(user, { displayName: cleanName });
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { displayName: cleanName });
      } catch (err: any) {
        console.warn('Firestore update display name warning:', err);
      }
    }

    setUserProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, displayName: cleanName };
      try {
        localStorage.setItem(`${LOCAL_STORAGE_PROFILE_KEY}_${prev.uid}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (user && !userProfile?.isLocalOnly) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, updates);
      } catch (err: any) {
        console.warn('Firestore update profile warning:', err);
      }
    }

    setUserProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(`${LOCAL_STORAGE_PROFILE_KEY}_${prev.uid}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Profile Switching: Start a brand new private profile with a clean workspace
  const switchProfile = async () => {
    setLoading(true);
    try {
      if (user) {
        await firebaseSignOut(auth);
      }
      // Generate fresh anonymous identity
      try {
        await signInAnonymously(auth);
      } catch {
        // Fallback to fresh local session UID
        const freshUid = `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem(LOCAL_STORAGE_UID_KEY, freshUid);
        setUserProfile({
          uid: freshUid,
          displayName: '',
          hasChosenName: false,
          createdAt: new Date().toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          gamificationEnabled: true,
          defaultAvailabilityMinutes: 240,
          roleTitle: 'Systems Strategist',
          isLocalOnly: true,
          isAnonymous: true,
        });
      }
    } catch (err: any) {
      console.warn('Error during profile switch:', err);
      setupLocalFallback();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        authError,
        clearAuthError,
        initializeUser,
        updateDisplayName,
        updateUserProfile,
        switchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
