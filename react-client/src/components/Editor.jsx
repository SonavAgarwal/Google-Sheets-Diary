import React from "react";
import ReactDatePicker from "react-datepicker";
import { useForm, Controller } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/DatePicker.css";
import "../styles/Editor.css";
import { emotionEmojis } from "../config";
import ReactTextareaAutosize from "react-textarea-autosize";
import { createDiaryEntry } from "../sheets";
import { v4 as uuidv4 } from "uuid";

export default function Editor({ spreadsheetId }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        control,
    } = useForm();
    console.log(errors);

    function onSubmit(data) {
        console.log(data);
        let values = [];
        values.push(data.date.toLocaleDateString());
        values.push(data.title);
        values.push(data.entry);
        let emotions = [...emotionEmojis].filter((emoji) => {
            // console.log(data[`emotion-${emoji}`]);
            return data[`emotion-${emoji}`];
        });
        console.log(emotions);
        values.push(emotions.join(" "));
        values.push(uuidv4());
        console.log(values);
        createDiaryEntry(spreadsheetId, [values]);
    }

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
                    <button type='submit' className='button'>
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}
