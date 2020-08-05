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
const checkValueExists = (valueName, value, databaseToCheck) => {
  console.log(databaseToCheck, "  fuck");
  if (Object.keys(databaseToCheck).length === 0) {
    return false;
  }

  for (let user in databaseToCheck) {
    if (databaseToCheck[user][valueName] === value) {
      return databaseToCheck[user];
    }
  }
  return false;
};

//FAKE DATABASE
const urlDatabase = {
  "9sm5xKs": { longURL: "http://www.google.com", userId: "" },
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userId: "" },
};

//FAKE USER DATABASE
const users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
  res.redirect("/urls");
});

//Display URLs endpoint
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

//Display create url page endpoint
app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  }

  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

//Update DB with submitted URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  const redirectLink = `/urls/${shortURL}`;
  res.redirect(redirectLink);
  console.log(urlDatabase);
  res.send("Ok");
});

//edit url
app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});

//delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log(shortURL);
  console.log(urlDatabase);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//display the newly created url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id],
  };
  res.render("urls_show", templateVars);
});

//edit selected url
app.post("/editurl/:id", (req, res) => {
  //Update DB with submitted URL
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
  res.send("Ok");
});

//Redirect User to the source url
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
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
  } else if (checkValueExists("email", req.body.email, users)) {
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
app.get("/login", (req, res) => {
  res.render("user_login", { error: "" });
});

//get login info
app.post("/login", (req, res) => {
  if (checkValueExists("email", req.body.email, users)) {
    if (
      checkValueExists("email", req.body.email, users).password !==
      req.body.password
    ) {
      res.render("user_login", {
        error: "Error incorrect username or password",
      });
    }
    res.cookie("user_id", checkValueExists("email", req.body.email, users).id);
    res.redirect("/urls");
    console.log("Yes authed");
  }
  res.render("user_login", { error: "Error incorrect username or password" });

  console.log("Eror on login");
});

//get logout request
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
  console.log(req.body);
});

app.listen(PORT, () => {
  console.log(`App is live on port ${PORT}`);
});
