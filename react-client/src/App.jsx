/* global gapi */

import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { useGoogleLogin } from "@react-oauth/google";
import { gapi } from "gapi-script";
import { findSheet, loadGapi, makeSheet } from "./sheets";
import { Route, Routes, useNavigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import Home from "./pages/Home.jsx";
import { createContext } from "react";

export const TokenContext = createContext();

function App() {
    const [token, setToken] = useState();
    const [googleApisReady, setGoogleApisReady] = useState(false);

    useEffect(function () {
        loadGapi().then(function () {
            setGoogleApisReady(true);
        });
    }, []);

    // useEffect(
    //     function () {
    //         console.log("sheet id found", sheetDiaryId);
    //     },
    //     [sheetDiaryId]
    // );

    // useEffect(
    //     function () {
    //         if (sheetDiaryId && token) {
    //             // findge
    //         }
    //     },
    //     [sheetDiaryId, token]
    // );

    const navigate = useNavigate();

    useEffect(
        function () {
            if (token) {
                navigate("/home");
            } else {
                navigate("/");
            }
        },
        [token]
    );

    if (!googleApisReady) {
        return <div>loading</div>;
    }

    return (
        <TokenContext.Provider value={token}>
            <Routes>
                <Route path='/' element={<AuthPage setToken={setToken}></AuthPage>}></Route>
                <Route path='/home' element={<Home></Home>}></Route>
            </Routes>
        </TokenContext.Provider>
    );
}

export default App;
