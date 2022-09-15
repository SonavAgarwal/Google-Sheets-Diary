import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { TokenContext } from "../App";
import {
    findSheet,
    getEntriesBetweenDates,
    getSheetValues,
    getUserProfileData,
    makeSheet,
    preloadSheetHeader,
    searchForEmotions,
    searchForText,
    sortSheetByDate,
} from "../sheets";
import { v4 as uuidv4 } from "uuid";
import Editor from "../components/Editor";
import { createRoutesFromChildren, createSearchParams, useNavigate } from "react-router-dom";
import "../styles/Home.css";
import EntryCard from "../components/EntryCard";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/DatePicker.css";
import "../styles/Calendar.css";
import { useForm } from "react-hook-form";

function Home(props) {
    const token = useContext(TokenContext);

    const [userInfo, setUserInfo] = useState({});
    const [entries, setEntries] = useState([]);

    const [sheetDiaryId, setSheetDiaryId] = useState();

    const [calendarDate, setCalendarDate] = useState(new Date());
    const [calendarHighlightDates, setCalendarHighlightDates] = useState([]);

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        control,
        setValue,
        reset,
    } = useForm();

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
                await sortSheetByDate(sheetDiaryId);

                let response = await getSheetValues(sheetDiaryId, "Sheet1!A1:F4");
                if (response) {
                    let previousEntries = response.result.values;
                    previousEntries.shift();
                    // previousEntries = previousEntries.sort((a, b) => new Date(b[1]) - new Date(a[1]));
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
                preloadSheetHeader(foundSheetId);
                console.log(foundSheetId);
            }
            console.log(!!gapi);
            console.log(!!token);
            console.log(!sheetDiaryId);
            if (gapi && token && !sheetDiaryId) {
                findAndSetSheetId();
            }
        },
        [token, sheetDiaryId]
    );

    useEffect(
        function () {
            async function updateCalendar() {
                let startDate = new Date(calendarDate);
                startDate.setDate(1);
                let endDate = new Date(calendarDate);
                endDate.setDate(1);
                endDate.setMonth((endDate.getMonth() + 1) % 12);
                let dateEntries = await getEntriesBetweenDates(sheetDiaryId, startDate, endDate);
                let justDates = dateEntries.map(function (entry) {
                    return new Date(entry[1]);
                });
                setCalendarHighlightDates(justDates);
            }
            if (sheetDiaryId && calendarDate) {
                updateCalendar();
            }
        },
        [sheetDiaryId, calendarDate]
    );

    function onSearch(data) {
        console.log(data);
        navigate({ pathname: "/search", search: createSearchParams({ queryType: "text", query: data.query }).toString() });
    }

    return (
        <div className='home'>
            <div className='home-title-container'>
                <h1>{userInfo.given_name}'s Diary</h1>
                <div style={{ flex: 1 }}></div>
                <button
                    className='button'
                    onClick={function () {
                        navigate("/new");
                    }}>
                    New Entry
                </button>
            </div>
            <div className='calendar-container'>
                <ReactDatePicker
                    maxDate={new Date()}
                    onChange={setCalendarDate}
                    onMonthChange={setCalendarDate}
                    value={calendarDate}
                    highlightDates={[
                        {
                            "calendar-has-entry": calendarHighlightDates,
                        },
                    ]}
                    placeholderText='Select date'
                    inline
                />
            </div>
            <h1>Recent Entries</h1>
            <form onSubmit={handleSubmit(onSearch)}>
                <input className='input' placeholder='Search...' {...register("query", { required: true })} autocomplete='off'></input>
            </form>
            {entries.map((entry) => {
                return <EntryCard entry={entry} key={entry[0]}></EntryCard>;
            })}
        </div>
    );
}

export default Home;
