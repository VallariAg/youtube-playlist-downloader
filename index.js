const express = require("express");
const app = express();

const { google } = require("googleapis");

const youtube = google.youtube({
  version: "v3",
  auth: "AIzaSyBirs2yCHXccO2nqtGSZqTgmGbzov96nlg",
});
// youtube.playlistItems();

// const oauth2Client = new google.auth.OAuth2(
//   "1054844134616-46sff0qemfeibucvgab5cjnn2eint74i.apps.googleusercontent.com",
//   "J62qZqEZ9eajumu905b5Pica",
//   "https://localhost:4200"
// );

const scopes = ["http://www.googleapis.com/auth/youtube.readonly"];

// const url = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: scopes
// })
app.listen("4200", () => console.log("listen on 4200"));
