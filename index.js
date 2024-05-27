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
const passResetRoutes = require("./routes/resetRoutes");
const chatRoutes = require("./routes/chatRoutes");
const friendRoutes = require("./routes/friendRoutes");
const MongoClient = require("mongodb").MongoClient;
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const mongo_secret = process.env.MONGODB_SESSION_SECRET;
const node_secret = process.env.NODE_SESSION_SECRET;
const cloudinary_secret = process.env.CLOUDINARY_SECRET;
const google_client_id = process.env.GOOGLE_CLIENT_ID;
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET;
const google_callback_url =
  process.env.NODE_ENV === "production"
    ? process.env.GOOGLE_CALLBACK_URL_PROD
    : process.env.GOOGLE_CALLBACK_URL_DEV;
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

cloudinary.config({
  cloud_name: "defvzhd9k",
  api_key: "422958868577472",
  api_secret: cloudinary_secret,
});

//for the video call server
const server = require("http").Server(app);
const { v4: uuidV4 } = require("uuid");

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

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  // console.log('Serializing User:', user);
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  // console.log('Deserializing User ID:', id);
  try {
    const user = await User.findById(id);
    if (!user) {
      console.log("User not found");
      return done(null, false, { message: "User not found" });
    }
    // console.log('Deserialized User:', user);
    done(null, user);
  } catch (err) {
    // console.log('Error deserializing user:', err);
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: google_client_id,
      clientSecret: google_client_secret,
      callbackURL: google_callback_url,
    },
    async (token, tokenSecret, profile, done) => {
      try {
        // console.log('Google profile:', profile);
        let user = await userCollection.findOne({ googleId: profile.id });
        if (!user) {
          const newUser = {
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            type: "user",
            bio: "",
          };
          const result = await userCollection.insertOne(newUser);
          user = result.ops[0];
        }
        // console.log('User found or created:', user);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

const io = initializeSocket(server, sessionMiddleware);

const navLinks = [
  { name: "Video Call", link: "/videocall" },
  { name: "Calendar", link: "/calendar" },
  { name: "Logout", link: "/logout" },
];

app.locals.navLinks = navLinks;

app.use((req, res, next) => {
  console.log(`Received request for ${req.url}`);
  app.locals.currentUrl = url.parse(req.url).pathname;
  res.locals.userId = req.session.userId;
  next();
});

app.use("/api/chat", chatRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/password", passResetRoutes);

app.get("/", (req, res) => {
  res.render("root", {
    session: req.session,
    userId: req.session.userId || null,
  });
});

app.get("/resetPassword", (req, res) => {
  const token = req.query.token;
  console.log(`Rendering resetPassword with token: ${token}`);
  res.render("resetPassword", { token });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signupSubmit", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  const userSchema = Joi.object({
    username: Joi.string().alphanum().max(25).required(),
    password: Joi.string().max(25).required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
      })
      .required(),
  });

  const validateUser = userSchema.validate({ username, password, email });
  if (validateUser.error != null) {
    console.log(validateUser.error);
    res.redirect("/signup");
    return;
  }

  const hashedPass = await bcrypt.hash(password, saltRounds);

  try {
    await userCollection.insertOne({
      username: username,
      password: hashedPass,
      email: email,
      type: "user",
      bio: "",
    });

    console.log(`User ${username} successfully added to database.`);

    const user = await userCollection.findOne(
      { email: email },
      { projection: { _id: 1, username: 1, password: 1 } }
    );

    req.session.authenticated = true;
    req.session.userId = user._id;
    req.session.username = user.username;
    res.redirect("/");
  } catch (err) {
    console.error("Error inserting user:", err);
    res.redirect("/signup");
  }
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
    console.log(`User not found.`);
    res.redirect("/login");
    return;
  }

  console.log("Fetched User:", user);

  if (await bcrypt.compare(inputPass, user.password)) {
    console.log("Password is correct");
    req.session.authenticated = true;
    req.session.userId = user._id;
    req.session.username = user.username;
    res.redirect("/");
    return;
  } else {
    console.log("Password incorrect");
    res.redirect("/login");
    return;
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.authenticated = true;
    req.session.userId = req.user._id;
    req.session.username = req.user.username;
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.clearCookie("connect.sid", { path: "/" });
  res.render("logout");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/profile", async (req, res) => {
  if (req.session.authenticated) {
    let username = req.session.username;

    const userInfo = await userCollection
      .find({ username: username })
      .project({ name: 1, email: 1, favGame: 1, bio: 1, pfp: 1 })
      .toArray();
    console.log(userInfo);
    //check bio and if empty/whitespace, send example message. Else, send user's bio from database
    let bio = userInfo[0].bio;
    if (bio === "" || /^\s*$/.test(bio)) {
      bio = "Add bio here...";
    }

    let pfp = userInfo[0].pfp;
    if (!pfp || pfp === "") {
      pfp =
        "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg";
    }
    console.log("pfp: " + pfp);

    res.render("profile", {
      username: username,
      email: userInfo[0].email,
      favGame: userInfo[0].favGame,
      bio: bio,
      pfp: pfp,
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/bioSubmit", async (req, res) => {
  let bio = req.body.bio;
  await userCollection.updateOne(
    { username: req.session.username },
    { $set: { bio: bio } }
  );
  res.redirect("/profile");
});

app.post("/usernameSubmit", async (req, res) => {
  let name = req.body.username;
  await userCollection.updateOne(
    { username: req.session.username },
    { $set: { username: name } }
  );
  req.session.username = name;
  res.redirect("/profile");
});

app.post("/emailSubmit", async (req, res) => {
  let newEmail = req.body.email;
  await userCollection.updateOne(
    { username: req.session.username },
    { $set: { email: newEmail } }
  );
  res.redirect("/profile");
});

app.post("/favGameSubmit", async (req, res) => {
  let newFavGame = req.body.favGame;
  await userCollection.updateOne(
    { username: req.session.username },
    { $set: { favGame: newFavGame } }
  );
  res.redirect("/profile");
});

app.post("/pfpSubmit", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const file = req.files.pfp;

  cloudinary.uploader.upload(
    file.tempFilePath,
    {
      folder: "profile_pictures",
      public_id: `${req.session.username}_pfp`,
      overwrite: true,
    },
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .send({ message: "Upload failed", error: err.message });
      }

      const pfpUrl = result.secure_url;

      userCollection
        .updateOne(
          { username: req.session.username },
          { $set: { pfp: pfpUrl } }
        )
        .then(() => {
          res.redirect("/profile");
        })
        .catch((err) => {
          res
            .status(500)
            .send({ message: "Database update failed", error: err.message });
        });
    }
  );
});

