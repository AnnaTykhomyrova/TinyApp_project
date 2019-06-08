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
// Use bcrypt When Storing Passwords
const bcrypt = require('bcrypt');

function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
   return r;
}

// Set ejs as the view engine
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW" }
};

const users = {};

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
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };

  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

function urlsForUser(id) {
  var userURL = {};
    for (let shortId in urlDatabase) {
      if (urlDatabase[shortId].userID === id) {
        userURL[shortId] = urlDatabase[shortId];
  // /urls user URL
      }
    }
    return userURL;
}

app.get("/urls", (req, res) => {
  let currentUser = req.cookies.user_id;
  if (currentUser) {
    var userURL = urlsForUser(currentUser);
  //console.log(users[req.cookies.user_id]);
  // console.log(req.cookies.user_id);
  // console.log(userURL);
    let templateVars = {
      user: users[req.cookies.user_id],
      urls: userURL
    };
  res.render("urls_index", templateVars);
} else {
  res.send('Please, login first');
}
});

app.get("/urls/:shortURL", (req, res) => {
  let currentUser = req.cookies.user_id;
  console.log(currentUser);
  if (currentUser) {
    if (currentUser === urlDatabase[req.params.shortURL].userID) {
      let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
        user: users[req.cookies.user_id]
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
  user: users[req.cookies.user_id],
  urls: urlDatabase
};
res.render("registration_form", templateVars);
});

function emailAlreadyInUse(email) {
  let exists = false;
  for(let user in users) {
    if(users[user].email === email) {
      exists = users[user];
    }
  }
  return exists;
}

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
  res.cookie("user_id", id);
  console.log(users);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailAlreadyInUse(email);
  if (!user) {
    res.status(403).send('Email cannot be found!');
  } else {
      if (bcrypt.compareSync(password, user.password)) {
        res.cookie('user_id', user.id);
        res.redirect('/urls');
      } else {
        res.status(403).send('Password doesnt exist!');
      }
    }
  });




app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies.user_id) {

  delete urlDatabase[req.params.shortURL];
}
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  //urlDatabase[req.params.id] = req.body.longURL;

  urlDatabase[req.params.id].longURL  = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});