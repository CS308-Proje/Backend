require('dotenv').config({ path: './config/config.env' });
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const userController = require('../controllers/user'); 
const {protect, authorize} = require('../middlewares/isAuth');
const { login } = require('../controllers/authentication');

const app = express();
app.use(express.json());

// Define your user routes
app.post('/login', login);
app.post('/users', protect, authorize("admin") ,userController.addUser);
app.delete('/users/:id', protect , authorize("admin") ,userController.deleteUser);

describe('User API', () => {
  let authToken;
  let userIdtoDelete;
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      //useUnifiedTopology: true,
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

  it('should add a new user', async () => {
    const newUser = {
      name: 'Test User',
      username: 'testuser',
      email: `testuser${Date.now()}@example.com`,
      password: 'password123',
    };

    userIdtoDelete = newUser._id;

    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newUser);


      

      userIdtoDelete = res.body.user._id;

    expect(res.statusCode).toEqual(201); 
    expect(res.body).toHaveProperty('user');

  });

  it('should delete a user', async () => {

    const res = await request(app)
      .delete(`/users/${userIdtoDelete}`)
      .set('Authorization', `Bearer ${authToken}`)
      

    expect(res.statusCode).toEqual(200); 

  });
});