app.get("/games", (req, res) => {
  res.render("games");
});

app.get("/gameJigsawHub", (req, res) => {
  res.render("gameJigsawHub");
});

app.get("/gameSudokuHub", (req, res) => {
  res.render("gameSudokuHub");
});

app.get("/gameSudokuPlay", (req, res) => {
  res.render("gameSudokuPlay");
});

app.get("/gamesSpecific", async (req, res) => {
  let gamename = req.query.game;
  gamename = gamename.charAt(0).toUpperCase() + gamename.slice(1);
  let gameTitle = gamename.charAt(0).toUpperCase() + gamename.slice(1);

  const gameInfo = await gameCollection
    .find({ name: gamename })
    .project({ name: 1, desc: 1, _id: 1, link: 1, rules: 1 })
    .toArray();
  gamename = req.query.game;

  res.render("gamesSpecific", {
    gameTitle: gameTitle,
    gamename: gamename,
    desc: gameInfo[0].desc,
    link: gameInfo[0].link,
    rules: gameInfo[0].rules,
  });
});

app.get("/api/friends", async (req, res) => {
  try {
    const friendsCollection = client
      .db(mongo_database)
      .collection("friendships");
    const friends = await friendsCollection.find().toArray();
    res.json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/social", async (req, res) => {
  res.render("social");
});

app.get("/chat", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.error(`User not found: ${req.session.userId}`);
      return res.redirect("/login");
    }

    console.log(`User ${user.email} accessing /chat`);

    res.render("chatroom", {
      loadChatScript: true,
    });
  } catch (error) {
    console.error("Error accessing chat:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/gameCheckersHub", (req, res) => {
  res.render("gameCheckersHub");
});

app.get("/gameBingoHub", (req, res) => {
  res.render("gameBingoHub");
});

app.get("/gameJigsawPlay", (req, res) => {
  res.render("gameJigsawPlay");
});

app.get("/gameCheckersPlay", (req, res) => {
  res.render("gameCheckersPlay");
});

app.get("/gameBingoPlay", (req, res) => {
  res.render("gameBingoPlay");
});
app.get("/calendar", (req, res) => {
  res.render("calendar");
});

app.get("/videocall", (req, res) => {
  const roomId = uuidV4();
  console.log(`Redirecting to /videocall/${roomId}`);
  res.redirect(`/videocall/${roomId}`);
});

app.get("/videocall/:room", (req, res) => {
  console.log(`Rendering room with ID: ${req.params.room}`);
  res.render("room", { roomId: req.params.room });
});

app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

server.listen(PORT, () => {
  console.log(`Golden Gaming is listening on port: ${PORT}`);
});
