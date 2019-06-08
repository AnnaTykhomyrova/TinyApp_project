// All package imports (NPM)
var express = require("express");
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt'); // bcrypt when storing passwords

// server setup
var app = express();

// default port 8080
var PORT = 8080;

// middlewear setup
app.use(cookieSession({
  name: 'user_id',
  secret: "This app is so hard"
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); // Set ejs as the view engine


function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
   return r;
}

// Database sets
var urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW" }
};
const users = {};


// GET functions
app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login", (req, res) => {
  let templateVars = {
  user: users[req.session.user_id],
  urls: urlDatabase
};
res.render("login_form", templateVars);
});

// response can contain HTML code, which would be rendered in the client browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
  user: users[req.session.user_id],
  urls: urlDatabase
};
res.render("urls_new", templateVars);
});

// checking if user logged
app.get("/urls", (req, res) => {
  let currentUser = req.session.user_id;
  if (currentUser) {
    var userURL = urlsForUser(currentUser);
    let templateVars = {
      user: users[req.session.user_id],
      urls: userURL
    };
  res.render("urls_index", templateVars);
} else {
  res.redirect("/login");
}
});

// checking if URLs belong to current user
app.get("/urls/:shortURL", (req, res) => {
  let currentUser = req.session.user_id;
  if (currentUser) {
    if (currentUser === urlDatabase[req.params.shortURL].userID) {
      let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
        user: users[req.session.user_id]
      };
      res.render("urls_show", templateVars);
    } else {
      res.send('This URL doesnt belong to you!');
    }
  } else {
    res.send('Please, login first');
  }
});

app.get("/register", (req, res) => {
let templateVars = {
  user: users[req.session.user_id],
  urls: urlDatabase
};
res.render("registration_form", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


// POST functions
// clear cookie after logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

// helping function for checking if URLs belong to current user
function urlsForUser(id) {
  var userURL = {};
    for (let shortId in urlDatabase) {
      if (urlDatabase[shortId].userID === id) {
        userURL[shortId] = urlDatabase[shortId];
      }
    }
  return userURL;
}

// helping function for checking if user email exist
function emailAlreadyInUse(email) {
  let exists = false;
  for(let user in users) {
    if(users[user].email === email) {
      exists = users[user];
    }
  }
  return exists;
}

// checking email and password when user regist
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
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
  req.session.user_id = id;
  res.redirect("/urls");
});

// checking information when user try to login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailAlreadyInUse(email);
  if (!user) {
    res.status(403).send('Email cannot be found!');
  } else {
      if (bcrypt.compareSync(password, user.password)) {
        req.session.user_id = user.id;
        res.redirect('/urls');
      } else {
        res.status(403).send('Password doesnt exist!');
      }
    }
  });

// only urls creator can delete own urls
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
  delete urlDatabase[req.params.shortURL];
}
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL  = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//server start
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});