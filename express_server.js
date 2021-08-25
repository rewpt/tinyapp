const express = require('express');
const app = express();
const PORT = 8080;

// Commented code from LHL. 
// Looked up on stack overflow and uncommented code is more up to date
// const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.set("view engine", "ejs");

function generateRandomString() {
  let tiny = '';
  const charBank = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bankLen = charBank.length; 
  for (let i = 0; i < 6; i++) {
    let index = Math.floor((Math.random() * bankLen));
    let ranChar = charBank.charAt(index);
    tiny += ranChar
  }
  return tiny;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  urlDatabase[shortURL] === undefined? res.redirect('/urls') : res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let tiny = generateRandomString()
  urlDatabase[tiny] = req.body.longURL;
  console.log(urlDatabase); 
  res.redirect(`/urls/${tiny}`);
});

