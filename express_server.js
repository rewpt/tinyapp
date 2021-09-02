const express = require('express');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}));
app.set("view engine", "ejs");

// Databases

const users = {
  sKFU1p: {
    id: 'sKFU1p',
    email: 'a@a.com',
    password: '$2b$10$VV5V6sf9hA6Dl3rM7NaVAOAIXkog8bIg3X2qhh4BLB7JemRpwcA7.'
  }
};
const urlDatabase = {};

//Functions and Classes

const { getUserByEmail, hasHTTP, generateRandomString, passValid, urlsForUser, User } = require('./helpers');

// Get and post requests

app.get("/", (req, res) => {
  res.redirect("/register");
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render('registration', templateVars);
});

app.post("/register", (req, res) => {

  if (req.body.email.length === 0 || !req.body.email || req.body.password.length === 0 || !req.body.password) {
    res.status(400);
    return res.send('Status Code 400: Inappropriate email or password');
  }
  if (getUserByEmail(req.body.email, users) !== undefined) {
    res.status(400);
    return res.send('Status Code 400: Duplicate Email');
  } else {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const newUser = new User(req.body.email, hashedPassword);
    users[newUser.id] = newUser;
    req.session.user_id = newUser.id;
    console.log(users)
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
  const id = getUserByEmail(req.body.email, users);
  if (id === undefined) {
    res.status(403).send('Status Code 403: Invalid email');
  }
  if (passValid(id, req.body.password, users)) {
    req.session.user_id = id;
    res.redirect('/urls');
  } else {
    res.status(403).send('Status Code 403: Invalid Password');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post("/urls/:shortURL/delete", (req, res) => {

  if (req.session.user_id === urlDatabase[req.params.shortURL].user_id) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status('403').send('Permission Denied: You are not the creator of this tiny URL');
  }
});

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].user_id) {
    urlDatabase[req.params.id] = { longURL: req.body.newLongURL, user_id: req.session.user_id };
    res.redirect('/urls');
  } else {
    res.status('403').send('Permission Denied: You are not the creator of this tiny URL');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  let trimLong = longURL.trim();
  if (!hasHTTP(trimLong)) {
    trimLong = 'https://' + trimLong;
  }
  urlDatabase[req.params.shortURL] === undefined ? res.redirect('/urls') : res.redirect(trimLong);
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id !== undefined) {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }

});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].user_id ) {
    const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    return res.render("urls_show", templateVars);
  } else {
    return res.status('403').send('Error 403: Unable to access this URL. This URL does not exist or you are not logged in as the owner.')
  }
});

app.get("/urls", (req, res) => {
  if (req.session.user_id !== undefined) {
    const usersURLs = urlsForUser(req.session.user_id, urlDatabase);
    const templateVars = { urls: usersURLs, user: users[req.session.user_id] };
    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post("/urls", (req, res) => {
  if (req.session.user_id !== undefined) {
    const tiny = generateRandomString();
    urlDatabase[tiny] = { longURL: req.body.longURL, user_id: req.session.user_id };
    res.redirect(`/urls/${tiny}`);
  } else {
    res.status('403').send('Error 403: You must be logged in to submit a URL post request')
  }
});

app.listen(PORT, () => {
});