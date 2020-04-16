// const express = require("express");
// const app = express();
// 
// app.set("view engine", "ejs");

async function authorize(link) {

    const express = require("express");
    const app = express();
    
    app.set("view engine", "ejs");
    


  app.get("/", (req, res) => {
    res.render("view/authLogin", {
      link: link,
    });

    
  });

  app.post('/', (req, res) => {
    code = await req.body.code
  })  
app.listen(4200, () => console.log("listening on 4200"));

    return code;
}

module.exports.auth_page() = authorize();
