const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(cookieParser());

//Generate Random URL string
const generateRandomString = () => {
  return Math.random().toString(36).substr(6);
};

//Add user to DB
const registerUser = (id, email, password) => {
  users[id] = {
    id,
    email,
    password,
  };
};

//Check if emaile exists
const checkEmailExists = (emailToCheck, databaseToCheck) => {
  console.log(databaseToCheck, "  fuck");
  if (Object.keys(databaseToCheck).length === 0) {
    return false;
  }

  for (let user in databaseToCheck) {
    if (databaseToCheck[user].email === emailToCheck) {
      return true;
    }
  }
  return false;
};

//FAKE DATABASE
const urlDatabase = {
  "9sm5xKs": "http://www.google.com",
  b2xVn2: "http://www.lighthouselabs.ca",
};

//FAKE USER DATABASE
const users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  //Redirect user to the long url on short url clickurlDatabase[req.params.shortURL];
  res.redirect(urlDatabase[req.params.shortURL]);
});

//edit url
app.post("/editurl/:id", (req, res) => {
  //Update DB with submitted URL
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
  res.send("Ok");
});

//render register user page
app.get("/register", (req, res) => {
  res.render("user_register", { error: "" });
});

app.post("/register", (req, res) => {
  const userId = generateRandomString();

  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.render("user_register", {
      error: "Cannot leave email or password field blank.",
    });
  } else if (checkEmailExists(req.body.email, users) === true) {
    res.status(400);
    res.render("user_register", {
      error: "Email is already registered please try another.",
    });
  } else {
    res.cookie("user_id", userId);
    res.redirect("/urls");

    //Register user and add to DB
    registerUser(userId, req.body.email, req.body.password);
  }
});

//get login info
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
  console.log(req.body);
});

//get logout request
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
  console.log(req.body);
});

app.post("/urls", (req, res) => {
  //Update DB with submitted URL
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  const redirectLink = `/urls/${shortURL}`;
  res.redirect(redirectLink);
  console.log(urlDatabase);
  res.send("Ok");
});

//delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log(shortURL);
  console.log(urlDatabase);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//edit url
app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});

app.listen(PORT, () => {
  console.log(`App is live on port ${PORT}`);
});
