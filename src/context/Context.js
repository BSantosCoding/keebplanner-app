import { onAuthStateChanged } from "@firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import {auth} from "./../Firebase/firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => { unsubscribe(); }
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>{!loading && children}</AuthContext.Provider>
    );
};