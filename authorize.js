const express = require("express");
const app = express();

app, set("view engine", "ejs");

async function authorize(link) {
  app.get("/", (req, res) => {
    res.render("view/authLogin", {
      link: link,
    });

    
  });

  app.post('/', (req, res) => {
    code = await req.body.code
  })  
    return code;
}
app.listen(4200, () => console.log("listening on 4200"));

module.exports.authorize = authorize();
