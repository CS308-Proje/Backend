require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const invitationController = require("../controllers/invitation");
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const { protect } = require("../middlewares/isAuth");
const authenticationController = require("../controllers/authentication");
const e = require("express");
const app = express();

app.use(express.json());
app.post("/login", authenticationController.login);
app.post("/createInvitation/:id", protect, invitationController.createInvitation);
app.delete("/delete/:invitationId", protect, invitationController.deleteInvitation);
app.post("/update/:invitationId", protect, invitationController.updateStatus);
app.get("/getallinv", protect, invitationController.getAllInvitations);



describe('Invitations API', () => {
    let authToken;
    let userId;
    let friendId; 
    let invitation;
  
    beforeAll(async () => {
        // Connect to your test database
        await mongoose.connect(process.env.MONGO_URI, {
          
        });
        // Create a new users only for invitation testing
        const newUser1 = new User({
            name: "test_invitation",
            username: "test_invitation",
            email: "test_invitation@example.com",
            password: "test_invitation", 
        });
    
        await newUser1.save();
        userId = newUser1._id;

        const newUser2 = new User({
            name: "test_invitation2",
            username: "test_invitation2",
            email: "test_invitation2@example.com",
            password: "test_invitation2", 
        });
    
        await newUser2.save();
        friendId = newUser2._id;

        //console.log("Test users created");
        //console.log("Test users id: ", userId, friendId);


        // Log in with a test user
        const loginRes = await request(app)
        .post("/login")
        .send({
          email: "test_invitation@example.com", 
          password: "test_invitation", 
        });

        authToken = loginRes.body.token;
        //console.log("Auth token: ", authToken);

         

    });

    afterAll(async () => {
        // Delete the test_invitation users
        await User.deleteOne({ _id: userId });
        await User.deleteOne({ _id: friendId });
    
        // Close the mongoose connection
        await mongoose.connection.close();
    });


    it('should create an invitation', async () => {
        const res = await request(app)
          .post(`/createInvitation/${friendId}`)
          .set("Authorization", "Bearer " + authToken)
        
        expect(res.statusCode).toEqual(201);
    
        // Find the invitation in the database
        invitation = await Invitation.findOne({ target_user_id: friendId }); // Adjust query as needed
        expect(invitation).toBeDefined(); // Check if the invitation is found
        //console.log("Invitation: ", invitation._id);
    });

    
    it('should get all invitations', async () => {
        const res = await request(app)
          .get("/getallinv")
          .set("Authorization", "Bearer " + authToken)

          expect(res.statusCode).toEqual(200);
    });

    it('should delete an invitation', async () => {
        const res = await request(app)
            .delete(`/delete/${invitation._id}`)
            .set("Authorization", "Bearer " + authToken)
      
          expect(res.statusCode).toEqual(200);
      
          // Check if the invitation is deleted
          const deletedInvitation = await Invitation.findById(invitation._id);
          expect(deletedInvitation).toBeNull();
    });

    it('should create and update an invitation status to rejected', async () => {
        const createRes = await request(app)
            .post(`/createInvitation/${friendId}`)
            .set("Authorization", "Bearer " + authToken)
        expect(createRes.statusCode).toEqual(201); 
    
        // Step 2: Retrieve the created invitation from the database
        const createdInvitation = await Invitation.findOne({ target_user_id: friendId }); 
        expect(createdInvitation).toBeDefined();

        const updateRes = await request(app)
        .post(`/update/${createdInvitation._id}`)
        .set("Authorization", "Bearer " + authToken)
        .send({ status: "rejected" });
        expect(updateRes.statusCode).toEqual(200); // Assuming 200 is the success status code for update

    
    });



    it('should create and then update an invitation status to accepted', async () => {
        // Step 1: Create an invitation
        const createRes = await request(app)
            .post(`/createInvitation/${friendId}`)
            .set("Authorization", "Bearer " + authToken)
        expect(createRes.statusCode).toEqual(201); 
    
        // Step 2: Retrieve the created invitation from the database
        const createdInvitation = await Invitation.findOne({ target_user_id: friendId }); 
        expect(createdInvitation).toBeDefined();
    
        // Step 3: Update the invitation
        const updateRes = await request(app)
            .post(`/update/${createdInvitation._id}`)
            .set("Authorization", "Bearer " + authToken)
            .send({ status: "accepted" });

        expect(updateRes.statusCode).toEqual(200); 

        // Step 4: Check if firend added to user's friend list
        const updatedUser = await User.findById(userId);
        expect(updatedUser.friends).toContainEqual(friendId);
        //console.log("Updated user: ", updatedUser);
    

    });

});
    

          

            



