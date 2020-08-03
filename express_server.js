const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

//Generate Random URL string
const generateRandomString = () => {
  return Math.random().toString(36).substr(6);
};

console.log(generateRandomString());
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  //Redirect user to the long url on short url click
  res.redirect(urlDatabase[req.params.shortURL]);
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

app.listen(PORT, () => {
  console.log(`App is live on port ${PORT}`);
});
