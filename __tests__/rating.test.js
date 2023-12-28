require('dotenv').config({ path: './config/config.env' });
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');


const Album = require('../models/Album')
const Artist = require('../models/Artist')
const Rating = require('../models/Rating');
const Song = require('../models/Song');
const User = require('../models/User'); //for authentication

const app = express();
app.use(express.json());

const ratingRoutes = require('../routes/rating');
app.use('/api', ratingRoutes);

describe('Rating API - Song', () => {
  let existingUserId = '657351376053b2d654f4a849'; // Existing user ID
  let existingSongId = '65736c8f235b0f66a1c41d5e'; // Existing song ID
  let existingAlbumId = '65736c8c235b0f66a1c41d4e'; // Existing album ID
  let existingArtistId = '65736bcb40dc3d15ae6ace6e'; // Existing artist ID
  let authToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Login to obtain the auth token
    const loginRes = await request(app)
      .post('/login')
      .send({
        email: 'testuser1702056245215@example.com', //existing user form database
        password: 'password123', 
      });

    expect(loginRes.statusCode).toEqual(200);
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should successfully rate a song', async () => {
    const ratingData = {
      ratingValue: 3,
    };

    const res = await request(app)
      .post(`/api/rateSong/${existingSongId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(ratingData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Song Rated!');
  });

  it('should successfully rate an album', async () => {
    const ratingData = {
      ratingValue: 4,
    };

    const res = await request(app)
      .post(`/api/rateAlbum/${existingAlbumId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(ratingData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Album Rated!');
  });

  it('should successfully rate an artist', async () => {
    const ratingData = {
      ratingValue: 5,
    };

    const res = await request(app)
      .post(`/api/rateArtist/${existingArtistId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(ratingData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Artist Rated!');
  });

});
