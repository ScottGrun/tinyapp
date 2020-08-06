//Add user to DB
const registerUser = (id, email, password) => {
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password, 10),
  };
  console.log(users);

  return users;
};

module.exports = {registerUser};