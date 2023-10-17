const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(express.json());

app.use(cookieParser());

//* Routes
const authenticationRoute = require("./routes/authentication");

app.use("/auth", authenticationRoute);

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${PORT}`);
});
