import React from "react";

function EntryCalendar({ sheetDiaryId }) {
    return (
        <div className='date-picker-container'>
            <ReactDatePicker placeholderText='Select date' inline />
        </div>
    );
}

export default EntryCalendar;
