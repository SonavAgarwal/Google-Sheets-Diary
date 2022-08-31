import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
    // <React.StrictMode>
    <GoogleOAuthProvider clientId='793261188321-6cncpbrd9mbkpciu55gnai46tno02rnf.apps.googleusercontent.com'>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </GoogleOAuthProvider>
    // </React.StrictMode>
);
