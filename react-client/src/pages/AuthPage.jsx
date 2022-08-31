import { useGoogleLogin } from "@react-oauth/google";
import React from "react";

function AuthPage({ setToken }) {
    const login = useGoogleLogin({
        onSuccess: function (tokenResponse) {
            console.log("Signed in");
            setToken(tokenResponse);
        },
        scope: "https://www.googleapis.com/auth/drive.file",
    });
    return (
        <div>
            <button
                onClick={function () {
                    login();
                }}>
                Sign in
            </button>
        </div>
    );
}

export default AuthPage;
