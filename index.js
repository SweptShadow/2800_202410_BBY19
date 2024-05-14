
const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8000;
const url = require("url");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require ("bcrypt");
const saltRounds = 12;
const sessionExpiry = 24 * 60 * 60 * 1000;
const Joi = require("joi");

const mongo_uri = process.env.MONGODB_URI;
const mongo_secret = process.env.MONGODB_SESSION_SECRET;
const node_secret = process.env.NODE_SESSION_SECRET;
const mongo_database = process.env.MONGODB_DATABASE;
const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(mongo_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userCollection = client.db(mongo_database).collection("users");
const sessionCollection = MongoStore.create({
  mongoUrl: mongo_uri,
  collectionName: "sessions",
  crypto: {
    secret: mongo_secret,
  },
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/js", express.static("./public/js"));
app.use(session({
  secret: node_secret,
  store: sessionCollection,
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: sessionExpiry,
  },
})
);

const navLinks = [
  { name: "Home", link: "/" },
  { name: "Main", link: "/main" },
  { name: "Games", link: "/games" },
  { name: "Social", link: "/social" },
];

app.use("/", (req, res, next) => {
  app.locals.navLinks = navLinks;
  app.locals.currentUrl = url.parse(req.url).pathname;
  next();
});

app.get("/", (req, res) => {
  res.render("root");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signupSubmit", async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;

  const userSchema = Joi.object({
    username: Joi.string().alphanum().max(25).required(),
    password: Joi.string().max(25).required(),
    email: Joi.string().email({
      minDomainSegments: 2,
    }),
  });

  const validateUser = userSchema.validate({ username, password, email });
  if (validateUser.error != null) {
    console.log(validation.error);
    res.redirect("/signup");
    return;
  }

  var hashedPass = await bcrypt.hash(password, saltRounds);

  await userCollection.insertOne({
    username: username,
    password: hashedPass,
    email: email,
    type: type,
  });

  console.log(`User ${username} successfully added to database.`);
  req.session.authenticated = true;
  req.session.username = username;
  res.redirect("/main");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/loginSubmit", async (req, res) => {
  var inputEmail = req.body.email;
  var inputPass = req.body.password;

  const loginSchema = Joi.object({
    email: Joi.string().email({
      minDomainSegments: 2,
    })
    .required(),
    password: Joi.string().max(25).required(),
  });

  const validateLogin = loginSchema.validate({
    email: inputEmail,
    password: inputPass,
  });

  if (validateLogin.error != null) {
    console.log(validateLogin.error);
    res.redirect("/login");
    return;
  }

  const user = await userCollection.findOne(
    { email: inputEmail },
    { projection: { username: 1, password: 1 }}
  );

  if (!user) {
    console.log(`User ${username} not found.`);
    /*should create a res.render to give an error page when this happens*/
    res.redirect("/login");
    return;
  }

  if (await bcrypt.compare(inputPassword, user.password)) {
    console.log("Password is correct");
    req.session.authenticated = true;
    req.session.username = user.username;
    res.redirect("/main");
    return;
  } else {
    console.log("Password incorrect");
    res.redirect("/login");
    return;
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.clearCookie("connect.sid", { path: "/" });
  res.render("logout");
});

app.get("/main", (req, res) => {
    res.render("main");
});

app.get("/games", (req, res) => {
    res.render("games");
});

app.get("/gamesSpecific", (req, res) => {
  let gamename = req.query.game;
  gamename = gamename.charAt(0).toUpperCase() + gamename.slice(1);

  res.render("gamesSpecific", {gamename: gamename});

})

app.get("/social", (req, res) => {
    res.render("social");
});

app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

app.listen(PORT, () => {
  console.log(`Golden Gaming is listening on port: ${PORT}`);
});
