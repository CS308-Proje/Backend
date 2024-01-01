const mongoose = require("mongoose");
const express = require("express");
const Song = require("../models/Song");
const User = require("../models/User");
const Album = require("../models/Album");
const Artist = require("../models/Artist");
const { isSongInDB } = require("../validation/validate-song");
const Rating = require("../models/Rating");
const { getSpotifyAccessToken } = require("../config/spotifyAPI");
const { spawn } = require("child_process");
const fs = require("fs");

const SpotifyWebApi = require("spotify-web-api-node");

exports.getRecommendationsBasedOnSongRating = async (req, res, next) => {
  try {
    const token = await getSpotifyAccessToken();
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      accessToken: token,
    });

    const user = await User.findById(req.user.id);

    const userId = user.id;
    const highRatedSongs = await Song.find({
      userId: userId,
      ratingValue: { $gte: 4 },
    });

    if (!highRatedSongs || highRatedSongs.length === 0) {
      return res.status(200).json({
        message:
          "No songs is rated high enouth to get recommendation. You need to rate at least one song using a rating value greater or equal to 4.",
      });
    }

    let recommendedSongs = [];

    if (highRatedSongs.length > 0) {
      for (let index = 0; index < highRatedSongs.length; index++) {
        const song = highRatedSongs[index];

        let songItems = {};
        const artistName = song.mainArtistName;
        const spotifyAPIdata = await spotifyApi.searchTracks(
          `artist:${artistName}`,
          { limit: 2 }
        );

        if (spotifyAPIdata.body.tracks.items.length > 0) {
          for (let i = 0; i < spotifyAPIdata.body.tracks.items.length; i++) {
            songItems = {
              userId: userId,
              songName: spotifyAPIdata.body.tracks.items[i].name,
              mainArtistName:
                spotifyAPIdata.body.tracks.items[i].artists[0].name,
              featuringArtistNames:
                spotifyAPIdata.body.tracks.items[i].artists
                  .slice(1)
                  .map((artist) => artist.name) || [],

              albumName: spotifyAPIdata.body.tracks.items[i].album.name,
              albumImg: spotifyAPIdata.body.tracks.items[i].album.images[0].url,
              popularity: spotifyAPIdata.body.tracks.items[i].popularity,
              release_date:
                spotifyAPIdata.body.tracks.items[i].album.release_date,
              duration_ms: spotifyAPIdata.body.tracks.items[i].duration_ms,
            };

            if ((await isSongInDB(songItems)) === true) {
              continue;
            }
            if (
              recommendedSongs.some(
                (item) => item.songName === songItems.songName
              )
            ) {
              continue;
            }
            recommendedSongs.push(songItems);
          }
        }
      }
    }

    return res.status(200).json({
      songs: recommendedSongs,
      success: true,
      length: recommendedSongs.length,
    });
  } catch (err) {
    return res.status(400).json({
      message: err,
      success: false,
    });
  }
};

