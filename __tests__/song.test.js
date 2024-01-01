require('dotenv').config({ path: './config/config.env' });
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const songController = require("../controllers/song");
const {protect} = require('../middlewares/isAuth');
const authenticationController = require('../controllers/authentication');
const app = express();

app.use(express.json());
app.post('/login', authenticationController.login);
app.post('/add-song-not-from-spotify', protect ,songController.addSongThatIsNotFromSpotifyAPI);
app.put('/songs/:id', protect ,songController.updateSong);
app.delete('/songs/:id', protect ,songController.deleteSong);

describe('Song API', () => {
  let testSongId; // id of the song we want to test
  let authToken;
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Log in to get a token
    const loginRes = await request(app).post('/login').send({
      email: 'testuser1702056245215@example.com',
      password: 'password123',
    });

    expect(loginRes.statusCode).toEqual(200);
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should add a song', async () => {
    const songData = {
      songName: 'Test Song',
      mainArtistName: 'Test Artist',
      albumName: 'Test Album',
      featuringArtistNames: [],
    };

    const res = await request(app)
      .post('/add-song-not-from-spotify')
      .set('Authorization', `Bearer ${authToken}`)
      .send(songData);

    testSongId = res.body.song._id;

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('song');
  });

  it('should update a song', async () => {
    const updateSongData = {
      songName: 'Updated Test Song',
      // we can update other features of the song
    };

    const res = await request(app)
      .put(`/songs/${testSongId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateSongData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.song.songName).toEqual('Updated Test Song');
  });

  it('should delete a song', async () => {
    const res = await request(app)
      .delete(`/songs/${testSongId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
  });
});
