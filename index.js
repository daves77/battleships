const express = require("express");
require("dotenv").config();

const PORT = process.env.PORT;
const app = express();

// https://github.com/FoongL/in-class-express
app.listen(PORT, () => {
  console.log(`listening at ${PORT}`);
});
