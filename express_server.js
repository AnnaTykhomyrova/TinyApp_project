var express = require("express");
var app = express();
// default port 8080
var PORT = 8080;
const bodyParser = require("body-parser");
// Set cookies
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
   return r;
}

// Set ejs as the view engine
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// add additional endpoints
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
  res.redirect("/urls/");
});

// response can contain HTML code, which would be rendered in the client browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
  username: req.cookies.username,
  urls: urlDatabase
};
res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls", (req, res) => {
  let templateVars = {
  username: req.cookies.username,
  urls: urlDatabase
};
res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]
 };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});