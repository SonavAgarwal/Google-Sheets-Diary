/* global gapi */

import { gapi } from "gapi-script";

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
    console.log(response);

    // format the sheet

    // add header rows
    await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: response.result.id,
        range: "Sheet1",
        valueInputOption: "USER_ENTERED",
        resource: { values: [["Id", "Date", "Title", "Emotions", "Entry"]] },
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
    console.log(response);
    for (let sheet of response.result.files) {
        if (!sheet.trashed) console.log(sheet);
        if (!sheet.trashed) {
            foundSheetId = sheet.id;
            break;
        }
        // console.log(sheet);
    }

    return foundSheetId;
}

export async function getSheetValues(spreadsheetId, range) {
    return await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
    });
}
export async function createDiaryEntry(spreadsheetId, date, title, entry, emotions, entryId) {
    let row = [entryId, date, title, emotions, entry];
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

export async function updateDiaryEntry(spreadsheetId, date, title, entry, emotions, entryId) {
    let rowNumber = await findEntryById(spreadsheetId, entryId);
    let range = `Sheet1!A${rowNumber}:E${rowNumber}`;
    let row = [entryId, date, title, emotions, entry];
    console.log("ujpdate erhe");
    console.log(row);
    console.log(range);

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
    console.log(response);
    console.log(parseInt(response.result.updates.updatedData.values[0]));
    return parseInt(response.result.updates.updatedData.values[0]);
}

export async function getRow(spreadsheetId, row) {
    let range = `Sheet1!A${row}:E${row}`;
    let response = await getSheetValues(spreadsheetId, range);
    console.log(response);
    return response.result.values[0];
}

export async function getUserProfileData(token) {
    let accessToken = token.access_token;
    console.log("getuserprofdta");
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${accessToken}`);
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers,
    });
    const data = await response.json();
    console.log(data);
    return data;
}
