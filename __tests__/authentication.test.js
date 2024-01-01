require('dotenv').config({ path: './config/config.env' }); 
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const nodemailerMock = require('nodemailer-mock'); 
const { register, login, logout, forgotPassword, /*resetPassword*/ } = require('../controllers/authentication');
const app = express();
app.use(express.json());

// Mock nodemailer to prevent sending actual emails
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      text: `Reset token: mock-reset-token`, // Include a mock reset token
    }),
  }),
}));
// routes for testing
app.post('/register', register);
app.post('/login', login);
app.post('/logout', logout);
app.post('/forgotpassword', forgotPassword);
//app.put('/resetpassword/:resetToken', resetPassword);

describe('Authentication API', () => {
    let resetToken;  // Token captured from the forgot password test
  beforeAll(async () => {
    // Connect to MongoDB database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Disconnect and clean up the test database
    await mongoose.connection.close();
  });
  const randomEmail = `testuser${Date.now()}@example.com`; // Unique email for multiple tests
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        name: 'aeren',
        username: 'eren',
        email: randomEmail,
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    // Additional assertions...
  });

  it('should login a user', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: randomEmail,
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');

  });

  it('should log out a user', async () => {
    // First, log in to get a token
    const loginRes = await request(app)
      .post('/login')
      .send({
        email: randomEmail,
        password: 'password123',
      });

    expect(loginRes.statusCode).toEqual(200);
    expect(loginRes.body).toHaveProperty('token');

    // Then, use the token to log out
    const logoutRes = await request(app)
      .post('/logout')
      .set('Cookie', `token=${loginRes.body.token}`);

    expect(logoutRes.statusCode).toEqual(200);
    // Check if the 'token' cookie was set to 'none' or similar
    expect(logoutRes.headers['set-cookie'][0]).toMatch(/token=none/);

  });

  it('should send a forgot password email', async () => {
    const res = await request(app)
      .post('/forgotpassword')
      .send({ email: randomEmail });
  
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data', 'Email sent');
  
    // Check what emails have been "sent"
    const sentEmails = nodemailerMock.mock.getSentMail();
    
  
    const resetEmail = sentEmails.find(email => email.to === randomEmail);
    resetToken = extractTokenFromEmail(resetEmail); 
  });

/*it('should reset the password using the token', async () => {
    const newPassword = 'newPassword123';
    const res = await request(app)
      .put(`/resetpassword/${resetToken}`) // Use the extracted mock token
      .send({ password: newPassword });
  
    expect(res.statusCode).toEqual(200);
    
  });
  
*/

});

function extractTokenFromEmail(resetEmail) {
    if (!resetEmail || !resetEmail.text) {
      console.error("No reset email or text content found in the mock email.");
      return null;
    }
    return resetEmail.text.split('Reset token: ')[1];
  }