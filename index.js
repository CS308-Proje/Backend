const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/database");

dotenv.config({ path: "./config/config.env" });

const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());

//* Routes
const authenticationRoutes = require("./routes/authentication");
const songRoutes = require("./routes/song");
const friendsRoutes = require("./routes/friends");
const invitationsRoutes = require("./routes/invitation");
const albumRoutes = require("./routes/album");
const userRoutes = require("./routes/user");
const artistRoutes = require("./routes/artist");
const ratingRoutes = require("./routes/rating");
app.use("/auth", authenticationRoutes);
app.use(songRoutes);
app.use(albumRoutes);
app.use(userRoutes);
app.use(artistRoutes);
app.use("/friends", friendsRoutes);
app.use("/invitation", invitationsRoutes);
app.use("/rating", ratingRoutes);

//*

const PORT = process.env.PORT;

start = async () => {
  connectDB();
  await app.listen(PORT, async () => {
    console.log(`Server running in ${PORT}`);
  });
};

start();
