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
import NewEntry from "./pages/NewEntry";

export const TokenContext = createContext();

function App() {
    const [token, setToken] = useState();
    const [googleApisReady, setGoogleApisReady] = useState(false);

    useEffect(function () {
        loadGapi().then(function () {
            setGoogleApisReady(true);
        });
    }, []);

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
                <Route path='/new' element={<NewEntry></NewEntry>}></Route>
                <Route path='/edit/:entryId' element={<NewEntry></NewEntry>} />
            </Routes>
        </TokenContext.Provider>
    );
}

export default App;
