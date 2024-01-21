require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const { protect } = require("../middlewares/isAuth");
const authenticationController = require("../controllers/authentication");
const app = express();
const { dataExport } = require("../controllers/export");

app.use(express.json());
app.post("/login", authenticationController.login);
app.get("/export", protect, dataExport);

describe("Export Data API", () => {
  let authToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Log in to get a token
    const loginRes = await request(app).post("/login").send({
      email: "eustun@gmail.com",
      password: "123456789",
    });
    expect(loginRes.statusCode).toEqual(200);
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should return 400 when user is not logged in", async () => {
    const res = await request(app).get("/export");

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(false);
  });

  it("should return 400 when no rated data found", async () => {
    const loginRes = await request(app).post("/login").send({
      email: "dummy@example.com",
      password: "dummy1",
    });
    expect(loginRes.statusCode).toEqual(200);
    authToken = loginRes.body.token;

    const res = await request(app)
      .get("/export")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("success");

    expect(res.body.error).toEqual("No rated data found.");
    expect(res.body.success).toBe(false);
  });

  it("should return 200 when a user is logged in and have rated songs", async () => {
    const loginRes = await request(app).post("/login").send({
      email: "eustun@gmail.com",
      password: "123456789",
    });
    expect(loginRes.statusCode).toEqual(200);
    authToken = loginRes.body.token;

    const res = await request(app)
      .get("/export")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.headers["content-disposition"]).toBe(
      "attachment; filename=exportedData.json"
    );
  });

  it("should return 400 when a user is logged in but the artist is not found", async () => {
    const res = await request(app)
      .get("/export")
      .query({ artist: "dummy" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("success");

    expect(res.body.error).toEqual("No rated data found.");
    expect(res.body.success).toBe(false);
  });
});
