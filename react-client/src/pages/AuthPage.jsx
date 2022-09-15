import { useGoogleLogin } from "@react-oauth/google";
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

function AuthPage({ setToken }) {
    const navigate = useNavigate();
    const login = useGoogleLogin({
        onSuccess: function (tokenResponse) {
            console.log("Signed in");
            setToken(tokenResponse);
            navigate("/home");
        },
        scope: "https://www.googleapis.com/auth/drive.file",
    });
    return (
        <div className='auth-button-container'>
            <h1>Google Sheets Diary</h1>
            <button
                className='button'
                onClick={function () {
                    login();
                }}>
                Sign in with Google
            </button>
        </div>
    );
}

export default AuthPage;
