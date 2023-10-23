const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/database");

dotenv.config({ path: "./config/config.env" });
connectDB();
const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());

//* Routes
const authenticationRoute = require("./routes/authentication");
const songRoute = require("./routes/song");

app.use("/auth", authenticationRoute);
app.use(songRoute);

const friendsRoutes = require("./routes/friends");
app.use("/friends", friendsRoutes);

const invitationsRoutes = require("./routes/invitation");
app.use("/invitation", invitationsRoutes);

//*

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${PORT}`);
});
