import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SocialProvider } from "./context/SocialContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocialProvider>
          <App />
        </SocialProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
