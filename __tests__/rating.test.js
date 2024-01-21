require("dotenv").config({ path: "./config/config.env" });
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { login } = require("../controllers/authentication");
const { rateSong, rateAlbum, rateArtist } = require("../controllers/rating");
const { protect } = require("../middlewares/isAuth");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.post("/login", login);

app.post("/rateSong/:songId", protect, rateSong);
app.post("/rateAlbum/:albumId", protect, rateAlbum);
app.post("/rateArtist/:artistId", protect, rateArtist);

describe("Rating API - Song", () => {
  let existingSongId = "65ad51dedd3aa481270929e5"; // Existing song ID
  let existingAlbumId = "65ad51dddd3aa481270929de"; // Existing album ID
  let existingArtistId = "65ad51dedd3aa481270929e1"; // Existing artist ID
  let authToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const loginRes = await request(app).post("/login").send({
      email: "dummyForRatigTest@gmail.com", //existing user form database
      password: "123456789",
    });

    expect(loginRes.statusCode).toEqual(200);
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should successfully rate a song", async () => {
    const res = await request(app)
      .post(`/rateSong/${existingSongId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        ratingValue: 5,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Song Rated!");
  });

  it("should successfully rate an album", async () => {
    const res = await request(app)
      .post(`/rateAlbum/${existingAlbumId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        ratingValue: 5,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Album Rated!");
  });

  it("should successfully rate an artist", async () => {
    const res = await request(app)
      .post(`/rateArtist/${existingArtistId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        ratingValue: 5,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Artist Rated!");
  });
});
