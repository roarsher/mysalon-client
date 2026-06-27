//  import { initializeApp } from 'firebase/app';
// import {
//   getAuth,
//   GoogleAuthProvider,
//   signInWithPopup,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut,
//   updateProfile,
//   sendPasswordResetEmail,
//   sendEmailVerification,
//   reload,
// } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId:             process.env.REACT_APP_FIREBASE_APP_ID,
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const googleProvider = new GoogleAuthProvider();

// export const signInWithGoogle      = ()                  => signInWithPopup(auth, googleProvider);
// export const loginWithEmail        = (email, password)   => signInWithEmailAndPassword(auth, email, password);
// export const registerWithEmail     = async (name, email, password) => {
//   const result = await createUserWithEmailAndPassword(auth, email, password);
//   await updateProfile(result.user, { displayName: name });
//   return result;
// };
// export const logout        = ()      => signOut(auth);
// export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

// /**
//  * sendVerificationEmail
//  * Sends a verification link to the currently logged-in user's email.
//  * Firebase sends an email with a link — clicking it marks emailVerified = true.
//  * We call this right after registerWithEmail.
//  */
// export const sendVerificationEmail = () => {
//   const user = auth.currentUser;
//   if (!user) throw new Error('No user logged in');
//   return sendEmailVerification(user, {
//     // After clicking the link, user is redirected here
//     url: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
//       ? `https://${process.env.REACT_APP_FIREBASE_AUTH_DOMAIN}/login`
//       : 'http://localhost:3000/login',
//   });
// };

// /**
//  * checkEmailVerified
//  * Reloads the Firebase user from the server and returns
//  * whether their email is now verified.
//  * Call this when the user clicks "I've verified my email".
//  */
// export const checkEmailVerified = async () => {
//   const user = auth.currentUser;
//   if (!user) return false;
//   await reload(user);               // force refresh from Firebase servers
//   return auth.currentUser.emailVerified;
// };

// /**
//  * resendVerificationEmail
//  * Resends the verification email. Same as sendVerificationEmail
//  * but named clearly so UI copy makes sense.
//  */
// export const resendVerificationEmail = () => sendVerificationEmail();

import { initializeApp }    from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};

const app            = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/**
 * signInWithGoogle
 * Opens the Google popup and returns the Firebase idToken.
 * The idToken is then sent to our backend which verifies it
 * and returns a JWT + user object (same as email login).
 */
export const signInWithGoogle = async () => {
  const result  = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return { idToken, firebaseUser: result.user };
};
export const checkEmailVerified = async () => {
  await auth.currentUser?.reload();
  return auth.currentUser?.emailVerified ?? false;
};

export const resendVerificationEmail = () =>
  auth.currentUser?.sendEmailVerification();

export const logout = () => auth.signOut();