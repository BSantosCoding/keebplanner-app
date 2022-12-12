import { initializeApp } from "@firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "@firebase/auth";
import { getDatabase, ref, set, get } from "@firebase/database";

// Create config for dev and prod whenever that becomes relevant
const firebaseConfigProd = {
  apiKey: process.env.API_KEY_PROD,
  authDomain: "mkinventory-6cb27.firebaseapp.com",
  projectId: "mkinventory-6cb27",
  storageBucket: "mkinventory-6cb27.appspot.com",
  messagingSenderId: "47659883547",
  databaseURL:
    "https://mkinventory-6cb27-default-rtdb.europe-west1.firebasedatabase.app/",
  appId: "1:47659883547:web:f1e6e7c73fc4353c6fecbe",
  measurementId: "G-MY95CWCX2C",
};

const firebaseConfigDev = {
  apiKey: process.env.API_KEY_DEV,
  authDomain: "mkinventorydev.firebaseapp.com",
  projectId: "mkinventorydev",
  storageBucket: "mkinventorydev.appspot.com",
  messagingSenderId: "365818160167",
  databaseURL:
    "https://mkinventorydev-default-rtdb.europe-west1.firebasedatabase.app",
  appId: "1:365818160167:web:a2e1a87a54550e3bb29a02",
  measurementId: "G-W2WPET6ZB9",
};

const app = initializeApp(firebaseConfigProd);
const auth = getAuth(app);
const db = getDatabase(app);

const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;

    get(ref(db, "status/" + user?.uid)).then((snapshot) => {
      if (!snapshot.exists()) {
        set(ref(db, "status/" + user?.uid), {
          Options: [
            "",
            "Delivered",
            "Shipped",
            "Customs",
            "Scam",
            "Waiting for Shipping",
          ],
        });
        set(ref(db, "buytype/" + user?.uid), {
          Options: ["", "Group Buy", "Extras", "In-Stock", "Giveaway"],
        });
        set(ref(db, "interest/" + user?.uid), {
          Options: ["", "Waiting", "Interested"],
        });
        set(ref(db, "tags/" + user?.uid), {
          Case: ["", "60%", "65%"],
          Switch: ["", "Linear", "Tactile", "Clicky"],
          Keycaps: ["", "ABS", "PBT"],
          Modding: ["", "Films", "Lube"],
        });
        set(ref(db, "userpreferences/" + user?.uid), {
          onlyCountDelivered: false,
          requireInventory: false,
          showAllParts: true,
          countAllForUnitPrice: true,
          darkMode: true,
        });
      }
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const signInEmailAndPassword = async (email, password) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;

    get(ref(db, "status/" + user?.uid)).then((snapshot) => {
      if (!snapshot.exists()) {
        set(ref(db, "status/" + user?.uid), {
          Options: [
            "",
            "Delivered",
            "Shipped",
            "Customs",
            "Scam",
            "Waiting for Shipping",
          ],
        });
        set(ref(db, "buytype/" + user?.uid), {
          Options: ["", "Group Buy", "Extras", "In-Stock", "Giveaway"],
        });
        set(ref(db, "interest/" + user?.uid), {
          Options: ["", "Waiting", "Interested"],
        });
        set(ref(db, "tags/" + user?.uid), {
          Case: ["", "60%", "65%"],
          Switch: ["", "Linear", "Tactile", "Clicky"],
          Keycaps: ["", "ABS", "PBT"],
          Modding: ["", "Films", "Lube"],
        });
        set(ref(db, "userpreferences/" + user?.uid), {
          onlyCountDelivered: false,
          requireInventory: false,
          showAllParts: true,
          countAllForUnitPrice: true,
          darkMode: true,
        });
      }
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    get(ref(db, "status/" + user?.uid)).then((snapshot) => {
      if (!snapshot.exists()) {
        set(ref(db, "status/" + user?.uid), {
          Options: [
            "",
            "Delivered",
            "Shipped",
            "Customs",
            "Scam",
            "Waiting for Shipping",
          ],
        });
        set(ref(db, "buytype/" + user?.uid), {
          Options: ["", "Group Buy", "Extras", "In-Stock", "Giveaway"],
        });
        set(ref(db, "interest/" + user?.uid), {
          Options: ["", "Waiting", "Interested"],
        });
        set(ref(db, "tags/" + user?.uid), {
          Case: ["", "60%", "65%"],
          Switch: ["", "Linear", "Tactile", "Clicky"],
          Keycaps: ["", "ABS", "PBT"],
          Modding: ["", "Films", "Lube"],
        });
        set(ref(db, "userpreferences/" + user?.uid), {
          onlyCountDelivered: false,
          requireInventory: false,
          showAllParts: true,
          countAllForUnitPrice: true,
          darkMode: true,
        });
      }
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const sendPwResetEmail = async (email) => {
  try {
    await sendPasswordResetEmail(email);
    alert("Password reset link sent!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logout = () => {
  auth.signOut();
};

export {
  auth,
  db,
  signInWithGoogle,
  signInEmailAndPassword,
  registerWithEmailAndPassword,
  sendPwResetEmail,
  logout,
};
