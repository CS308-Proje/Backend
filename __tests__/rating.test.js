require('dotenv').config({ path: './config/config.env' });
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { login } = require('../controllers/authentication');
const {rateSong, rateAlbum, rateArtist} = require('../controllers/rating');
const {protect} = require('../middlewares/isAuth');
const jwt = require('jsonwebtoken');




const app = express();
app.use(express.json());
app.post('/login', login);


app.post('/rateSong/:songId', protect,rateSong);
app.post('/rateAlbum/:albumId', protect,rateAlbum);
app.post('/rateArtist/:artistId', protect,rateArtist);



describe('Rating API - Song', () => {
  let existingUserId = '657351376053b2d654f4a849'; // Existing user ID
  let existingSongId = '6592934c87912c5c4ac20d0d'; // Existing song ID
  let existingAlbumId = '6592932087912c5c4ac20cff'; // Existing album ID
  let existingArtistId = '6592932087912c5c4ac20d02'; // Existing artist ID
  let authToken;


  

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    
    
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

  

    const res = await request(app)
      .post(`/rateSong/${existingSongId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ratingValue: 3
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Song Rated!');
  });

  it('should successfully rate an album', async () => {
   
    const res = await request(app)
      .post(`/rateAlbum/${existingAlbumId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ratingValue: 4
      
    });
    
  
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Album Rated!');
  });

  it('should successfully rate an artist', async () => {
    

    const res = await request(app)
      .post(`/rateArtist/${existingArtistId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ratingValue: 5});

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Artist Rated!');
  });

});
