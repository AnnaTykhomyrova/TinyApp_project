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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "tykhomyrovaanna@gmail.com",
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// add additional endpoints
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login", (req, res) => {
  let templateVars = {
  user: users[req.cookies.user_id],
  urls: urlDatabase
};
res.render("login_form", templateVars);
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// response can contain HTML code, which would be rendered in the client browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
  user: users[req.cookies.user_id],
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
  user: users[req.cookies.user_id],
  urls: urlDatabase
};
res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
let templateVars = {
  user: users[req.cookies.user_id],
  urls: urlDatabase
};
res.render("registration_form", templateVars);
});

function emailAlreadyInUse(email) {
  let exists = false;
  for(let user in users) {
    if(users[user].email === email) exists = users[user];
  }
  return exists;
}

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password == "") {
   res.status(400).send('Fields cannot be empty!');
  } else if (emailAlreadyInUse(email)) {
    res.status(400).send('Email has already exist!');
  }

  const id = generateRandomString();
  users[id] = {
    id: id,
    email: email,
    password: password
  };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailAlreadyInUse(email);
  if (!user) {
    res.status(403).send('Email cannot be found!');
  } else {
      if (user.password === password) {
        res.cookie('user_id', user.id);
        res.redirect('/urls');
      } else {
        res.status(403).send('Password doesnt exist!');
      }
    }
  });


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id]
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