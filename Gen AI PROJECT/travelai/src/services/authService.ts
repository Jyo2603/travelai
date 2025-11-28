import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  deleteUser,
  User,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return import.meta.env.VITE_FIREBASE_API_KEY && 
         import.meta.env.VITE_FIREBASE_API_KEY !== "your_firebase_api_key_here" &&
         import.meta.env.VITE_FIREBASE_API_KEY !== "demo-key";
};

export interface UserData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  createdAt: Date;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Sign up with email and password
export const signUpWithEmail = async (userData: SignupData): Promise<UserData> => {
  // If Firebase is not configured, show a helpful message
  if (!isFirebaseConfigured()) {
    throw new Error('Authentication is not configured yet. Please set up your Firebase project or use the "Start Planning Your Trip" button to continue without an account.');
  }

  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const user = userCredential.user;
    const displayName = `${userData.firstName} ${userData.lastName}`;

    // Update user profile
    await updateProfile(user, {
      displayName: displayName
    });

    // Create user document in Firestore
    const userDoc: UserData = {
      uid: user.uid,
      email: user.email!,
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: displayName,
      createdAt: new Date()
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    return userDoc;
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError.code));
  }
};

// Sign in with email and password
export const signInWithEmail = async (loginData: LoginData): Promise<UserData> => {
  // If Firebase is not configured, show a helpful message
  if (!isFirebaseConfigured()) {
    throw new Error('Authentication is not configured yet. Please set up your Firebase project or use the "Start Planning Your Trip" button to continue without an account.');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      loginData.email, 
      loginData.password
    );
    
    const user = userCredential.user;

    // Get user data from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserData;
    } else {
      // If user document doesn't exist, create it from auth data
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        displayName: user.displayName || user.email!,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      return userData;
    }
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError.code));
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError.code));
  }
};

// Delete user account
export const deleteUserAccount = async (): Promise<void> => {
  if (!isFirebaseConfigured()) {
    throw new Error('Authentication is not configured yet.');
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in.');
    }

    // Delete user document from Firestore
    try {
      await deleteDoc(doc(db, 'users', user.uid));
    } catch (firestoreError) {
      console.warn('Could not delete user document from Firestore:', firestoreError);
      // Continue with account deletion even if Firestore deletion fails
    }

    // Delete the user account
    await deleteUser(user);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError.code));
  }
};

// Get current user data
export const getCurrentUserData = async (): Promise<UserData | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Helper function to convert Firebase auth error codes to user-friendly messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};
