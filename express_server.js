const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const {getUserByEmail} = require('./helper');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  cookieSession({
    name: "session",
    keys: ["lighthouse", "labs"],
  })
);

//Generate Random URL string
const generateRandomString = () => {
  return Math.random().toString(36).substr(6);
};

//Add user to DB
const registerUser = (id, email, password) => {
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password, 10),
  };
};

//Filter DB
const urlsForUser = (inputUserId, db) => {
  let filteredDB = {};

  for (let data in db) {
    console.log(db[data]);
    if (db[data].userId === inputUserId) {
      filteredDB[data] = {
        longURL: db[data].longURL,
        userId: db[data].userId,
      };
    }
  }
  return filteredDB;
};

//FAKE DATABASE
const urlDatabase = {
  "9sm5xKs": { longURL: "http://www.google.com", userId: "" },
  b3xVn2: { longURL: "http://www.lighthouselabs.ca", userId: "" },
};

//FAKE USER DATABASE
const users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
  res.redirect("/urls");
});

//Display URLs endpoint
app.get("/urls", (req, res) => {
  const database = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls: database, user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

//Display create url page endpoint
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }

  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

//Update DB with submitted URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const newDataItem = {
    longURL: req.body.longURL,
    userId: req.session.user_id,
  };
  urlDatabase[shortURL] = newDataItem;
  const redirectLink = `/urls/${shortURL}`;
  res.redirect(redirectLink);
  res.send("Ok");
});

//edit url
app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});

//delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userId !== req.session.user_id) {
    res.redirect("/urls");
  } else {
    let shortURL = req.params.shortURL;

    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

//display the newly created url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

//edit selected url
app.post("/editurl/:id", (req, res) => {
  if (urlDatabase[req.params.id].userId !== req.session.user_id) {
    res.redirect("/urls");
  } else {
    //Update DB with submitted URL
    let shortURL = req.params.id;
    const newDataItem = {
      longURL: req.body.longURL,
      userId: req.session.user_id,
    };

    urlDatabase[shortURL] = newDataItem;

    res.redirect("/urls");
    res.send("Ok");
  }
});

//Redirect User to the source url
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

//render register user page
app.get("/register", (req, res) => {
  res.render("user_register", { error: "", user: users[req.session.user_id] });
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();

  //Reject register if any field is empty
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.render("user_register", {
      error: "Cannot leave email or password field blank.", user: users[req.session.user_id]
    });
    //Reject register if user exists
  } else if (getUserByEmail(req.body.email, users).email) {
    res.status(400);
    res.render("user_register", {
      error: "Email is already registered please try another.", user: users[req.session.user_id]
    });
  } else {
    req.session.user_id = userId;
    res.redirect("/urls");
    registerUser(userId, req.body.email, req.body.password);
  }
});

//get login info
app.get("/login", (req, res) => {
  res.render("user_login", { error: "", user: users[req.session.user_id] });
});

//get login info
app.post("/login", (req, res) => {
  const possibleUser = getUserByEmail(req.body.email, users);
  if (
    possibleUser.email &&
    bcrypt.compareSync(req.body.password, possibleUser.password)
  ) {
    req.session.user_id = getUserByEmail(req.body.email, users).id;
    res.redirect("/urls");
    console.log("Yes authed");
  } else {
    res.render("user_login", { error: "Error incorrect username or password", user: users[req.session.user_id] });
    console.log("Eror on login");
  }
});

//get logout request
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
  console.log(req.body);
});

app.listen(PORT, () => {
  console.log(`App is live on port ${PORT}`);
});