exports.getRecommendationsBasedOnAlbumRating = async (req, res, next) => {
  try {
    const token = await getSpotifyAccessToken();
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      accessToken: token,
    });

    const user = await User.findById(req.user.id);

    const userId = user.id;
    const highRatedAlbums = await Album.find({
      userId: userId,
      ratingValue: { $gte: 4 },
    });

    if (!highRatedAlbums || highRatedAlbums.length === 0) {
      return res.status(200).json({
        message:
          "No albums is rated high enouth to get recommendation. You need to rate at least one album using a rating value greater or equal to 4.",
      });
    }

    let recommendedSongs = [];

    if (highRatedAlbums.length > 0) {
      for (let index = 0; index < highRatedAlbums.length; index++) {
        const album = highRatedAlbums[index];

        const artist = await Artist.findOne({
          _id: album.artistId,
          userId: userId,
        });

        let songItems = {};
        const albumName = album.name;

        const spotifyAPIdata = await spotifyApi.searchTracks(
          `album:${albumName} artist:${artist.artistName}`,
          { limit: 4 }
        );

        if (spotifyAPIdata.body.tracks.items.length > 0) {
          for (let i = 0; i < spotifyAPIdata.body.tracks.items.length; i++) {
            songItems = {
              userId: userId,
              songName: spotifyAPIdata.body.tracks.items[i].name,
              mainArtistName:
                spotifyAPIdata.body.tracks.items[i].artists[0].name,
              featuringArtistNames:
                spotifyAPIdata.body.tracks.items[i].artists
                  .slice(1)
                  .map((artist) => artist.name) || [],

              albumName: spotifyAPIdata.body.tracks.items[i].album.name,
              albumImg: spotifyAPIdata.body.tracks.items[i].album.images[0].url,
              popularity: spotifyAPIdata.body.tracks.items[i].popularity,
              release_date:
                spotifyAPIdata.body.tracks.items[i].album.release_date,
              duration_ms: spotifyAPIdata.body.tracks.items[i].duration_ms,
            };

            if ((await isSongInDB(songItems)) === true) {
              continue;
            }

            if (
              recommendedSongs.some(
                (item) => item.songName === songItems.songName
              )
            ) {
              continue;
            }
            recommendedSongs.push(songItems);
          }
        }
      }
    }

    return res.status(200).json({
      songs: recommendedSongs,
      success: true,
      length: recommendedSongs.length,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message,
      success: false,
    });
  }
};

exports.getRecommendationsBasedOnArtistRating = async (req, res, next) => {
  try {
    const token = await getSpotifyAccessToken();
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      accessToken: token,
    });

    const user = await User.findById(req.user.id);

    const userId = user.id;
    const highRatedArtists = await Artist.find({
      userId: userId,
      ratingValue: { $gte: 4 },
    });

    if (!highRatedArtists || highRatedArtists.length === 0) {
      return res.status(200).json({
        message:
          "No artists is rated high enouth to get recommendation. You need to rate at least one artist using a rating value greater or equal to 4.",
      });
    }

    let recommendedSongs = [];

    if (highRatedArtists.length > 0) {
      for (let index = 0; index < highRatedArtists.length; index++) {
        const artist = highRatedArtists[index];

        let songItems = {};

        const spotifyAPIdata = await spotifyApi.searchTracks(
          `artist:${artist.artistName}`,
          { limit: 4 }
        );

        if (spotifyAPIdata.body.tracks.items.length > 0) {
          for (let i = 0; i < spotifyAPIdata.body.tracks.items.length; i++) {
            songItems = {
              userId: userId,
              songName: spotifyAPIdata.body.tracks.items[i].name,
              mainArtistName:
                spotifyAPIdata.body.tracks.items[i].artists[0].name,
              featuringArtistNames:
                spotifyAPIdata.body.tracks.items[i].artists
                  .slice(1)
                  .map((artist) => artist.name) || [],

              albumName: spotifyAPIdata.body.tracks.items[i].album.name,
              albumImg: spotifyAPIdata.body.tracks.items[i].album.images[0].url,
              popularity: spotifyAPIdata.body.tracks.items[i].popularity,
              release_date:
                spotifyAPIdata.body.tracks.items[i].album.release_date,
              duration_ms: spotifyAPIdata.body.tracks.items[i].duration_ms,
            };

            if ((await isSongInDB(songItems)) === true) {
              continue;
            }

            if (
              recommendedSongs.some(
                (item) => item.songName === songItems.songName
              )
            ) {
              continue;
            }
            recommendedSongs.push(songItems);
          }
        }
      }
    }

    return res.status(200).json({
      songs: recommendedSongs,
      success: true,
      length: recommendedSongs.length,
    });
  } catch (err) {
    return res.status(400).json({
      message: err,
      success: false,
    });
  }
};

