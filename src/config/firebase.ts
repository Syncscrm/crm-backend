// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCRJzuBUI908unD_FxNbNUm9VygE9DkutM",
  authDomain: "suiteflow-1c751.firebaseapp.com",
  projectId: "suiteflow-1c751",
  storageBucket: "suiteflow-1c751.appspot.com",
  messagingSenderId: "693998078997",
  appId: "1:693998078997:web:7d0b54fdbc56b5140f121c",
  measurementId: "G-1NJB4G745H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
