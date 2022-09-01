import React, { useState } from "react";
import ReactDatePicker from "react-datepicker";
import { useForm, Controller } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/DatePicker.css";
import "../styles/Editor.css";
import { emotionEmojis } from "../config";
import ReactTextareaAutosize from "react-textarea-autosize";
import { createDiaryEntry, findEntryById, findSheet, getRow, updateDiaryEntry } from "../sheets";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Editor({ spreadsheetId, entryId }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        control,
        setValue,
        reset,
    } = useForm();
    console.log(errors);

    const navigate = useNavigate();

    const [populatedEntry, setPopulatedEntry] = useState(false);

    useEffect(
        function () {
            async function populateEntry() {
                console.log("Populating ENtry");
                let entryRow = await findEntryById(spreadsheetId, entryId);
                console.log(entryRow);
                let entryData = await getRow(spreadsheetId, entryRow);
                console.log(entryData);
                console.log(new Date(entryData[0]));
                setValue("date", new Date(entryData[1]));
                setValue("title", entryData[2]);
                emotionEmojis.forEach(function (emotion) {
                    console.log(entryData[3].includes(emotion));
                    setValue(`emotion-${emotion}`, entryData[3].includes(emotion));
                });
                setValue("entry", entryData[4]);
                setPopulatedEntry(true);
            }
            if (entryId) {
                populateEntry();
            } else {
                setValue("date", new Date());
                setPopulatedEntry(true);
            }
        },
        [entryId, spreadsheetId]
    );

    function onSubmit(data) {
        let emotions = [...emotionEmojis].filter((emoji) => {
            // console.log(data[`emotion-${emoji}`]);
            return data[`emotion-${emoji}`];
        });

        if (entryId) {
            updateDiaryEntry(spreadsheetId, data.date.toLocaleDateString(), data.title, data.entry, emotions.join(" "), entryId);
        } else {
            createDiaryEntry(spreadsheetId, data.date.toLocaleDateString(), data.title, data.entry, emotions.join(" "), uuidv4());
        }

        console.log(data);
        let values = [];
        values.push(data.date.toLocaleDateString());
        values.push(data.title);
        values.push(data.entry);
        console.log(emotions);
        values.push(emotions.join(" "));
        if (entryId) {
            values.push(entryId);
        } else {
            values.push(uuidv4());
        }
        console.log(values);
        // createDiaryEntry(spreadsheetId, [values]);

        reset();
        navigate("/home");
    }

    if (!populatedEntry) return <h1>loading</h1>;

    return (
        <div className='editor-container'>
            <form className='editor-form' onSubmit={handleSubmit(onSubmit)}>
                <input className='editor-title' type='text' placeholder='Title' {...register("title", { required: true, min: 1 })} />
                <br></br>
                <ReactTextareaAutosize
                    className='editor-entry'
                    placeholder='type your entry here...'
                    {...register("entry", { required: true, min: 5 })}></ReactTextareaAutosize>
                {/* <textarea placeholder='type your entry here...' {...register("entry", { required: true, min: 5 })} /> */}
                <div className='editor-options'>
                    <Controller
                        control={control}
                        name='date'
                        render={({ field }) => (
                            <div className='date-picker-container'>
                                <ReactDatePicker placeholderText='Select date' onChange={(date) => field.onChange(date)} selected={field.value} inline />
                            </div>
                        )}
                    />
                    <div className='emotion-grid'>
                        {/* TODO fix multiple editors dont work at once */}
                        {emotionEmojis.map(function (emotion) {
                            return (
                                <div className='emotion-checkbox-container' key={`emotion-checkbox-${emotion}`}>
                                    <input
                                        className='emotion-checkbox'
                                        type={"checkbox"}
                                        id={`emotion-checkbox-${emotion}`}
                                        {...register(`emotion-${emotion}`)}
                                        defaultChecked={false}></input>
                                    <label className='emotion-label' htmlFor={`emotion-checkbox-${emotion}`}>
                                        {emotion}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </div>{" "}
                <div className='editor-submit-container'>
                    {entryId ? (
                        <button
                            onClick={function () {
                                navigate(-1);
                            }}
                            className='button'>
                            Delete
                        </button>
                    ) : (
                        <button
                            onClick={function () {
                                navigate(-1);
                            }}
                            className='button'>
                            Cancel
                        </button>
                    )}
                    <button type='submit' className='button'>
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}