exports.getRecommendationsFromSpotify = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const userId = user.id;
    const token = await getSpotifyAccessToken();
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      accessToken: token,
    });

    const highRatedSongs = await Song.find({
      userId: userId,
      ratingValue: { $gte: 4 },
    });

    if (!highRatedSongs || highRatedSongs.length === 0) {
      return res.status(200).json({
        message:
          "No songs is rated high enouth to get recommendation from Spotify. To use Spotify Recommendation, you need to rate at least one song using a rating value greater or equal to 4.",
        success: true,
        length: 0,
      });
    }
    let songData = {};
    let recommendedSongs = [];
    let artistIds = [];
    let songIds = [];
    let artistIDARRAY = [];
    let songsIDARRAY = [];

    for (let index = 0; index < highRatedSongs.length; index++) {
      const song = highRatedSongs[index];

      if (recommendedSongs.some((item) => item.songName === song.songName)) {
        continue;
      }

      const spotifyAPIdata = await spotifyApi.searchTracks(
        `track:${song.songName} album:${song.albumName} artist:${song.mainArtistName}`,
        { limit: 3 }
      );

      let artistId;
      let songId;
      if (spotifyAPIdata.body.tracks.items.length === 0) {
        continue;
      } else {
        artistId = spotifyAPIdata.body.tracks.items[0].artists[0].id;
        songId = spotifyAPIdata.body.tracks.items[0].id;
      }

      songIds.push(songId);
      artistIds.push(artistId);

      if (songIds.length === 2) {
        const spotifyRecommandedSongs = await spotifyApi.getRecommendations({
          seed_artists: [artistIds],
          seed_tracks: [songIds],
          limit: 1,
        });

        for (
          let index = 0;
          index < spotifyRecommandedSongs.body.tracks.length;
          index++
        ) {
          if (spotifyRecommandedSongs.body.tracks.length > 0) {
            songData = {
              userId: userId,
              songName: spotifyRecommandedSongs.body.tracks[index].name,
              mainArtistName:
                spotifyRecommandedSongs.body.tracks[index].artists[0].name,
              featuringArtistNames:
                spotifyRecommandedSongs.body.tracks[index].artists
                  .slice(1)
                  .map((artist) => artist.name) || [],

              albumName: spotifyRecommandedSongs.body.tracks[index].album.name,
              albumImg:
                spotifyRecommandedSongs.body.tracks[index].album.images[0].url,
              popularity: spotifyRecommandedSongs.body.tracks[index].popularity,
              release_date:
                spotifyRecommandedSongs.body.tracks[index].album.release_date,
              duration_ms:
                spotifyRecommandedSongs.body.tracks[index].duration_ms,
            };

            if ((await isSongInDB(songData)) === true) {
              continue;
            }

            if (
              recommendedSongs.some(
                (item) => item.songName === songData.songName
              )
            ) {
              continue;
            }
            recommendedSongs.push(songData);
          }
        }
        songIds = [];
        artistIds = [];
      }
    }

    if (songIds.length === 1) {
      const spotifyRecommandedSongs = await spotifyApi.getRecommendations({
        seed_artists: [artistIds],
        seed_tracks: [songIds],
        limit: 1,
      });

      for (
        let index = 0;
        index < spotifyRecommandedSongs.body.tracks.length;
        index++
      ) {
        if (spotifyRecommandedSongs.body.tracks.length > 0) {
          songData = {
            userId: userId,
            songName: spotifyRecommandedSongs.body.tracks[index].name,
            mainArtistName:
              spotifyRecommandedSongs.body.tracks[index].artists[0].name,
            featuringArtistNames:
              spotifyRecommandedSongs.body.tracks[index].artists
                .slice(1)
                .map((artist) => artist.name) || [],

            albumName: spotifyRecommandedSongs.body.tracks[index].album.name,
            albumImg:
              spotifyRecommandedSongs.body.tracks[index].album.images[0].url,
            popularity: spotifyRecommandedSongs.body.tracks[index].popularity,
            release_date:
              spotifyRecommandedSongs.body.tracks[index].album.release_date,
            duration_ms: spotifyRecommandedSongs.body.tracks[index].duration_ms,
          };

          if ((await isSongInDB(songData)) === true) {
            continue;
          }

          if (
            recommendedSongs.some((item) => item.songName === songData.songName)
          ) {
            continue;
          }

          recommendedSongs.push(songData);
        }
      }
    }

    return res.status(200).json({
      songs: recommendedSongs,
      success: true,
      length: recommendedSongs.length,
    });
  } catch (err) {
    return res.status(400).json({
      message: err,
      success: false,
    });
  }
};

