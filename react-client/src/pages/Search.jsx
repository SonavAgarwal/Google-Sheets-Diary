import React, { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TokenContext } from "../App";
import { findSheet, makeSheet, searchForEmotions, searchForText } from "../sheets";
import "../styles/Search.css";
import { useForm } from "react-hook-form";
import EntryCard from "../components/EntryCard";

function Search(props) {
    const token = useContext(TokenContext);

    const [sheetDiaryId, setSheetDiaryId] = useState();

    // const { query, queryType } = useSearchParams();
    const [searchParams, setSearchParams] = useSearchParams({});
    console.log(searchParams.get("query"));

    const [results, setResults] = useState([]);

    useEffect(
        function () {
            if (sheetDiaryId && searchParams.get("query") && searchParams.get("queryType") === "text") {
                setValue("query", searchParams.get("query"));
                search(searchParams.get("query"), searchParams.get("queryType"));
            }
        },
        [searchParams, sheetDiaryId]
    );

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

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        control,
        setValue,
        reset,
    } = useForm();

    function onSearch(data) {
        console.log(data);
        setSearchParams({ query: data.query, queryType: "text" });
        search(data.query, "text");
    }

    async function search(q, qT) {
        if (qT === "text") {
            setResults(await searchForText(sheetDiaryId, q));
        }
    }

    return (
        <div className='search'>
            <h1>Find Entries</h1>
            <form onSubmit={handleSubmit(onSearch)}>
                <input className='input' placeholder='Search...' {...register("query", { required: true })} autocomplete='off'></input>
            </form>
            {results.map((entry) => {
                if (entry[0] !== "#N/A") return <EntryCard entry={entry} key={entry[0]}></EntryCard>;
            })}
            {!results || !results[0] || results.length < 1 || (results[0][0] == "#N/A" && <h1 style={{ marginTop: "2rem" }}>No results</h1>)}
        </div>
    );
}

export default Search;
