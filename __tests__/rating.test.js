require('dotenv').config({ path: './config/config.env' });
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');



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

});
