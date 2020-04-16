const fs = require("fs");
const url = require("url");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"]; //ASK
const TOKEN_DIR =
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
  "/.credentials/";
// const TOKEN_PATH = TOKEN_DIR + "youtube-playlist-downloader.json";
const TOKEN_PATH = TOKEN_DIR + "youtube-nodejs-quickstart.json";

fs.readFile("client_secret.json", (err, content) => {
  if (err) {
    console.log("Error loading client secret file", e);
  } else {
    authorize(JSON.parse(content));
  }
});

async function authorize(credentials) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectURL = credentials.installed.redirect_uris[0]; //ASK: can't understand value in client_secret
  let oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectURL
  );
  // check for previous tokens
  fs.readFile(TOKEN_PATH, async (err, token) => {
    if (err) {
      getNewToken(oauth2Client);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      getDownloadInput(oauth2Client);
    }
  });
}

async function getNewToken(oauth2Client) {
  const authURL = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url: ", authURL);

  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here : ", (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log("Error recieving token", err);
      }
      oauth2Client.credentials = token;
      storeToken(token);
      getDownloadInput(oauth2Client);
    });
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log("Token saved to " + TOKEN_PATH);
  });
}

function getDownloadInput(auth) {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Copy the link of your playlist here: ", (playlistLink) => {
    rl.close();
    let link = new URL(playlistLink);
    playlistId = link.searchParams.get("list");
    getPlaylist(auth, playlistId);
  });
}

function getPlaylist(auth, playlistId) {
  var service = google.youtube("v3");
  service.playlistItems
    .list({
      auth,
      part: "snippet,contentDetails",
      maxResults: 5,
      playlistId: playlistId,
    })
    .then(
      (res) => {
        console.log("your playlist ", res.data.items);
      },
      function (err) {
        console.error("messed up?", err);
      }
    );
}
// const youtube = google.youtube({
//   version: "v3",
//   auth: "AIzaSyBirs2yCHXccO2nqtGSZqTgmGbzov96nlg",
// });

// youtube.playlistItems();

// const oauth2Client = new google.auth.OAuth2(
//   "1054844134616-46sff0qemfeibucvgab5cjnn2eint74i.apps.googleusercontent.com",
//   "J62qZqEZ9eajumu905b5Pica",
//   "https://localhost:4200"
// );

// const url = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: scopes
// })
