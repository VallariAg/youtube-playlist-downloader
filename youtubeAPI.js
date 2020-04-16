const fs = require("fs");
const readline = require("readline");
const ytdl = require("youtube-dl");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"]; //it is limit of application access to user's account
const TOKEN_DIR =
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
  "/.credentials/";
const TOKEN_PATH = TOKEN_DIR + "youtube-playlist-downloader.json";

fs.readFile("client_secret.json", (err, content) => {
  if (err) {
    console.log("Error loading client secret file", e);
  } else {
    authorize(JSON.parse(content), getDownloadInput);
  }
});

async function authorize(credentials, callback) {
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
      getNewToken(oauth2Client, getDownloadInput);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

function getNewToken(oauth2Client, callback) {
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
    oauth2Client.getToken(code, async (err, token) => {
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
    console.log(err.code);
    if (err.code != "EEXIST") {
      throw err;
    }
  } finally {
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) throw err;
      console.log("Token saved to " + TOKEN_PATH);
    });
  }
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
  console.log("downloading first 5 videos");
  service.playlistItems
    .list({
      auth,
      part: "snippet,contentDetails",
      maxResults: 5,
      playlistId: playlistId,
    })
    .then(
      //downlaod playlist video
      (res) => {
        res.data.items.forEach((item) => {
          let videoId = item.contentDetails.videoId;
          let videoName = item.snippet.title;
          let video = ytdl(
            "http://www.youtube.com/watch?v=" + videoId,
            ["--format=18"],
            { cwd: __dirname }
          );
          video.on("info", (info) => {
            console.log("Downloading..");
            console.log("filename: " + info._filename);
            console.log("size: " + info.size);
          });
          video.pipe(fs.createWriteStream(`${videoName}`));
        });
      },
      function (err) {
        console.error("messed up?", err);
      }
    );
}
