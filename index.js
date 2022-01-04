const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { PORT } = process.env;
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => res.render("boards"));

// https://github.com/FoongL/in-class-express
app.listen(PORT, () => {
  console.log(`listening at ${PORT}`);
});
