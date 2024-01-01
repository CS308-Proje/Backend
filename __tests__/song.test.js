require('dotenv').config({ path: './config/config.env' });
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const songController = require("../controllers/song");
const authenticationController = require('../controllers/authentication');
const app = express();

app.use(express.json());
app.post('/login', authenticationController.login);
app.post('/songs', songController.addSong);
app.put('/songs/:id', songController.updateSong);
app.delete('/songs/:id', songController.deleteSong);

describe('Song API', () => {
  let token;
  const testSongId = '65736c8e235b0f66a1c41d55'; // id of the song we want to test

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Log in to get a token
    const loginRes = await request(app).post('/login').send({
      email: 'testuser1703245264054@example.com',
      password: 'password123',
    });

    expect(loginRes.statusCode).toEqual(200);
    token = loginRes.body.token;
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
      .post('/songs')
      .set('Authorization', `Bearer ${token}`)
      .send(songData);

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
      .set('Authorization', `Bearer ${token}`)
      .send(updateSongData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.song.songName).toEqual('Updated Test Song');
  });

  it('should delete a song', async () => {
    const res = await request(app)
      .delete(`/songs/${testSongId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
  });
});
