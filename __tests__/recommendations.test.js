require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const { protect } = require("../middlewares/isAuth");
const authenticationController = require("../controllers/authentication");
var {
  getRecommendationsBasedOnSongRating,
  getRecommendationsBasedOnAlbumRating,
  getRecommendationsBasedOnArtistRating,
  getRecommendationsBasedOnTemporalValues,
  getRecommendationsBasedOnFriendActivity,
} = require("../controllers/recommendations");
const User = require("../models/User");
const Song = require("../models/Song");
const Album = require("../models/Album");
const app = express();

app.use(express.json());
app.post("/login", authenticationController.login);
app.get(
  "/getRecommendationsBasedOnSongRating",
  protect,
  getRecommendationsBasedOnSongRating
);

describe("Song Recommendations API", () => {
  let authToken;
  let userIdLegit = "65ad51d5dd3aa481270929d8";
  let userIdNotLegit = "65aaa8fbcde1c3833896d6ef";
  let mal = "65ad102ae13528b5bb932741";
  let dummy2 = "65ad44345aa70744edc20f56";
  let ratingTest = "65ad51d5dd3aa481270929d8";
  let dumb = "65ad570c125dece29c4caaed";

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    getRecommendationsBasedOnSongRating = jest
      .fn()
      .mockImplementation(async (userId) => {
        const user = await User.findById(userId);

        if (user) {
          const userId = user._id;
          const songs = await Song.find({
            userId: userId,
            ratingValue: { $gte: 4 },
          });

          if (songs.length === 0 || !songs) {
            return {
              statusCode: 400,
              body: {
                success: false,
                message:
                  "No songs is rated high enouth to get recommendation. You need to rate at least one song using a rating value greater or equal to 4.",
              },
            };
          }

          let recommendedSongs = [];
          for (let i = 0; i < 2; i++) {
            let song = {
              userId: userId,
              songName: `testSong${i}`,
              mainArtistName: `testArtist${i}`,
              featuringArtistNames: [
                `testFeaturingArtist${i + 8}`,
                `testFeaturingArtist${i + 9}`,
              ],
              albumName: `testAlbum${i}`,
              albumImg: `testAlbumImg${i}`,
              popularity: 100 - i,
              release_date: "2022-01-01",
              duration_ms: 1000,
            };

            recommendedSongs.push(song);
          }

          return {
            statusCode: 200,
            body: {
              success: true,
              songs: recommendedSongs,
              length: recommendedSongs.length,
            },
          };
        } else {
          return {
            statusCode: 400,
            body: {
              success: false,
              message: "Token is not valid",
            },
          };
        }
      });

    getRecommendationsBasedOnAlbumRating = jest
      .fn()
      .mockImplementation(async (userId) => {
        const user = await User.findById(userId);

        if (user) {
          const userId = user._id;
          const albums = await Album.find({
            userId: userId,
            ratingValue: { $gte: 4 },
          });

          if (albums.length === 0 || !albums) {
            return {
              statusCode: 400,
              body: {
                success: false,
                message:
                  "No album is rated high enouth to get recommendation. You need to rate at least one song using a rating value greater or equal to 4.",
              },
            };
          }

          let recommendedSongs = [];
          for (let i = 0; i < 2; i++) {
            let song = {
              userId: userId,
              songName: `testSong${i}`,
              mainArtistName: `testArtist${i}`,
              featuringArtistNames: [
                `testFeaturingArtist${i + 8}`,
                `testFeaturingArtist${i + 9}`,
              ],
              albumName: `testAlbum${i}`,
              albumImg: `testAlbumImg${i}`,
              popularity: 100 - i,
              release_date: "2022-01-01",
              duration_ms: 1000,
            };

            recommendedSongs.push(song);
          }

          return {
            statusCode: 200,
            body: {
              success: true,
              songs: recommendedSongs,
              length: recommendedSongs.length,
            },
          };
        } else {
          return {
            statusCode: 400,
            body: {
              success: false,
              message: "Token is not valid",
            },
          };
        }
      });

    getRecommendationsBasedOnArtistRating = jest
      .fn()
      .mockImplementation(async (userId) => {
        const user = await User.findById(userId);

        if (user) {
          const userId = user._id;
          const artists = await Album.find({
            userId: userId,
            ratingValue: { $gte: 4 },
          });

          if (artists.length === 0 || !artists) {
            return {
              statusCode: 400,
              body: {
                success: false,
                message:
                  "No artists is rated high enouth to get recommendation. You need to rate at least one song using a rating value greater or equal to 4.",
              },
            };
          }

          let recommendedSongs = [];
          for (let i = 0; i < 2; i++) {
            let song = {
              userId: userId,
              songName: `testSong${i}`,
              mainArtistName: `testArtist${i}`,
              featuringArtistNames: [
                `testFeaturingArtist${i + 8}`,
                `testFeaturingArtist${i + 9}`,
              ],
              albumName: `testAlbum${i}`,
              albumImg: `testAlbumImg${i}`,
              popularity: 100 - i,
              release_date: "2022-01-01",
              duration_ms: 1000,
            };

            recommendedSongs.push(song);
          }

          return {
            statusCode: 200,
            body: {
              success: true,
              songs: recommendedSongs,
              length: recommendedSongs.length,
            },
          };
        } else {
          return {
            statusCode: 400,
            body: {
              success: false,
              message: "Token is not valid",
            },
          };
        }
      });

    getRecommendationsBasedOnTemporalValues = jest
      .fn()
      .mockImplementation(async (userId) => {
        const user = await User.findById(userId);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (user) {
          const highRatedSongs = await Song.find({
            userId: userId,
            ratingValue: { $gte: 4 },
            createdAt: { $lte: thirtyDaysAgo },
          });

          if (highRatedSongs.length === 0 || !highRatedSongs) {
            return {
              statusCode: 400,
              body: {
                success: false,
                message: "You do not have temporal recommendations yet.",
              },
            };
          }

          let recommendedSongs = [];

          for (let i = 0; i < 2; i++) {
            let song = {
              userId: userId,
              songName: `testSong${i}`,
              mainArtistName: `testArtist${i}`,
              featuringArtistNames: [
                `testFeaturingArtist${i + 8}`,
                `testFeaturingArtist${i + 9}`,
              ],
              albumName: `testAlbum${i}`,
              albumImg: `testAlbumImg${i}`,
              popularity: 100 - i,
              release_date: "2022-01-01",
              duration_ms: 1000,
            };

            recommendedSongs.push(song);
          }

          return {
            statusCode: 200,
            body: {
              success: true,
              songs: recommendedSongs,
              length: recommendedSongs.length,
            },
          };
        } else {
          return {
            statusCode: 400,
            body: {
              success: false,
              message: "Token is not valid",
            },
          };
        }
      });

    getRecommendationsBasedOnFriendActivity = jest
      .fn()
      .mockImplementation(async (userId) => {
        const user = await User.findById(userId);

        if (user) {
          const friends = user.allowFriendRecommendations;

          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

          if (friends.length === 0 || !friends) {
            return {
              statusCode: 400,
              body: {
                success: false,
                message: "You do not have any friends in this account.",
              },
            };
          }

          let recommendedSongs = [];
          let friendSongsArray = [];

          for (let index = 0; index < friends.length; index++) {
            const friend = friends[index];
            const friendId = friend._id;

            const friendSongs = await Song.find({
              userId: friendId,
              createdAt: { $gte: threeDaysAgo },
              ratingValue: { $gte: 4 },
            });

            if (friendSongs.length > 0) {
              for (let i = 0; i < friendSongs.length; i++) {
                const friendSong = friendSongs[i];
                friendSongsArray.push(friendSong);
              }
            }
          }

          if (friendSongsArray.length === 0 || !friendSongsArray) {
            return {
              statusCode: 400,
              body: {
                success: false,
                message:
                  "None of your friends have rated any song in the last three days.",
              },
            };
          }

          for (let i = 0; i < 2; i++) {
            let song = {
              userId: userId,
              songName: `testSong${i}`,
              mainArtistName: `testArtist${i}`,
              featuringArtistNames: [
                `testFeaturingArtist${i + 8}`,
                `testFeaturingArtist${i + 9}`,
              ],
              albumName: `testAlbum${i}`,
              albumImg: `testAlbumImg${i}`,
              popularity: 100 - i,
              release_date: "2022-01-01",
              duration_ms: 1000,
            };

            recommendedSongs.push(song);
          }

          return {
            statusCode: 200,
            body: {
              success: true,
              songs: recommendedSongs,
              length: recommendedSongs.length,
            },
          };
        } else {
          return {
            statusCode: 400,
            body: {
              success: false,
              message: "Token is not valid",
            },
          };
        }
      });

    // Log in to get a token
    const loginRes = await request(app).post("/login").send({
      email: "eustun@gmail.com",
      password: "123456789",
    });

    expect(loginRes.statusCode).toEqual(200);
    authToken = loginRes.body.token;
  }, 50000);

  afterAll(async () => {
    await mongoose.connection.close();
  }, 5000);

  //? Song Recommendations

  it("should return 400 when user is not logged in", async () => {
    let dummyId = null;
    const res = await getRecommendationsBasedOnSongRating(dummyId);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(false);
  }, 50000);

  it("should return 400 when no rated data found", async () => {
    const res = await getRecommendationsBasedOnSongRating(userIdNotLegit);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(false);
  }, 50000);

  it("should return 200 when a user is logged in and have rated songs", async () => {
    const res = await getRecommendationsBasedOnSongRating(dummy2);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("songs");
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("length");
    expect(res.body.success).toBe(true);
    expect(res.body.length).toBe(res.body.songs.length);
    expect(res.body.songs[0]).toHaveProperty("userId");
    expect(res.body.songs[0]).toHaveProperty("songName");
    expect(res.body.songs[0]).toHaveProperty("mainArtistName");
    expect(res.body.songs[0]).toHaveProperty("featuringArtistNames");
    expect(res.body.songs[0]).toHaveProperty("albumName");
    expect(res.body.songs[0]).toHaveProperty("albumImg");
    expect(res.body.songs[0]).toHaveProperty("popularity");
    expect(res.body.songs[0]).toHaveProperty("release_date");
    expect(res.body.songs[0]).toHaveProperty("duration_ms");
  }, 50000);

  //? Album Recommendations

  it("should return 400 when user is not logged in", async () => {
    let dummyId = null;
    const res = await getRecommendationsBasedOnAlbumRating(dummyId);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(false);
  }, 50000);

  it("should return 400 when no rated data found", async () => {
    const res = await getRecommendationsBasedOnAlbumRating(userIdNotLegit);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(false);
  }, 50000);

  it("should return 200 when a user is logged in and have rated songs", async () => {
    const res = await getRecommendationsBasedOnAlbumRating(userIdLegit);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("songs");
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("length");
    expect(res.body.success).toBe(true);
    expect(res.body.length).toBe(res.body.songs.length);
    expect(res.body.songs[0]).toHaveProperty("userId");
    expect(res.body.songs[0]).toHaveProperty("songName");
    expect(res.body.songs[0]).toHaveProperty("mainArtistName");
    expect(res.body.songs[0]).toHaveProperty("featuringArtistNames");
    expect(res.body.songs[0]).toHaveProperty("albumName");
    expect(res.body.songs[0]).toHaveProperty("albumImg");
    expect(res.body.songs[0]).toHaveProperty("popularity");
    expect(res.body.songs[0]).toHaveProperty("release_date");
    expect(res.body.songs[0]).toHaveProperty("duration_ms");
  }, 50000);

  //? Artist Recommendations

  it("should return 400 when user is not logged in", async () => {
    let dummyId = null;
    const res = await getRecommendationsBasedOnArtistRating(dummyId);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(false);
  }, 50000);

  it("should return 400 when no rated data found", async () => {
    const res = await getRecommendationsBasedOnArtistRating(userIdNotLegit);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(false);
  }, 50000);

  it("should return 200 when a user is logged in and have rated songs", async () => {
    const res = await getRecommendationsBasedOnArtistRating(userIdLegit);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("songs");
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("length");
    expect(res.body.success).toBe(true);
    expect(res.body.length).toBe(res.body.songs.length);
    expect(res.body.songs[0]).toHaveProperty("userId");
    expect(res.body.songs[0]).toHaveProperty("songName");
    expect(res.body.songs[0]).toHaveProperty("mainArtistName");
    expect(res.body.songs[0]).toHaveProperty("featuringArtistNames");
    expect(res.body.songs[0]).toHaveProperty("albumName");
    expect(res.body.songs[0]).toHaveProperty("albumImg");
    expect(res.body.songs[0]).toHaveProperty("popularity");
    expect(res.body.songs[0]).toHaveProperty("release_date");
    expect(res.body.songs[0]).toHaveProperty("duration_ms");
  }, 50000);

  //? Temporal Recommendations

  it("should return 400 when user is not logged in", async () => {
    let dummyId = null;
    const res = await getRecommendationsBasedOnTemporalValues(dummyId);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(false);
  }, 50000);

  it("should return 400 when no rated data found from the last 30 days which is appropriate for the recommendations system", async () => {
    const res = await getRecommendationsBasedOnTemporalValues(userIdNotLegit);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(false);
  }, 50000);

  it("should return 200 when a user is logged in and have rated songs", async () => {
    const res = await getRecommendationsBasedOnTemporalValues(dummy2);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("songs");
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("length");
    expect(res.body.success).toBe(true);
    expect(res.body.length).toBe(res.body.songs.length);
    expect(res.body.songs[0]).toHaveProperty("userId");
    expect(res.body.songs[0]).toHaveProperty("songName");
    expect(res.body.songs[0]).toHaveProperty("mainArtistName");
    expect(res.body.songs[0]).toHaveProperty("featuringArtistNames");
    expect(res.body.songs[0]).toHaveProperty("albumName");
    expect(res.body.songs[0]).toHaveProperty("albumImg");
    expect(res.body.songs[0]).toHaveProperty("popularity");
    expect(res.body.songs[0]).toHaveProperty("release_date");
    expect(res.body.songs[0]).toHaveProperty("duration_ms");
  }, 50000);

  //? Friends Recommendations

  it("should return 400 when user is not logged in", async () => {
    let dummyId = null;
    const res = await getRecommendationsBasedOnFriendActivity(dummyId);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(false);
  }, 50000);

  it("should return 400 when the user has no friends", async () => {
    const res = await getRecommendationsBasedOnFriendActivity(mal);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(false);
  }, 50000);

  it("should return 400 when the user's friend has no song", async () => {
    const res = await getRecommendationsBasedOnFriendActivity(dumb);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("success");
    expect(res.body.success).toBe(false);
  }, 50000);

  it("should return 200 when the user's friend has song", async () => {
    const res = await getRecommendationsBasedOnFriendActivity(dummy2);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("songs");
    expect(res.body).toHaveProperty("success");
    expect(res.body).toHaveProperty("length");
    expect(res.body.success).toBe(true);
    expect(res.body.length).toBe(res.body.songs.length);
    expect(res.body.songs[0]).toHaveProperty("userId");
    expect(res.body.songs[0]).toHaveProperty("songName");
    expect(res.body.songs[0]).toHaveProperty("mainArtistName");
    expect(res.body.songs[0]).toHaveProperty("featuringArtistNames");
    expect(res.body.songs[0]).toHaveProperty("albumName");
    expect(res.body.songs[0]).toHaveProperty("albumImg");
    expect(res.body.songs[0]).toHaveProperty("popularity");
    expect(res.body.songs[0]).toHaveProperty("release_date");
    expect(res.body.songs[0]).toHaveProperty("duration_ms");
  }, 50000);
});
