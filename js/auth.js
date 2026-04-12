
const firebaseConfig = {
  apiKey: "AIzaSyCMkfK5xeyuCz4YysvM9RW3tNKB3MKJTbk",
  authDomain: "fortshop-e9a4a.firebaseapp.com",
  projectId: "fortshop-e9a4a",
  storageBucket: "fortshop-e9a4a.firebasestorage.app",
  messagingSenderId: "688887900185",
  appId: "1:688887900185:web:828c7d8ea2e6601b14e288",
  measurementId: "G-GVPH3N917Q"
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

