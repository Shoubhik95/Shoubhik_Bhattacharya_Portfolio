/**
 * Firebase Config and Initialization
 * 
 * Please replace the placeholder values below with your actual Firebase project configuration.
 * You can find these values in the Firebase Console:
 * Project Settings -> General -> Your apps -> SDK setup and configuration (select "Config").
 */

const firebaseConfig = {
  apiKey: typeof FIREBASE_API_KEY !== 'undefined' ? FIREBASE_API_KEY : "YOUR_API_KEY_HERE",
  authDomain: "portfolio-a6e43.firebaseapp.com",
  projectId: "portfolio-a6e43",
  storageBucket: "portfolio-a6e43.firebasestorage.app",
  messagingSenderId: "534388954411",
  appId: "1:534388954411:web:99bc07be14a8527b5f616e",
  databaseURL: "https://portfolio-a6e43-default-rtdb.firebaseio.com"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully for project portfolio-a6e43.");
} else {
  console.warn("Firebase SDK not loaded yet.");
}
