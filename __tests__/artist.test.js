require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const artistContoller = require("../controllers/artist");
const authenticationController = require("../controllers/authentication");
const { protect } = require("../middlewares/isAuth");
const { addSongThatIsNotFromSpotifyAPI } = require("../controllers/song");
const Album = require("../models/Album");
const User = require("../models/User");
const Song = require("../models/Song");
const Artist = require("../models/Artist");
const app = express();

app.use(express.json());
app.post("/login", authenticationController.login);
app.get("/artists", protect, artistContoller.getArtists);
app.get("/artists/:id", protect, artistContoller.getArtist);
app.delete("/artists/:id", protect, artistContoller.deleteArtist);
app.put("/artists/:id", protect, artistContoller.updateArtist);
app.post("/add-song-not-from-spotify", protect, addSongThatIsNotFromSpotifyAPI);

describe("Artist API", () => {
  let authToken;
  let testAlbumId;
  let testSongId;
  let testArtistId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Log in to get a token
    const loginRes = await request(app).post("/login").send({
      email: "testuser1702056245215@example.com",
      password: "password123",
    });

    expect(loginRes.statusCode).toEqual(200);
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should get all artists", async () => {
    const res = await request(app)
      .get("/artists")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("artists");
    expect(res.body.success).toEqual(true);
  });

  it("should add a song", async () => {
    const songData = {
      songName: "Test Song8547",
      mainArtistName: "Test Artist65451",
      albumName: "Test Album4561",
      featuringArtistNames: [],
      release_date: "2021-01-02",
    };

    const res = await request(app)
      .post("/add-song-not-from-spotify")
      .set("Authorization", `Bearer ${authToken}`)
      .send(songData);

    testAlbumId = res.body.song.albumId;
    testSongId = res.body.song._id;
    testArtistId = res.body.song.mainArtistId;

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("song");
  });

  it("should get a single artist", async () => {
    const res = await request(app)
      .get(`/artists/${testArtistId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body).toHaveProperty("artist");
    expect(res.body.artist[0]._id).toEqual(testArtistId);
  });

  it("should update an artist", async () => {
    const updateArtistData = {
      artistName: "Updated Test Artist",
    };

    const res = await request(app)
      .put(`/artists/${testArtistId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateArtistData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("artist");
    expect(res.body.artist.artistName).toEqual("Updated Test Artist");
  });

  it("should delete an artist", async () => {
    const res = await request(app)
      .delete(`/artists/${testArtistId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.message).toEqual("Artist is deleted.");

    await Song.deleteMany({ _id: testSongId });
    await Album.deleteMany({ _id: testAlbumId });
  });
});
