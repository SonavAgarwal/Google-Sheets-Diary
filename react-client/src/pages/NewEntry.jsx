import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { TokenContext } from "../App";
import { findSheet, makeSheet } from "../sheets";
import { v4 as uuidv4 } from "uuid";
import Editor from "../components/Editor";
import { useParams } from "react-router-dom";

function NewEntry(props) {
    const token = useContext(TokenContext);

    const [sheetDiaryId, setSheetDiaryId] = useState();

    let { entryId } = useParams();

    useEffect(
        function () {
            async function findAndSetSheetId() {
                let foundSheetId = await findSheet();
                if (!foundSheetId) {
                    foundSheetId = await makeSheet();
                }
                setSheetDiaryId(foundSheetId);
            }
            if (gapi && token && !sheetDiaryId) {
                findAndSetSheetId();
            }
        },
        [token, sheetDiaryId]
    );

    return (
        <div>
            <Editor spreadsheetId={sheetDiaryId} entryId={entryId}></Editor>
        </div>
    );
}

export default NewEntry;
