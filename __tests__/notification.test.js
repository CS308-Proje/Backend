require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const invitationController = require("../controllers/invitation");
const notificationController = require("../controllers/notification");
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const { protect } = require("../middlewares/isAuth");
const authenticationController = require("../controllers/authentication");
const e = require("express");
const app = express();

app.use(express.json());
app.post("/login", authenticationController.login);
app.get(
  "/invitationNotification",
  protect,
  notificationController.getInvitationNotification
);

app.get(
  "/getAllNotification",
  protect,
  notificationController.getAllNotifications
);

let authToken;

describe("Notifications API", () => {
  beforeAll(async () => {
    // Connect to your test database
    await mongoose.connect(process.env.MONGO_URI, {});

    const loginRes = await request(app).post("/login").send({
      email: "emirclkbyk@hotmail.com",
      password: "123456789",
    });

    authToken = loginRes.body.token;

    //console.log("authtoken:", authToken);
  }, 50000);

  afterAll(async () => {
    await mongoose.connection.close();
  }, 50000);

  it("should get invitation notification", async () => {
    const res = await request(app)
      .get("/invitationNotification")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
  }, 50000);

  it("should get getAllNotification notification", async () => {
    const res = await request(app)
      .get("/getAllNotification")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
  }, 50000);
});
