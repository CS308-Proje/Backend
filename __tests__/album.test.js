require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const albumController = require("../controllers/album");
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
app.get("/albums", protect, albumController.getAlbums);
app.get("/albums/:id", protect, albumController.getAlbum);
app.delete("/albums/:id", protect, albumController.deleteAlbum);
app.put("/albums/:id", protect, albumController.updateAlbum);
app.post("/add-song-not-from-spotify", protect, addSongThatIsNotFromSpotifyAPI);

describe("Album API", () => {
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
    await Song.deleteMany({ _id: testSongId });
    await Artist.deleteMany({ _id: testArtistId });
    await mongoose.connection.close();
  });

  it("should get all albums", async () => {
    const res = await request(app)
      .get("/albums")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("albums");
    expect(res.body.success).toEqual(true);
  });

  it("should add a song", async () => {
    const songData = {
      songName: "Test Song1",
      mainArtistName: "Test Artist1",
      albumName: "Test Album1",
      featuringArtistNames: [],
      release_date: "2021-01-02",
    };

    const res = await request(app)
      .post("/add-song-not-from-spotify")
      .set("Authorization", `Bearer ${authToken}`)
      .send(songData);

    console.log(res.body);
    testAlbumId = res.body.song.albumId;
    testSongId = res.body.song._id;
    testArtistId = res.body.song.mainArtistId;

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("song");
  });

  it("should get a single album", async () => {
    const res = await request(app)
      .get(`/albums/${testAlbumId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body).toHaveProperty("album");
    expect(res.body.album[0]._id).toEqual(testAlbumId);
  });

  it("should update an album", async () => {
    const updateAlbumData = {
      name: "Updated Test Album",
    };

    const res = await request(app)
      .put(`/albums/${testAlbumId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateAlbumData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.album.name).toEqual("Updated Test Album");
  });

  it("should delete an album", async () => {
    const res = await request(app)
      .delete(`/albums/${testAlbumId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.message).toEqual("Album is deleted.");
  });
});
