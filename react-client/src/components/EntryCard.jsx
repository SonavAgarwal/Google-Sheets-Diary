import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EntryCard.css";

function EntryCard({ entry }) {
    const navigate = useNavigate();
    if (!entry) return null;
    return (
        <div className='entry-card'>
            <h1 className='entry-card-title'>{entry[2]}</h1>
            <div className='entry-card-info-container'>
                <h1 className='entry-card-date'>{entry[1]}</h1>
                {entry[3] && <h1 className='entry-card-emotion'>{entry[3]}</h1>}
            </div>
            {/* <div className='entry-card-image-container'>
                <img src={entry[5]} />
            </div> */}
            {/* TODO turn arrays into objects */}
            <div>
                <img src={entry[5]} />
                <p className='entry-card-entry'>{entry[4]}</p>
            </div>
            <div className='entry-card-actions-container'>
                <button
                    onClick={function () {
                        navigate("/edit/" + entry[0]);
                    }}
                    className='button'>
                    Edit
                </button>
                <button className='button'>Delete</button>
            </div>
        </div>
    );
}

export default EntryCard;
