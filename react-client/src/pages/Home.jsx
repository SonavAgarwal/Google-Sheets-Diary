import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { TokenContext } from "../App";
import { findSheet, getSheetValues, getUserProfileData, makeSheet } from "../sheets";
import { v4 as uuidv4 } from "uuid";
import Editor from "../components/Editor";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import EntryCard from "../components/EntryCard";

function Home(props) {
    const token = useContext(TokenContext);
    console.log(token);

    const [userInfo, setUserInfo] = useState({});
    const [entries, setEntries] = useState([]);

    const [sheetDiaryId, setSheetDiaryId] = useState();
    console.log("sheetDiaryId:", sheetDiaryId);

    const navigate = useNavigate();

    useEffect(
        function () {
            async function getUserInfo() {
                setUserInfo(await getUserProfileData(token));
            }
            if (token) {
                getUserInfo();
            }
        },
        [token]
    );

    useEffect(
        function () {
            async function getPreviousEntries() {
                console.log("getSheetValues(sheetDiaryId, )");
                let response = await getSheetValues(sheetDiaryId, "Sheet1!A:E");
                if (response) {
                    let previousEntries = response.result.values;
                    previousEntries.shift();
                    previousEntries = previousEntries.sort((a, b) => new Date(b[1]) - new Date(a[1]));
                    setEntries(previousEntries);
                    console.log(previousEntries);
                }
            }
            if (token && sheetDiaryId) {
                getPreviousEntries();
            }
        },
        [token, sheetDiaryId] // TODO Page doesnt update fetched entries after coming back from edit page etc
    );

    useEffect(
        function () {
            async function findAndSetSheetId() {
                let foundSheetId = await findSheet();
                if (!foundSheetId) {
                    foundSheetId = await makeSheet();
                }
                setSheetDiaryId(foundSheetId);
                console.log(foundSheetId);
            }
            console.log(!!gapi);
            console.log(!!token);
            console.log(!sheetDiaryId);
            if (gapi && token && !sheetDiaryId) {
                console.log("finding and setting");
                findAndSetSheetId();
            }
        },
        [token, sheetDiaryId]
    );

    return (
        <div className='home'>
            <h1>{userInfo.given_name}'s Diary</h1>
            <button
                className='button'
                onClick={function () {
                    navigate("/new");
                }}>
                New Entry
            </button>
            {entries.map((entry) => {
                return <EntryCard entry={entry} key={entry[0]}></EntryCard>;
            })}
        </div>
    );
}

export default Home;
