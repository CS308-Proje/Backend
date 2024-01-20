require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const { protect, authorize } = require("../middlewares/isAuth");
const authenticationController = require("../controllers/authentication");
var {
  createAnalysisBasedOnSongs,
  analysisBasedOnArtistSongs,
  analysisBasedOnArtistsSongsCount,
  averageRatingForMonth,
} = require("../controllers/analysis");

var {
  getUserRegistrationInAMonth,
  getAddedSongInAMonth,
} = require("../controllers/user");
const app = express();

app.use(express.json());
app.post("/login", authenticationController.login);
app.get("/createAnalysisBasedOnSongs", protect, createAnalysisBasedOnSongs);
app.post("/analysisBasedOnArtistSongs", protect, analysisBasedOnArtistSongs);
app.post(
  "/analysisBasedOnArtistsSongsCount",
  protect,
  analysisBasedOnArtistsSongsCount
);
app.get("/averageRatingForMonth", protect, averageRatingForMonth);
app.get(
  "/admin-chart-user",
  protect,
  authorize("admin"),
  getUserRegistrationInAMonth
);

app.get("/admin-chart-song", protect, authorize("admin"), getAddedSongInAMonth);

describe("Analysis API", () => {
  let authToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const loginRes = await request(app).post("/login").send({
      email: "eustun@gmail.com",
      password: "123456789",
    });

    expect(loginRes.statusCode).toBe(200);
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should return 400 when createAnalysisBasedOnSongs is called without a type", async () => {
    const res = await request(app)
      .get("/createAnalysisBasedOnSongs")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(
      "Please enter a type. Type can be song, album or artist."
    );
  });

  it("should return 200 when createAnalysisBasedOnSongs is called with a type", async () => {
    createAnalysisBasedOnSongs = jest.fn().mockImplementationOnce(() => {
      return {
        success: true,
        base64Image: "base64Image",
        data: "data",
      };
    });

    const res = await request(app)
      .get("/createAnalysisBasedOnSongs")
      .query({ type: "song" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("base64Image");
    expect(res.body).toHaveProperty("data");
    expect(res.body.success).toBe(true);
  }, 15000);

  it("should return 400 when createAnalysisBasedOnSongs is called with a invalid date", async () => {
    const res = await request(app)
      .get("/createAnalysisBasedOnSongs")
      .query({ type: "artist", end: "2024-01-29" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("success");

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(
      "End date cannot be greater than today's date."
    );
  }, 15000);

  it("should return 400 when analysisBasedOnArtistSongs is called without an artist array", async () => {
    const res = await request(app)
      .post("/analysisBasedOnArtistSongs")
      .send({ artists: [] })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("success");

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Please enter an artist name or names.");
  });

  it("should return 400 when analysisBasedOnArtistSongs is called with an invalid date", async () => {
    const res = await request(app)
      .post(`/analysisBasedOnArtistSongs?end=2024-01-28`)
      .send({ artists: ["Travis Scott"] })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("success");

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(
      "End date cannot be greater than today's date."
    );
  });

  it("should return 200 when analysisBasedOnArtistSongs is called with an artist array", async () => {
    analysisBasedOnArtistSongs = jest.fn().mockImplementationOnce(() => {
      return {
        success: true,
        data: [],
      };
    });

    const res = await request(app)
      .post("/analysisBasedOnArtistSongs")
      .send({ artists: ["Travis Scott"] })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("data");

    expect(res.body.success).toBe(true);
  });

  it("should return 400 when analysisBasedOnArtistsSongsCount is called without an artist array", async () => {
    const res = await request(app)
      .post("/analysisBasedOnArtistsSongsCount")
      .send({ artists: [] })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("success");

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Please enter an artist name or names.");
  });

  it("should return 400 when analysisBasedOnArtistsSongsCount is called with an invalid date", async () => {
    const res = await request(app)
      .post(`/analysisBasedOnArtistsSongsCount?end=2024-01-28`)
      .send({ artists: ["Travis Scott"] })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("success");

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(
      "End date cannot be greater than today's date."
    );
  });

  it("should return 400 when analysisBasedOnArtistsSongsCount is called with a non existent artist", async () => {
    const res = await request(app)
      .post(`/analysisBasedOnArtistsSongsCount`)
      .send({ artists: ["Emin UStun"] })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("success");

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(`Artist named Emin UStun does not exist.`);
  });

  it("should return 200 when analysisBasedOnArtistsSongsCount is called with an artist array", async () => {
    analysisBasedOnArtistsSongsCount = jest.fn().mockImplementationOnce(() => {
      return {
        success: true,
        data: [],
      };
    });

    const res = await request(app)
      .post("/analysisBasedOnArtistsSongsCount")
      .send({ artists: ["Travis Scott", "Playboi Carti"] })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("data");

    expect(res.body.success).toBe(true);
  });

  it("should return 200 when averageRatingForMonth is called", async () => {
    const res = await request(app)
      .get("/averageRatingForMonth")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("data");

    expect(res.body.success).toBe(true);
  });

  it("should return 400 when user has not rated anything yet.", async () => {
    const lgn = await request(app).post("/login").send({
      email: "dummy@example.com",
      password: "dummy1",
    });

    authToken = lgn.body.token;

    const res = await request(app)
      .get("/averageRatingForMonth")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("success");

    expect(res.body.error).toBe(
      "No ratings found for the specified date range."
    );
    expect(res.body.success).toBe(false);
  });

  it("should return 400 when a user is not admin when we call admin-chart-user", async () => {
    const res = await request(app)
      .get("/admin-chart-user")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(403);
  });

  it("should return 400 when a user is not admin when we call admin-chart-song", async () => {
    const res = await request(app)
      .get("/admin-chart-song")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(403);
  });

  it("should return 200 when a user is admin when we call admin-chart-user", async () => {
    const loginRes = await request(app).post("/login").send({
      email: "eustun@gmail.com",
      password: "123456789",
    });

    authToken = loginRes.body.token;

    const res = await request(app)
      .get("/admin-chart-user")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("countsArray");

    expect(res.body.success).toBe(true);
    expect(res.body.countsArray).toHaveLength(32);
  });

  it("should return 200 when a user is admin when we call admin-chart-song", async () => {
    const res = await request(app)
      .get("/admin-chart-song")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("countsArray");

    expect(res.body.success).toBe(true);
    expect(res.body.countsArray).toHaveLength(32);
  });
});