exports.getRecommendationsBasedOnTemporalValues = async (
  req,
  res,
  next,
  limitResponse = false
) => {
  try {
    const user = await User.findById(req.user.id);
    const userId = user.id;

    const token = await getSpotifyAccessToken();

    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      accessToken: token,
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const highRatedSongs = await Song.find({
      userId: userId,
      ratingValue: { $gte: 4 },
      createdAt: { $lte: thirtyDaysAgo },
    });

    if (!highRatedSongs || highRatedSongs.length === 0) {
      if (limitResponse) {
        message = "You do not have temporal recommendations yet.";
        return message;
      }

      return res.status(400).json({
        message: "You do not have temporal recommendations yet.",
        success: false,
      });
    }

    for (index = 0; index < highRatedSongs.length; ) {
      const songToCheckIfTheUserRatedThatArtistsSongLately = await Song.findOne(
        {
          mainArtistName: highRatedSongs[index].mainArtistName,
          userId: userId,
          createdAt: { $gte: thirtyDaysAgo },
        }
      );

      if (songToCheckIfTheUserRatedThatArtistsSongLately !== null) {
        highRatedSongs.splice(index, 1);
      } else {
        index++;
      }
    }

    let recommendedSongs = [];

    if (highRatedSongs.length > 0) {
      for (let index = 0; index < highRatedSongs.length; index++) {
        const song = highRatedSongs[index];

        let songItems = {};
        const artistName = song.mainArtistName;
        const spotifyAPIdata = await spotifyApi.searchTracks(
          `artist:${artistName}`,
          { limit: 5 }
        );

        if (spotifyAPIdata.body.tracks.items.length > 0) {
          for (let i = 0; i < spotifyAPIdata.body.tracks.items.length; i++) {
            if (song.songName === spotifyAPIdata.body.tracks.items[i].name) {
              continue;
            }
            songItems = {
              songName: spotifyAPIdata.body.tracks.items[i].name,
              mainArtistName:
                spotifyAPIdata.body.tracks.items[i].artists[0].name,
              featuringArtistNames:
                spotifyAPIdata.body.tracks.items[i].artists
                  .slice(1)
                  .map((artist) => artist.name) || [],

              albumName: spotifyAPIdata.body.tracks.items[i].album.name,
              albumImg: spotifyAPIdata.body.tracks.items[i].album.images[0].url,
              popularity: spotifyAPIdata.body.tracks.items[i].popularity,
              release_date:
                spotifyAPIdata.body.tracks.items[i].album.release_date,
              duration_ms: spotifyAPIdata.body.tracks.items[i].duration_ms,
            };
            if ((await isSongInDB(songItems)) === true) {
              continue;
            }

            if (
              recommendedSongs.some(
                (item) => item.songName === songItems.songName
              )
            ) {
              continue;
            }

            recommendedSongs.push(songItems);
          }
        }
      }
    }

    const randomIndex = Math.floor(Math.random() * recommendedSongs.length);
    let recommendedSong = recommendedSongs[randomIndex];
    while (
      (await Song.findOne({
        songName: recommendedSong.songName,
        userId: userId,
      })) !== null
    ) {
      const randomIndex = Math.floor(Math.random() * recommendedSongs.length);
      recommendedSong = recommendedSongs[randomIndex];
    }

    if (limitResponse) {
      message = "";

      if (recommendedSongs.length === 0) {
        message = "You do not have temporal recommendations yet.";
        return message;
      } else {
        message = `You have ${recommendedSongs.length} new recommendations based on temporal values.`;
        return message;
      }
    }

    return res.status(200).json({
      songs: recommendedSong,
      success: true,
      length: recommendedSongs.length,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message,
      success: false,
    });
  }
};

