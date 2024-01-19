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
  let existingUserId = "65aa952320e98f6c21a1d4f7"; // Existing user ID
  let existingSongId = "65aa9556c54da23e4de4430a"; // Existing song ID
  let existingAlbumId = "65aa9555c54da23e4de442ff"; // Existing album ID
  let existingArtistId = "65aa9555c54da23e4de44302"; // Existing artist ID
  let authToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const loginRes = await request(app).post("/login").send({
      email: "testuser1702056245215@example.com", //existing user form database
      password: "password123",
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
        ratingValue: 3,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Song Rated!");
  });

  it("should successfully rate an album", async () => {
    const res = await request(app)
      .post(`/rateAlbum/${existingAlbumId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        ratingValue: 4,
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
