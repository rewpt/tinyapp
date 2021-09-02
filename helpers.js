const bcrypt = require('bcrypt');

const getUserByEmail = function(newEmail, database) {
  for (let user in database) {
    if (newEmail === database[user].email) {
      return database[user].id;
    }
  }
  return undefined;
};

const generateRandomString = function() {
  let tiny = '';
  const charBank = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bankLen = charBank.length;
  for (let i = 0; i < 6; i++) {
    let index = Math.floor((Math.random() * bankLen));
    let ranChar = charBank.charAt(index);
    tiny += ranChar;
  }
  return tiny;
};

const passValid = function(id, password, database) {
  //This should replace the old code below
  return bcrypt.compareSync(password, database[id].password); // returns true
  /*if (database[id].password === password) {
    return true
  }
  return false;*/
};

const urlsForUser = function(id, database) {
  const retObj = {};
  for (let url in database) {
    if (database[url]['user_id'] === id) {
      retObj[url] = database[url].longURL;
    }
  }
  return retObj;
};

const hasHTTP = function(link) {
  if (link.indexOf("http://") === 0 || link.indexOf("https://") === 0) {
    return true;
  }
  return false;
};

class User {
  constructor(email, password) {
    this.id = generateRandomString();
    this.email = email;
    this.password = password;
  }
}

module.exports = { getUserByEmail, generateRandomString, passValid, urlsForUser, hasHTTP, User };