// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKaQmFmtGrikoSyMf3RPLeTJNJdTysbwU",
  authDomain: "electronic-shop-a3317.firebaseapp.com",
  projectId: "electronic-shop-a3317",
  storageBucket: "electronic-shop-a3317.appspot.com",
  messagingSenderId: "951982529085",
  appId: "1:951982529085:web:e32f29182634e90b596854"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseStorage = getStorage(app);
