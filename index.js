const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 9001;
const url = require("url");

app.set("view engine", "ejs");
app.use(express.static("public"));

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

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/main", (req, res) => {
    res.render("main");
});

app.get("/games", (req, res) => {
    res.render("games");
});

app.get("/social", (req, res) => {
    res.render("social");
})
app.listen(PORT, () => {
  console.log(`Golden Gaming is listening on port: ${PORT}`);
});
