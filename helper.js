//Look up user
const getUserByEmail = function (email, database) {
  let user = {};
  for (let entry in database) {
    if (database[entry].email === email) {
      user = database[entry];
    }
  }
  return user;
};

module.exports = {getUserByEmail};