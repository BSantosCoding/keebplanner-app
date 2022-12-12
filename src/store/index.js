import { atom } from "recoil";

export const showNav = atom({
    key: "showNavHeader",
    default: false,
});

export const userEmail = atom({
    key: "email",
    default: "",
});

export const userName = atom({
    key: "name",
    default: "",
});

export const userPassword = atom({
    key: "password",
    default: "",
});