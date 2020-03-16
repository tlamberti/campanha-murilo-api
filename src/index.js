'use strict';

//const indexRouter = require('./routers/index.router');
const express = require('express')
const router = express.Router();
const server = express();
//server.use(indexRouter)



const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');



// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), listarPessoas);
});

fs.writeFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), cadastrarPessoa);
})

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

const pessoas = [];

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1ZjwUZ2QdeUcwhhAoM5wuCOGbpfPU3yj6w9dMsofG-1Y/edit?usp=sharing
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listarPessoas(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  sheets.spreadsheets.values.get({
    spreadsheetId: '1ZjwUZ2QdeUcwhhAoM5wuCOGbpfPU3yj6w9dMsofG-1Y',
    range: 'Comuns!A2:C',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      //console.log('Nome, Celular, Escrito por, Local');
      // Print columns A and D, which correspond to indices 0 and 3.
      rows.map((row) => {
        const obj = {
          nome: row[0],
          celular: row[1],
          escritopor: row[2],
          local: row[3]
        }
        pessoas.push(obj)
      });
    } else {
      console.log('No data found.');
    }
  });
}

//Exibir
server.get('/', (req, res) => {
  res.status(200).send(
    pessoas
  );
});


function cadastrarPessoa(auth) {
  sheets.spreadsheets.values.append({
    auth: auth,
    range: "Comuns!A85",
    spreadsheetId: '1ZjwUZ2QdeUcwhhAoM5wuCOGbpfPU3yj6w9dMsofG-1Y',
    includeValuesInResponse: true,
    insertDataOption: "INSERT_ROWS",
    responseDateTimeRenderOption: "FORMATTED_STRING",
    responseValueRenderOption: "UNFORMATTED_VALUE",
    valueInputOption: "RAW",
    resource: {
      values: [
        ["Teste Nome", "Teste Cel", "Teste Preenchido Por", "Teste contato"]
      ]
    }
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    console.log(response);
  });
}

//Cadastrar
server.post('/cadastro', async(req, res) => {

  let nome = req.body.nome;
  let celular = req.body.celular;
  let escritopor = req.body.escritopor;
  let local = req.body.local;
  let output = { };
  res.status(200).send(
    pessoas
  );
});


server.listen(3333);