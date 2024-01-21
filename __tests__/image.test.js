require("dotenv").config({ path: "./config/config.env" });
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { login } = require("../controllers/authentication");
var { getImage } = require("../controllers/image");
var { createAnalysisBasedOnSongs } = require("../controllers/analysis");
const { protect } = require("../middlewares/isAuth");

const app = express();
app.use(express.json());

app.post("/login", login);
app.get("/:id", getImage);
app.get("/createAnalysisBasedOnSongs", protect, createAnalysisBasedOnSongs);

let authToken = "";

describe("Image API", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const loginRes = await request(app).post("/login").send({
      email: "eustun@gmail.com",
      password: "123456789",
    });

    authToken = loginRes.body.token;
    expect(loginRes.statusCode).toEqual(200);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should successfully get an image", async () => {
    const imageId = "65ad06057a7c38fb373c215e";

    const res = await request(app).get(`/${imageId}`);

    expect(res.statusCode).toEqual(200);
  }, 20000);

  it("should not get an image", async () => {
    const imageId = "65abb894d556473d4735fd0a";

    const res = await request(app).get(`/${imageId}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("No image is found with this id.");
    expect(res.body.success).toEqual(false);
  }, 20000);
});
