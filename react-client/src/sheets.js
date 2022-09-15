/* global gapi */

import { gapi } from "gapi-script";

let diarySheetHeader = [];
const headingToPropertyName = {
    Id: "entryId",
    Date: "date",
    Title: "title",
    Emotions: "emotions",
    Entry: "entry",
    Image: "image",
};

export async function loadGapi() {
    return new Promise((resolve, reject) => {
        gapi.load("client", () => {
            let promises = [
                gapi.client.load("https://sheets.googleapis.com/$discovery/rest?version=v4"),
                gapi.client.load("https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"),
            ];

            Promise.all(promises).then(function (response) {
                console.log("GAPI loaded");
                resolve();
            });
        });
    });
}

export async function makeSheet() {
    let response = await gapi.client.drive.files.create({
        resource: {
            name: "Sheets Diary",
            mimeType: "application/vnd.google-apps.spreadsheet",
            appProperties: {
                sheetDiary: "active",
            },
        },
    });

    // format the sheet

    // add header rows
    await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: response.result.id,
        range: "Sheet1",
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [["Id", "Date", "Title", "Emotions", "Entry", "Image"]],
        },
    });

    // freese rows request
    const requests = [];
    requests.push({
        updateSheetProperties: {
            properties: {
                sheetId: 0,
                gridProperties: {
                    frozenRowCount: 1,
                },
            },
            fields: "gridProperties.frozenRowCount",
        },
    });
    requests.push({
        addSheet: {
            properties: {
                //  hidden: true,
                title: "LOOKUP_SHEET",
                gridProperties: {
                    rowCount: 1,
                    columnCount: 2,
                },
            },
        },
    });
    const body = {
        requests: requests,
    };
    gapi.client.sheets.spreadsheets
        .batchUpdate({
            spreadsheetId: response.result.id,
            resource: body,
        })
        .then((response) => {
            const result = response.result;
            console.log(`${result.totalUpdatedCells} cells updated.`);
        });

    return response.result.id;
}

export async function findSheet() {
    let foundSheetId = false;
    let response = await gapi.client.drive.files.list({
        q: "appProperties has { key='sheetDiary' and value='active' } and mimeType = 'application/vnd.google-apps.spreadsheet'",
        orderBy: "createdTime desc",
        fields: "files(id,trashed)",
    });
    for (let sheet of response.result.files) {
        if (!sheet.trashed) console.log(sheet);
        if (!sheet.trashed) {
            foundSheetId = sheet.id;
            break;
        }
    }

    return foundSheetId;
}

export async function preloadSheetHeader(spreadsheetId) {
    let response = await getSheetValues(spreadsheetId, "Sheet1!A1:Z2");
    let values = response.result.values[0];
    // diarySheetHeader = [...values];
    diarySheetHeader = values;
    for (let i = 0; i < diarySheetHeader.length; i++) {
        diarySheetHeader[i] = headingToPropertyName[diarySheetHeader[i]];
    }
}

export async function getSheetValues(spreadsheetId, range) {
    return await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
    });
}

//date, title, entry, emotions, entryId
export async function createDiaryEntry(spreadsheetId, values) {
    let row = [];
    diarySheetHeader.forEach(function (property) {
        row.push(values[property]);
    });
    // let row = [entryId, date, title, emotions, entry];
    await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: "Sheet1",
        valueInputOption: "USER_ENTERED",
        resource: { values: [row] },
    });
    // await gapi.client.sheets.spreadsheets.values.append({
    //     spreadsheetId: spreadsheetId,
    //     range: "Date To Id",
    //     valueInputOption: "USER_ENTERED",
    //     resource: { values: [[date, entryId]] },
    // });
}

export async function updateDiaryEntry(spreadsheetId, values) {
    let rowNumber = await findEntryById(spreadsheetId, values.entryId);
    let range = `Sheet1!A${rowNumber}:F${rowNumber}`;
    console.log("updating " + spreadsheetId);
    let row = [];
    diarySheetHeader.forEach(function (property) {
        row.push(values[property]);
    });

    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [row],
        },
    });
}

// export async function

export async function findEntryById(spreadsheetId, entryId) {
    let response = await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: "LOOKUP_SHEET",
        valueInputOption: "USER_ENTERED",
        includeValuesInResponse: true,
        resource: { values: [[`=MATCH("${entryId}", Sheet1!A:A, 0)`]] },
    });

    // delete created row (just deletes top row)
    deleteLookupSheetRow(spreadsheetId, 1);

    return parseInt(response.result.updates.updatedData.values[0]);
}

