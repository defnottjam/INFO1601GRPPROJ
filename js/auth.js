
const firebaseConfig = {
  apiKey: "AIzaSyC6TS90lpMer5zvuy3W-MEkBqFWrpYtQww",
  authDomain: "info1601groupproj.firebaseapp.com",
  projectId: "info1601groupproj",
  storageBucket: "info1601groupproj.firebasestorage.app",
  messagingSenderId: "74473462005",
  appId: "1:74473462005:web:6d891f74afa8660ac00dbc",
  measurementId: "G-0XH76VMMBE"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();

async function signIn(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}


async function signUp(email, password, displayName) {
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  await cred.user.updateProfile({ displayName });
  return cred;
}

async function signOut() {
  return auth.signOut();
}

function getFriendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

