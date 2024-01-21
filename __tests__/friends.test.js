require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const friendController = require("../controllers/friends");
const User = require('../models/User');
const { protect } = require("../middlewares/isAuth");
const authenticationController = require("../controllers/authentication");
const app = express();

app.use(express.json());
app.post("/login", authenticationController.login);
app.post("/add", protect, friendController.addFriend);
app.delete("/remove/:id", protect, friendController.removeFriend);
app.get("/all", protect, friendController.getAllFriends);
app.post("/allowfriend/:id", protect, friendController.allowFriendRecommendations);
app.post("/disallowfriend/:id", protect, friendController.disallowFriendRecommendations);


describe('Friends API', () => {
    let authToken;
    let userId;
    let friendId; 
  
    beforeAll(async () => {
        // Connect to your test database
        await mongoose.connect(process.env.MONGO_URI, {
          
        });
    
        // Log in with a test user
        const loginRes = await request(app)
          .post("/login")
          .send({
            email: "testemir@gmail.com", 
            password: "testemir", 
          });
    
        expect(loginRes.statusCode).toEqual(200);
        authToken = loginRes.body.token; 

        const testemir2 = await User.findOne({ email: "testemir2@gmail.com" }); 
        const testemir = await User.findOne({ email: "testemir@gmail.com" });

        if (!testemir2) {

        throw new Error('Test setup error: testemir2 not found in database.');
        }

        friendId = testemir2._id;
        userId = testemir._id;

        //console.log("UserId:", userId);
        //console.log("FriendId:", friendId);

      });
    

    afterAll(async () => {
      
      await mongoose.connection.close();
    });
  

    it('should get all friends', async () => {
        const res = await request(app)
          .get('/all')
          .set('Authorization', `Bearer ${authToken}`);
    
        expect(res.statusCode).toEqual(200);
        
      });
  
    
  
    it('should disallow friend recommendations', async () => {
      const res = await request(app)
        .post(`/disallowfriend/${friendId}`)
        .set('Authorization', `Bearer ${authToken}`);
  
      expect(res.statusCode).toEqual(200);
      
    });

    it('should allow friend recommendations', async () => {
      const res = await request(app)
        .post(`/allowfriend/${friendId}`)
        .set('Authorization', `Bearer ${authToken}`);
  
      expect(res.statusCode).toEqual(200);
      
    });

});