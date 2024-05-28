import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import {getFirestore} from "firebase/firestore"
import {getStorage} from "firebase/storage"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-fe9bd.firebaseapp.com",
  projectId: "reactchat-fe9bd",
  storageBucket: "reactchat-fe9bd.appspot.com",
  messagingSenderId: "849212663217",
  appId: "1:849212663217:web:908bce1a6d14f6aa9a0990"
};


const app = initializeApp(firebaseConfig);
export const auth=getAuth()
export const db=getFirestore()
export const storage=getStorage()