require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const songController = require("../controllers/song");
const { protect } = require("../middlewares/isAuth");
const authenticationController = require("../controllers/authentication");
const Song = require("../models/Song");
const app = express();

app.use(express.json());
app.post("/login", authenticationController.login);
app.get("/songs", protect, songController.getSongs);
app.get("/songs/:id", protect, songController.getSong);
app.post(
  "/add-song-not-from-spotify",
  protect,
  songController.addSongThatIsNotFromSpotifyAPI
);
app.put("/songs/:id", protect, songController.updateSong);
app.delete("/songs/:id", protect, songController.deleteSong);
app.get(
  "/search-from-spotify",
  protect,
  songController.addFromSpotifyAPIDirectly
);
app.post(
  "/add-song-from-spotify",
  protect,
  songController.addSongToDBThatComesFromSpotifyAPI
);

describe("Song API", () => {
  let spotifySongData = {};
  let testSongId; // id of the song we want to test
  let authToken;
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

  it("should add a song", async () => {
    const songData = {
      songName: "Test Song",
      mainArtistName: "Test Artist",
      albumName: "Test Album",
      featuringArtistNames: [],
      release_date: "2021-01-01",
    };

    const res = await request(app)
      .post("/add-song-not-from-spotify")
      .set("Authorization", `Bearer ${authToken}`)
      .send(songData);

    testSongId = res.body.song._id;

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("song");
  });

  it("should not add a song if not logged in", async () => {
    const songData = {
      songName: "Test Song",
      mainArtistName: "Test Artist",
      albumName: "Test Album",
      featuringArtistNames: [],
    };

    const res = await request(app)
      .post("/add-song-not-from-spotify")
      .send(songData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("There are problems with token.");
    expect(res.body.success).toEqual(false);
  });

  it("should get all songs", async () => {
    const res = await request(app)
      .get("/songs")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("songs");
    expect(res.body).toHaveProperty("count");
    expect(res.body.success).toEqual(true);
  });

  it("should get a single song", async () => {
    const res = await request(app)
      .get(`/songs/${testSongId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.body.success).toEqual(true);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("song");
    expect(res.body.song[0]._id).toEqual(testSongId);
    expect(res.body.song[0]).toHaveProperty("userId");
    expect(res.body.song[0]).toHaveProperty("songName");
    expect(res.body.song[0]).toHaveProperty("mainArtistName");
    expect(res.body.song[0]).toHaveProperty("mainArtistId");
    expect(res.body.song[0]).toHaveProperty("featuringArtistNames");
    expect(res.body.song[0]).toHaveProperty("featuringArtistId");
    expect(res.body.song[0]).toHaveProperty("albumName");
    expect(res.body.song[0]).toHaveProperty("albumId");
    expect(res.body.song[0]).toHaveProperty("release_date");
    expect(res.body.song[0]).toHaveProperty("albumImg");
    expect(res.body.song[0]).toHaveProperty("createdAt");
  });

  it("should update a song", async () => {
    const updateSongData = {
      songName: "Updated Test Song",
      // we can update other features of the song
    };

    const res = await request(app)
      .put(`/songs/${testSongId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateSongData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.song.songName).toEqual("Updated Test Song");
  });

  it("should delete a song", async () => {
    const res = await request(app)
      .delete(`/songs/${testSongId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
  });

  it("should not update a song if not logged in", async () => {
    const res = await request(app).put(`/songs/${testSongId}`).send({
      songName: "Updated Test Song",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("There are problems with token.");
    expect(res.body.success).toEqual(false);
  });

  it("should not delete a song if not logged in", async () => {
    const res = await request(app).delete(`/songs/${testSongId}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("There are problems with token.");
    expect(res.body.success).toEqual(false);
  });

  it("should not get a single song if not logged in", async () => {
    const res = await request(app).get(`/songs/${testSongId}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("There are problems with token.");
    expect(res.body.success).toEqual(false);
  });

  it("should not get all songs if not logged in", async () => {
    const res = await request(app).get("/songs");

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("There are problems with token.");
    expect(res.body.success).toEqual(false);
  });

  it("should delete a song", async () => {
    const res = await request(app)
      .delete(`/songs/${testSongId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.message).toEqual("Song is deleted.");
  });

  it("should add search from Spotify", async () => {
    const songName = "Black Skinhead";
    const res = await request(app)
      .get(`/search-from-spotify?songName=${songName}`)
      .set("Authorization", `Bearer ${authToken}`);

    spotifySongData = res.body.songsArray[0];
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toEqual(true);
    expect(res.body.songsArray[0]).toHaveProperty("songName");
    expect(res.body.songsArray[0]).toHaveProperty("mainArtistName");
    expect(res.body.songsArray[0]).toHaveProperty("featuringArtistNames");
    expect(res.body.songsArray[0]).toHaveProperty("albumName");
    expect(res.body.songsArray[0]).toHaveProperty("albumImg");
    expect(res.body.songsArray[0]).toHaveProperty("popularity");
    expect(res.body.songsArray[0]).toHaveProperty("duration_ms");
    expect(res.body.songsArray[0]).toHaveProperty("release_date");
    expect(res.body.songsArray[0]).toHaveProperty("artistId");
  });

  it("should add song to database that comes from Spotify API", async () => {
    const res = await request(app)
      .post("/add-song-from-spotify")
      .set("Authorization", `Bearer ${authToken}`)
      .send(spotifySongData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toEqual(true);
    expect(res.body).toHaveProperty("song");
    expect(res.body.song).toHaveProperty("userId");
    expect(res.body.song).toHaveProperty("songName");
    expect(res.body.song).toHaveProperty("mainArtistName");
    expect(res.body.song).toHaveProperty("mainArtistId");
    expect(res.body.song).toHaveProperty("featuringArtistNames");
    expect(res.body.song).toHaveProperty("featuringArtistId");
    expect(res.body.song).toHaveProperty("albumName");
    expect(res.body.song).toHaveProperty("albumId");
    expect(res.body.song).toHaveProperty("albumImg");
    expect(res.body.song).toHaveProperty("popularity");
    expect(res.body.song).toHaveProperty("duration_ms");
    expect(res.body.song).toHaveProperty("release_date");
    expect(res.body.song).toHaveProperty("createdAt");
    expect(res.body.song).toHaveProperty("_id");

    await Song.deleteOne({ _id: res.body.song._id });
  });
});
