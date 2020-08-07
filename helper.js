//Look up user in database
const getUserByEmail = function (email, database) {
  let user = {};
  for (let entry in database) {
    if (database[entry].email === email) {
      user = database[entry];
    }
  }
  return user;
};

//Generate a random string to act as ID
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

module.exports = {getUserByEmail, generateRandomString};