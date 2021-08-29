const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

// Commented code from LHL. 
// Looked up on stack overflow and uncommented code is more up to date
// const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(cookieParser())
app.set("view engine", "ejs");

class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
}

const users = {};

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

const emailId = function(newEmail, database) {
  for (let user in database){
    if (newEmail === database[user].email) {
      return database[user].id
    } 
  }
  return undefined;
}

const passValid = function(id, password, database) {
  if (database[id].password === password) {
    return true
  }
  return false;
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

app.get("/login", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]] };
  res.render('login', templateVars);
})

app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]] };
  res.render('registration', templateVars);
})

app.post("/register", (req, res) => {
  
  const newUser = new User(generateRandomString(), req.body.email, req.body.password);
  if (newUser.email.length === 0 || !newUser.email || newUser.password.length === 0 || !newUser.password){
    res.status(400);
    res.send('Status Code 400: Inappropriate email or password');
  }
  if (emailId(newUser.email, users) !== undefined) {
    res.status(400);
    res.send('Status Code 400: Duplicate Email');
  } else {
  users[newUser.id] = newUser;
  res.cookie('user_id', newUser.id) 
  console.log(users);
  res.redirect('/urls');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/login", (req, res) => {
  const id = emailId(req.body.email, users);
  if (id === undefined) {
    res.status(403).send('Status Code 403: Invalid email');
  }
  passValid(id, req.body.password, users) ? 
    res.cookie('user_id', id).redirect('/urls') :
    res.status(403).send('Status Code 403: Invalid Password')
});

app.post("/logout", (req, res) => {
  console.log('clearing cookie')
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

app.post("/urls/:id", (req,res) => {
  const templateVars = {user: users[req.cookies["user_id"]]}
  urlDatabase[req.params.id] = req.body.newLongURL;
  res.redirect('/urls', templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  urlDatabase[shortURL] === undefined? res.redirect('/urls') : res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  console.log(users)
  const templateVars = {user: users[req.cookies["user_id"]]}; 
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let tiny = generateRandomString()
  urlDatabase[tiny] = req.body.longURL;
  console.log(urlDatabase); 
  res.redirect(`/urls/${tiny}`);
});

