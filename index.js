const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/database");

dotenv.config({ path: "./config/config.env" });
connectDB();
const app = express();
app.use(express.json());
app.use(cookieParser());

//* Routes
const authenticationRoute = require("./routes/authentication");
app.use("/auth", authenticationRoute);

const friendsRoutes = require('./routes/friends'); 
app.use('/friends', friendsRoutes);

const invitationsRoutes = require('./routes/invitation');
app.use('/invitation', invitationsRoutes);

//*

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${PORT}`);
});