exports.getRecommendationsBasedOnFriendActivity = async (
  req,
  res,
  next,
  limitResponse = false
) => {
  try {
    const user = await User.findById(req.user.id).populate("friends");
    const userId = user.id;
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    let recommendedSongs = [];
    const maxNum = 10;

    const friends = user.allowFriendRecommendations;

    if (friends.length === 0) {
      return res.status(200).json({
        message: "You do not have any friends in this account.",
        success: true,
      });
    }

    for (let index = 0; index < friends.length; index++) {
      const friend = friends[index];
      const friendId = friend._id;

      const friendSongs = await Song.find({
        userId: friendId,
        createdAt: { $gte: threeDaysAgo },
        ratingValue: { $gte: 4 },
      });

      if (friendSongs.length === 0) {
        return res.status(200).json({
          message:
            "Your friends did not rate any music higher or equal to 4 or he does not have any song.",
          success: true,
        });
      }

      for (let index = 0; index < friendSongs.length; index++) {
        const friendSong = friendSongs[index];

        const friendSongWithoutId = {
          songName: friendSong.songName,
          mainArtistName: friendSong.mainArtistName,
          featuringArtistNames: friendSong.featuringArtistNames,
          albumName: friendSong.albumName,
          albumImg: friendSong.albumImg,
          popularity: friendSong.popularity,
          release_date: friendSong.release_date,
          duration_ms: friendSong.duration_ms,
        };

        if (
          recommendedSongs.some(
            (item) => item.songName === friendSong.songName
          ) ||
          (await isSongInDB(friendSongWithoutId)) === true
        ) {
          continue;
        }
        if (recommendedSongs.length >= maxNum) {
          break;
        }

        const friendWhoRecommendedSong = await User.findById(friendId);

        const songToRecommend = {
          recommendedBy: friendWhoRecommendedSong.username,
          recommendedSong: friendSong,
        };

        recommendedSongs.push(songToRecommend);
      }
    }

    const length = recommendedSongs.length;
    let message = "";

    if (limitResponse) {
      if (length === 0) {
        message = "No new friend activity.";
      } else {
        message = `You have ${length} new recommendations based on friend activities.`;
      }
      return message;
    } else {
      if (length === 0) {
        return res.status(200).json({
          message: "No new friend activity.",
        });
      }
      return res.status(200).json({
        songs: recommendedSongs,
        success: true,
        message: `You have ${length} new recommendations based on friend activities.`,
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: err.message,
      success: false,
    });
  }
};


exports.getRecommendationsBasedOnMachineLearning = async (req, res, next) => {
  try {
  const likedSongsDict = {
    "Linkin Park": "In the End",
    "Drake": "One Dance",
    "Lady Gaga": "Judas",
    "The Weeknd": "Starboy",
  };

  // Write the liked songs to a JSON file
  const filePath = "C:/Users/User/Desktop/USETHISBackend/Backend/machine-learning/input.json";
  fs.writeFileSync(filePath, JSON.stringify(likedSongsDict));

  const runPythonScript = () => {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn("python", ["../machine-learning/machine-learning.py"]);

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Python script exited with code ${code}`));
          return;
        }

        // Read the output CSV file
        const output = fs.readFileSync("output.csv", "utf8");
        resolve(output);
      });
    });
  };

  runPythonScript()
    .then((output) => {
      console.log("Recommended Songs:", output);

      return res.status(200).json({
        songs: output,
        success: true,
        length: output.length,
      });
    })
    .catch((error) => {
      return res.status(400).json({
        message: error.message,
        success: false,
      });
    });
    
  } catch (err) {
    return res.status(400).json({
      message: err.message,
      success: false,
    });
  }
};