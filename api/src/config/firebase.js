const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://full-stack-react-graphql.firebaseio.com"
});

module.exports = admin;
