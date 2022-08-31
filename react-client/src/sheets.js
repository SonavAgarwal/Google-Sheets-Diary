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
        resource: { values: [["Date", "Title", "Entry", "Emotions", "Id"]] },
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
export async function createDiaryEntry(spreadsheetId, values) {
    return await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: "Sheet1",
        valueInputOption: "USER_ENTERED",
        resource: { values },
    });
}

export async function findEntryById(entryId) {}
