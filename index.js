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
const { createServer } = require("node:http");
const mongoose = require("mongoose");
const initializeSocket = require("./socket");
//const server = createServer(app);
const chatRoutes = require("./routes/chatRoutes");
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

//for the video call server
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

client.connect((err) => {
  if (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  } else {
    console.log("Connected to MongoDB");
  }
});

const userCollection = client.db(mongo_database).collection("users");
const gameCollection = client.db(mongo_database).collection("games");

 
const User = require("./models/user");
const ChatRoom = require("./models/chatRoom");
const Message = require("./models/message");

const sessionCollection = MongoStore.create({
  mongoUrl: mongo_uri,
  collectionName: "sessions", 
  crypto: {
    secret: mongo_secret,
  },
});

app.use("/js", express.static("./public/js"));

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

// const io = initializeSocket(server, sessionMiddleware);

const navLinks = [
  { name: "Home", link: "/" },
  { name: "Main", link: "/main" },
  { name: "Games", link: "/games" },
  { name: "Social", link: "/social" },
  { name: "Chatroom", link: "/chat" },
  { name: "Profile", link: "/profile"}
];

app.use("/api/chat", chatRoutes);

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
    email: Joi.string()
      .email({
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
    { projection: { _id: 1, username: 1, password: 1 } }
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

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/main", (req, res) => {
  res.render("main");
});

app.get("/profile", async (req, res) => {
  let username = req.session.username;

  const userInfo = await userCollection.find({username: username}).project({name: 1, email: 1, favGame: 1}).toArray();
  console.log(userInfo);

  res.render("profile", {username: username, email: userInfo[0].email, favGame: userInfo[0].favGame});
});

app.get("/games", (req, res) => {
  res.render("games");
});

app.get("/gameJigsawHub", (req, res) => {
  res.render("gameJigsawHub");
});

app.get("/gamesSpecific", async (req, res) => {
  let gamename = req.query.game;
  gamename = gamename.charAt(0).toUpperCase() + gamename.slice(1);

  const gameInfo = await gameCollection.find({name: gamename}).project({name: 1, desc: 1, _id: 1, link: 1, rules: 1}).toArray();

  res.render("gamesSpecific", {gamename: gamename, desc: gameInfo[0].desc, link: gameInfo[0].link, rules: gameInfo[0].rules});

})

app.get("/social", (req, res) => {
  res.render("social");
});

app.get("/chat", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const userId = `${req.session.userId}`;

  let chatRoom = await ChatRoom.findOne({ participants: userId });

  if (!chatRoom) {
    chatRoom = new ChatRoom({
      participants: [userId],
      createdAt: new Date(),
    });
    await chatRoom.save();
  }

  res.render("chatroom", {
    loadChatScript: true,
    chatRoomId: chatRoom._id.toString(),
  });
});

app.get("/gameCheckersHub", (req, res) => {
  res.render("gameJigsawHub");
});

app.get("/gameBingosHub", (req, res) => {
  res.render("gameBingoHub");
});

app.get("/videocall", (req,res) => {
  res.redirect(`/${uuidV4()}`)
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
      socket.join(roomId)
      socket.to(roomId).emit('user-connected', userId)

      socket.on('disconnect', () => {
          socket.to(roomId).emit('user-disconnected', userId)
      })
  })
})






app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});


server.listen(PORT, () => {
  console.log(`Golden Gaming is listening on port: ${PORT}`);
});
