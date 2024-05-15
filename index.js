const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8000;
const url = require("url");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const sessionExpiry = 24 * 60 * 60 * 1000;
const Joi = require("joi");
const { createServer } = require('node:http');
const mongoose = require('mongoose');
const initializeSocket = require('./socket');
const server = createServer(app);
const chatRoutes = require('./routes/chatRoutes');
const MongoClient = require("mongodb").MongoClient;


const mongo_secret = process.env.MONGODB_SESSION_SECRET;
const node_secret = process.env.NODE_SESSION_SECRET;
const mongo_uri = process.env.MONGODB_URI;
const mongo_database = process.env.MONGODB_DATABASE;
mongoose.connect(mongo_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const client = new MongoClient(mongo_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect(err => {
  if (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  } else {
    console.log("Connected to MongoDB");
  }
});

const userCollection = client.db(mongo_database).collection("users");

const User = require('./models/user');
const ChatRoom = require('./models/chatRoom');
const Message = require('./models/message');

const sessionCollection = MongoStore.create({
  mongoUrl: mongo_uri,
  collectionName: "sessions",
  crypto: {
    secret: mongo_secret,
  },
});

const sessionMiddleware = session({
  secret: node_secret,
  store: sessionCollection,
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: sessionExpiry,
  },
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(sessionMiddleware);

const io = initializeSocket(server, sessionMiddleware);

const navLinks = [
  { name: "Home", link: "/" },
  { name: "Main", link: "/main" },
  { name: "Games", link: "/games" },
  { name: "Social", link: "/social" },
  { name: "Chatroom", link: "/chat" },
  { name: "Login", link: "/login" },
  { name: "Signup", link: "/signup" },
];

app.use('/api/chat', chatRoutes);

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
  var type = "user";

  const userSchema = Joi.object({
    username: Joi.string().alphanum().max(25).required(),
    password: Joi.string().max(25).required(),
    email: Joi.string().email({
      minDomainSegments: 2,
    }),
  });

  const validateUser = userSchema.validate({ username, password, email });
  if (validateUser.error != null) {
    console.log(validateUser.error);
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
  res.redirect("/");
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
    { projection: { _id: 1, username: 1, password: 1 }}
  );

  if (!user) {
    console.log(`User ${username} not found.`);
    //should create a res.render to give an error page when this happens
    res.redirect("/login");
    return;
  }

  console.log("Fetched User:", user);

  if (await bcrypt.compare(inputPass, user.password)) {
    console.log("Password is correct");
    req.session.authenticated = true;
    req.session.userId = user._id;
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

app.get("/social", (req, res) => {
    res.render("social");
});

app.get("/chat", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  // hardcoded test user just to see if it works
  const testUserId = "664522cb06aaf40f9dabda13";
  const existingRoom = await ChatRoom.findOne({ type: "direct", participants: { $all: [req.session.userId, testUserId] } });

  let chatRoom;
  if (existingRoom) {
    chatRoom = existingRoom;
  } else {
    chatRoom = new ChatRoom({
      type: "direct",
      participants: [req.session.userId, testUserId],
      createdAt: new Date()
    });
    await chatRoom.save();
  }

  res.render('chatroom', { loadChatScript: true, chatRoomId: chatRoom._id.toString() }); 
});


app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

server.listen(PORT, () => {
  console.log(`Golden Gaming is listening on port: ${PORT}`);
});