export async function deleteLookupSheetRow(spreadsheetId, rowCount) {
    let response = await gapi.client.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
        ranges: ["LOOKUP_SHEET"],
        includeGridData: false,
    });
    let sheetId = response.result.sheets[0].properties.sheetId;

    const requests = [];
    requests.push({
        deleteDimension: {
            range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: 0,
                endIndex: rowCount,
            },
        },
    });
    const body = {
        requests: requests,
    };
    await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: body,
    });
}

export async function getRow(spreadsheetId, row) {
    let range = `Sheet1!A${row}:F${row}`;
    let response = await getSheetValues(spreadsheetId, range);
    return response.result.values[0];
}

export async function getUserProfileData(token) {
    let accessToken = token.access_token;
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${accessToken}`);
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers,
    });
    const data = await response.json();
    return data;
}

export async function sortSheetByDate(spreadsheetId) {
    // freese rows request
    const requests = [];
    requests.push({
        sortRange: {
            range: {
                sheetId: 0,
                startRowIndex: 0,
                startColumnIndex: 0,
            },
            // range: "A:Z",
            sortSpecs: [
                {
                    dimensionIndex: 1,
                    sortOrder: "DESCENDING",
                },
            ],
        },
    });
    const body = {
        requests: requests,
    };
    return gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: body,
    });
}

export async function searchForText(spreadsheetId, text) {
    let response = await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: "LOOKUP_SHEET",
        valueInputOption: "USER_ENTERED",
        includeValuesInResponse: true,
        // TODO replace E and and such with stuff based on heading
        resource: {
            values: [
                [`=QUERY(Sheet1!A2:F,"Select A, B, C, D, E, F where lower(E) contains '${text.toLowerCase()}' or lower(C) contains '${text.toLowerCase()}'")`],
            ],
        },
    });

    let secondResponse = await getSheetValues(spreadsheetId, response.result.updates.updatedRange + ":F");
    let entries = secondResponse.result.values;
    console.log(entries);

    // delete created row (just deletes top row)
    deleteLookupSheetRow(spreadsheetId, entries.length);

    return entries;
}

export async function searchForEmotions(spreadsheetId, emotions) {
    // takes in array of emoji

    let queryString = `=QUERY(Sheet1!A2:F,"Select A, B, C, D, E, F where `;
    let emojiQueries = emotions.map(function (emotion) {
        return `D contains '${emotion}'`;
    });
    queryString += emojiQueries.join(" and ") + '")';

    console.log(queryString);

    let response = await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: "LOOKUP_SHEET",
        valueInputOption: "USER_ENTERED",
        includeValuesInResponse: true,
        // TODO replace E and and such with stuff based on heading
        resource: {
            values: [[queryString]],
        },
    });

    let secondResponse = await getSheetValues(spreadsheetId, response.result.updates.updatedRange + ":F");
    let entries = secondResponse.result.values;
    console.log(entries);

    // delete created row (just deletes top row)
    deleteLookupSheetRow(spreadsheetId, entries.length);

    return entries;
}

export async function getEntriesBetweenDates(spreadsheetId, startDate, endDate) {
    let response = await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: "LOOKUP_SHEET",
        valueInputOption: "USER_ENTERED",
        includeValuesInResponse: true,
        // TODO replace E and and such with stuff based on heading
        resource: {
            values: [
                [
                    `=MATCH(DATE(${endDate.getFullYear()}, ${endDate.getMonth() + 1}, ${endDate.getDate()}), Sheet1!B:B, -1)`,
                    `=MATCH(DATE(${startDate.getFullYear()}, ${startDate.getMonth() + 1}, ${startDate.getDate()}), Sheet1!B:B, -1)`,
                ],
            ],
        },
    });

    let rowRange = response.result.updates.updatedData.values[0];
    if (rowRange[0] === "#N/A") rowRange[0] = "2";
    if (rowRange[1] === "#N/A") rowRange[1] = "2";
    let secondResponse = await getSheetValues(spreadsheetId, `Sheet1!A${rowRange[0]}:B${rowRange[1]}`);

    // delete created row (just deletes top row)
    deleteLookupSheetRow(spreadsheetId, 1);

    return secondResponse.result.values;
}
