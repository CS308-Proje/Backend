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
const authenticationRoutes = require("./routes/authentication");
const songRoutes = require("./routes/song");
const friendsRoutes = require("./routes/friends");
const invitationsRoutes = require("./routes/invitation");
const albumRoutes = require("./routes/album");
const userRoutes = require("./routes/user");
app.use("/auth", authenticationRoutes);
app.use(songRoutes);
app.use(albumRoutes);
app.use(userRoutes);
app.use("/friends", friendsRoutes);
app.use("/invitation", invitationsRoutes);

//*

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${PORT}`);
});
