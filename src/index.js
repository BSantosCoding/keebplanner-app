import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { RecoilRoot } from "recoil";
import { AuthProvider } from "./context/Context.js";

ReactDOM.render(
  <RecoilRoot>
    <AuthProvider>
      <App />
    </AuthProvider>
  </RecoilRoot>,
  document.getElementById("root")
);
