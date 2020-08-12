//Import required packages
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcrypt");

//Importing helper functions
const {
  getUserByEmail,
  generateRandomString,
  registerUser,
  urlsForUser,
  checkUserIdentity,
} = require("./helper");

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

//FAKE DATABASE
const urlDatabase = {};

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
  //Redirect to login if user not logged in
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  res.render("urls_new", { user: users[req.session.user_id] });
});

//Update DB with submitted URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const newDataItem = {
    longURL: req.body.longURL,
    userId: req.session.user_id,
  };
  urlDatabase[shortURL] = newDataItem;
  res.redirect(`/urls/${shortURL}`);
});

//Redirect to edit url page
app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});

//Delete selected url
app.post("/urls/:shortURL/delete", (req, res) => {
  if (
    checkUserIdentity(
      urlDatabase[req.params.shortURL].userId,
      req.session.user_id
    )
  ) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

//display the newly created url
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send("Sorry resource not found");
  } else if (
    checkUserIdentity(
      urlDatabase[req.params.shortURL].userId,
      req.session.user_id
    )
  ) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("Sorry only authorized users can access this page.");
  }
});

//edit selected url
app.post("/editurl/:id", (req, res) => {
  if (
    checkUserIdentity(urlDatabase[req.params.id].userId, req.session.user_id)
  ) {
    //Update DB with submitted URL
    let shortURL = req.params.id;
    const newDataItem = {
      longURL: req.body.longURL,
      userId: req.session.user_id,
    };
    urlDatabase[shortURL] = newDataItem;
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

//Redirect User to the source url
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send("Sorry resource not found");
  }
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
      error: "Cannot leave email or password field blank.",
      user: users[req.session.user_id],
    });
    //Reject register if user exists
  } else if (getUserByEmail(req.body.email, users).email) {
    res.status(400);
    res.render("user_register", {
      error: "Email is already registered please try another.",
      user: users[req.session.user_id],
    });
  } else {
    req.session.user_id = userId;
    users[userId] = registerUser(userId, req.body.email, req.body.password);
    res.redirect("/urls");
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
  } else {
    res.render("user_login", {
      error: "Error incorrect username or password",
      user: users[req.session.user_id],
    });
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
