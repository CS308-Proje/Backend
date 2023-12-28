require('dotenv').config({ path: './config/config.env' });
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const userController = require('../controllers/user'); 

const app = express();
app.use(express.json());

// Define your user routes
app.post('/users', userController.addUser);
app.delete('/users/:id', userController.deleteUser);

describe('User API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
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

    const res = await request(app)
      .post('/users')
      .send(newUser);

    expect(res.statusCode).toEqual(201); 
    expect(res.body).toHaveProperty('user');

  });

  it('should delete a user', async () => {
    // Create a user to delete
    const user = await User.create({
      name: 'User To Delete',
      username: 'usertodelete',
      email: 'deleteuser@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .delete(`/users/${user._id}`)
      .send();

    expect(res.statusCode).toEqual(200); 

  });
});
