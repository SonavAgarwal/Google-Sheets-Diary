import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { TokenContext } from "../App";
import { createDiaryEntry, findSheet, getSheetValues, makeSheet } from "../sheets";
import { v4 as uuidv4 } from "uuid";
import Editor from "../components/Editor";

function Home(props) {
    const token = useContext(TokenContext);

    const [sheetDiaryId, setSheetDiaryId] = useState();

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
            if (gapi && token) {
                console.log("finding and setting");
                findAndSetSheetId();
            }
        },
        [token]
    );

    return (
        <div>
            {/* <button
                onClick={async function () {
                    makeSheet();
                }}>
                make sheet
            </button>
            <button
                onClick={async function () {
                    console.log(await getSheetValues(sheetDiaryId, "Sheet1"));
                }}>
                read sheet
            </button> */}

            <Editor spreadsheetId={sheetDiaryId}></Editor>
            {/* <button
                onClick={async function () {
                    console.log(new Date().toLocaleDateString());
                    createDiaryEntry(sheetDiaryId, [
                        [new Date().toLocaleDateString(), "Going to Dogzone", "I ate some noodles", "Food, Trip, Friends", uuidv4()],
                    ]);
                }}>
                add entry to sheet
            </button> */}
        </div>
    );
}

export default Home;
