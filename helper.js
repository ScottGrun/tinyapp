const bcrypt = require("bcrypt");

//Look up user
const getUserByEmail = function (email, database) {
  let user = { undefined };
  for (let entry in database) {
    if (database[entry].email === email) {
      user = database[entry];
    }
  }
  return user;
};

//Generate Random URL string
const generateRandomString = () => {
  return Math.random().toString(36).substr(6);
};

//Add a user to the database
const registerUser = (id, email, password) => {
  return {
    id,
    email,
    password: bcrypt.hashSync(password, 10),
  };
};

//Filter database extracting links for specific user
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

//Check user match
const checkUserIdentity =(actual, expected)=>{
  return actual === expected;
}

module.exports = { getUserByEmail, generateRandomString, registerUser, urlsForUser, checkUserIdentity };
