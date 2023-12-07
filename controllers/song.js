const mongoose = require("mongoose");
const express = require("express");
const Song = require("../models/Song");
const User = require("../models/User");
const Album = require("../models/Album");
const Artist = require("../models/Artist");
const { getSpotifyAccessToken } = require("../config/spotifyAPI");
const SpotifyWebApi = require("spotify-web-api-node");
const multer = require("multer");
const fs = require("fs");
const mongodb = require("mongodb");

const {
  isAlbumExits,
  isSongExists,
  isArtistExists,
  isFeaturingArtistExist,
  isSongInDB,
} = require("../validation/validate-song");
const { default: axios } = require("axios");

exports.getSongs = async (req, res, next) => {
  //* Buraya pagination eklenecek
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;

    const name = req.query.name;
    if (name) {
      const songs = await Song.find({
        userId: userId,
        songName: { $regex: name, $options: "i" },
      });
      if (!songs || songs.length === 0) {
        return res.status(400).json({
          message: "No songs is found.",
          success: false,
        });
      }
      return res.status(200).json({
        songs,
        count: songs.length,
        success: true,
      });
    }

    const songs = await Song.find({ userId: userId });

    if (!songs || songs.length === 0) {
      return res.status(400).json({
        message: "Songs cannot be found.",
        success: false,
      });
    }

    return res.status(200).json({
      songs,
      count: songs.length,
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.getSong = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;
    const song = await Song.find({ _id: req.params.id, userId: userId });

    if (!song) {
      return res.status(400).json({
        success: false,
        error: "No song is found.",
      });
    }
    res.status(200).json({
      success: true,
      song,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.addSong = async (req, res, next) => {
  try {
    const token = await getSpotifyAccessToken();
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      accessToken: token,
    });

    const user = await User.findById(req.user.id);

    const userId = user._id;

    const songData = { userId, ...req.body };

    if ((await isSongInDB(songData)) === true) {
      return res.status(400).json({
        message: "Song is already in the database!",
        success: false,
      });
    }

    const albumName = req.body.albumName;

    let album = null;
    let artist = null;

    if ((await isAlbumExits(songData)) === false) {
      album = await Album.create({
        userId: userId,
        name: albumName,
      });
    } else {
      album = await Album.findOne({
        userId: userId,
        name: albumName,
      });
    }

    if ((await isArtistExists(songData)) === false) {
      artist = await Artist.create({
        userId: userId,
        artistName: req.body.mainArtistName,
      });
    } else {
      artist = await Artist.findOne({
        userId: userId,
        artistName: req.body.mainArtistName,
      });
    }

    album.artistId = artist._id;

    //? IMPORTANT
    let artistImg = "";
    const spotifyAPIdata = await spotifyApi.searchTracks(
      `track:${songData.songName} artist:${songData.mainArtistName} album:${songData.albumName}`,
      { limit: 1 }
    );

    if (spotifyAPIdata.body.tracks.items.length > 0) {
      //* For artist image
      const artistId = spotifyAPIdata.body.tracks.items[0].artists[0].id;
      // Use the artistId as needed
      const artistData = await spotifyApi.getArtist(artistId);

      artistImg = artistData.body.images[1].url;

      artist.artistImg = artistImg;

      //* Artist image part is over
      songData.popularity = spotifyAPIdata.body.tracks.items[0].popularity;
      songData.release_date =
        spotifyAPIdata.body.tracks.items[0].album.release_date;

      songData.duration_ms = spotifyAPIdata.body.tracks.items[0].duration_ms;
      songData.albumImg =
        spotifyAPIdata.body.tracks.items[0].album.images[1].url;
    } else {
      artist.artistImg =
        "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg";
      songData.popularity = undefined;
      songData.release_date = undefined;
      songData.duration_ms = undefined;
      songData.albumImg =
        "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg";
    }
    album.release_date = songData.release_date;
    album.albumImg = songData.albumImg;
    await artist.save();
    await album.save();

    songData.albumId = album._id;
    songData.mainArtistId = artist._id;
    songData.featuringArtistId = [];
    for (let index = 0; index < req.body.featuringArtistNames.length; index++) {
      const featuringArtistName = req.body.featuringArtistNames[index];
      let featuringArtist;
      if (
        (await isFeaturingArtistExist(featuringArtistName, userId)) === false
      ) {
        featuringArtist = await Artist.create({
          userId: userId,
          artistName: featuringArtistName,
        });

        const featuringArtistImg = await spotifyApi.searchArtists(
          `${featuringArtistName}`,
          { limit: 1 }
        );

        if (featuringArtistImg) {
          featuringArtist.artistImg =
            featuringArtistImg.body.artists.items[0].images[1].url;
        } else {
          featuringArtist.artistImg =
            "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg";
        }
        await featuringArtist.save();
      } else {
        featuringArtist = await Artist.findOne({
          userId: userId,
          artistName: featuringArtistName,
        });
      }

      songData.featuringArtistId.push(featuringArtist._id);
    }
    const song = await Song.create({
      userId: songData.userId,
      songName: songData.songName,
      mainArtistName: songData.mainArtistName,
      mainArtistId: songData.mainArtistId,
      featuringArtistNames: songData.featuringArtistNames,
      featuringArtistId: songData.featuringArtistId,
      albumName: songData.albumName,
      albumId: songData.albumId,
      popularity: songData.popularity,
      release_date: songData.release_date,
      duration_ms: songData.duration_ms,
      albumImg: songData.albumImg,
    });

    return res.status(201).json({
      song,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.deleteSong = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;
    const song = await Song.findByIdAndDelete({
      _id: req.params.id,
      userId: userId,
    });

    res.status(200).json({
      message: "Song is deleted.",
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.updateSong = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;
    const song = await Song.findByIdAndUpdate(
      { _id: req.params.id, userId: userId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!song) {
      return res.status(400).json({
        success: false,
        error: "No song is found.",
      });
    }

    res.status(200).json({
      success: true,
      song,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

const saveSongsToDatabase = async (fileBuffer, userId) => {
  try {
    const token = await getSpotifyAccessToken();
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      accessToken: token,
    });

    const songsArray = JSON.parse(fileBuffer);

    for (let index = 0; index < songsArray.length; index++) {
      const songData = {
        userId: userId,
        ...songsArray[index],
      };

      if ((await isSongInDB(songData)) === true) {
        continue;
      }
      const albumName = songsArray[index].albumName;
      let album = null;
      let artist = null;

      if ((await isAlbumExits(songData)) === false) {
        album = await Album.create({
          userId: userId,
          name: albumName,
        });
      } else {
        album = await Album.findOne({
          userId: userId,
          name: albumName,
        });
      }

      if ((await isArtistExists(songData)) === false) {
        artist = await Artist.create({
          userId: userId,
          artistName: songData.mainArtistName,
        });
      } else {
        artist = await Artist.findOne({
          userId: userId,
          artistName: songData.mainArtistName,
        });
      }

      album.artistId = artist._id;

      let artistImg = "";
      const spotifyAPIdata = await spotifyApi.searchTracks(
        `artist:${songData.mainArtistName} track:${songData.songName} album:${songData.albumName}`,
        { limit: 1 }
      );

      if (spotifyAPIdata.body.tracks.items.length > 0) {
        //* For artist image

        const artistId = spotifyAPIdata.body.tracks.items[0].artists[0].id;

        const artistData = await spotifyApi.getArtist(artistId);

        artistImg = artistData.body.images[1].url;

        artist.artistImg = artistImg;

        songData.popularity = spotifyAPIdata.body.tracks.items[0].popularity;
        songData.release_date =
          spotifyAPIdata.body.tracks.items[0].album.release_date;
        songData.duration_ms = spotifyAPIdata.body.tracks.items[0].duration_ms;
        songData.albumImg =
          spotifyAPIdata.body.tracks.items[0].album.images[1].url;
      } else {
        artist.artistImg =
          "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg";
        songData.popularity = undefined;
        songData.release_date = undefined;
        songData.duration_ms = undefined;
        songData.albumImg =
          "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg";
      }

      album.albumImg = songData.albumImg;

      await artist.save();
      await album.save();
      /*
      await spotifyApi
        .searchTracks(
          `artist:${songData.mainArtistName} track:${songData.songName} album:${songData.albumName}`,
          { limit: 1 }
        )
        .then(
          function (data) {
            console.log(data.body.tracks);
            songData.popularity = data.body.tracks.items[0].popularity;
            songData.release_date =
              data.body.tracks.items[0].album.release_date;
            songData.duration_ms = data.body.tracks.items[0].duration_ms;
            songData.albumImg = data.body.tracks.items[0].album.images[1].url;
          },
          function (err) {
            console.log("Something went wrong!", err);
          }
        );
        */
      //? IMPORTANT
      songData.albumId = album._id;
      songData.mainArtistId = artist._id;
      songData.featuringArtistId = [];
      for (
        let index = 0;
        index < songData.featuringArtistNames.length;
        index++
      ) {
        const featuringArtistName = songData.featuringArtistNames[index];
        let featuringArtist;
        if (
          (await isFeaturingArtistExist(featuringArtistName, userId)) === false
        ) {
          featuringArtist = await Artist.create({
            userId: userId,
            artistName: featuringArtistName,
          });

          const featuringArtistImg = await spotifyApi.searchArtists(
            `${featuringArtistName}`,
            { limit: 1 }
          );

          if (featuringArtistImg) {
            featuringArtist.artistImg =
              featuringArtistImg.body.artists.items[0].images[1].url;
          } else {
            featuringArtist.artistImg =
              "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg";
          }
          await featuringArtist.save();
        } else {
          featuringArtist = await Artist.findOne({
            userId: userId,
            artistName: featuringArtistName,
          });
        }

        songData.featuringArtistId.push(featuringArtist._id);
      }
      const song = await Song.create({
        userId: songData.userId,
        songName: songData.songName,
        mainArtistName: songData.mainArtistName,
        mainArtistId: songData.mainArtistId,
        featuringArtistNames: songData.featuringArtistNames,
        featuringArtistId: songData.featuringArtistId,
        albumName: songData.albumName,
        albumId: songData.albumId,
        popularity: songData.popularity,
        release_date: songData.release_date,
        duration_ms: songData.duration_ms,
        albumImg: songData.albumImg,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.addSongViaFile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;
    const fileBuffer = req.file.buffer.toString("utf-8");
    await saveSongsToDatabase(fileBuffer, userId);
    res.status(201).json({
      message: "Songs are added to the database.",
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};

exports.transferSongs = async (req, res, next) => {
  try {
    const token = await getSpotifyAccessToken();
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      accessToken: token,
    });
    const user = await User.findById(req.user.id);
    const userId = user.id;
    const userClient = new mongodb.MongoClient(req.body.databaseURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await userClient.connect();

    const userDb = userClient.db(req.body.databaseName);
    const userCollection = userDb.collection(req.body.collectionName);

    const songsArray = await userCollection.find().toArray();

    for (let index = 0; index < songsArray.length; index++) {
      const songData = {
        userId: userId,
        ...songsArray[index],
      };

      if ((await isSongInDB(songData)) === true) {
        continue;
      }
      const albumName = songsArray[index].albumName;
      let album = null;
      let artist = null;

      if ((await isAlbumExits(songData)) === false) {
        album = await Album.create({
          userId: userId,
          name: albumName,
        });
      } else {
        album = await Album.findOne({
          userId: userId,
          name: albumName,
        });
      }

      if ((await isArtistExists(songData)) === false) {
        artist = await Artist.create({
          userId: userId,
          artistName: songData.mainArtistName,
        });
      } else {
        artist = await Artist.findOne({
          userId: userId,
          artistName: songData.mainArtistName,
        });
      }

      album.artistId = artist._id;

      /*
        //? IMPORTANT
        const encodedSearchTerm = encodeURIComponent(
          `artist:${songData.mainArtistName} track:${songData.songName}`
        );
  
        const response = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodedSearchTerm}&type=track%2Cartist&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        const track = response.data.tracks;
        console.log(track);
        */

      const spotifyAPIdata = await spotifyApi.searchTracks(
        `artist:${songData.mainArtistName} track:${songData.songName} album:${songData.albumName}`,
        { limit: 1 }
      );

      let artistImg = "";
      if (spotifyAPIdata.body.tracks.items.length > 0) {
        //* For artist image
        const artistId = spotifyAPIdata.body.tracks.items[0].artists[0].id;
        // Use the artistId as needed
        const artistData = await spotifyApi.getArtist(artistId);
        artistImg = artistData.body.images[1].url;
        artist.artistImg = artistImg;

        songData.popularity = spotifyAPIdata.body.tracks.items[0].popularity;
        songData.release_date =
          spotifyAPIdata.body.tracks.items[0].album.release_date;
        songData.duration_ms = spotifyAPIdata.body.tracks.items[0].duration_ms;
        songData.albumImg =
          spotifyAPIdata.body.tracks.items[0].album.images[1].url;
      } else {
        artist.artistImg =
          "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg";
        songData.popularity = undefined;
        songData.release_date = undefined;
        songData.duration_ms = undefined;
        songData.albumImg =
          "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg";
      }
      album.albumImg = songData.albumImg;
      await album.save();
      await artist.save();
      /*
      await spotifyApi
        .searchTracks(
          `artist:${songData.mainArtistName} track:${songData.songName} album:${songData.albumName}`,
          { limit: 1 }
        )
        .then(
          function (data) {
            //console.log(data.body.tracks);
            songData.popularity = data.body.tracks.items[0].popularity;
            songData.release_date =
              data.body.tracks.items[0].album.release_date;
            songData.duration_ms = data.body.tracks.items[0].duration_ms;
            songData.albumImg = data.body.tracks.items[0].album.images[1].url;
          },
          function (err) {
            console.log("Something went wrong!", err);
          }
        );
          */
      //? IMPORTANT
      songData.albumId = album._id;
      songData.mainArtistId = artist._id;
      songData.featuringArtistId = [];
      for (
        let index = 0;
        index < songData.featuringArtistNames.length;
        index++
      ) {
        const featuringArtistName = songData.featuringArtistNames[index];
        let featuringArtist;
        if (
          (await isFeaturingArtistExist(featuringArtistName, userId)) === false
        ) {
          featuringArtist = await Artist.create({
            userId: userId,
            artistName: featuringArtistName,
          });
          const featuringArtistImg = await spotifyApi.searchArtists(
            `${featuringArtistName}`,
            { limit: 1 }
          );

          if (featuringArtistImg) {
            featuringArtist.artistImg =
              featuringArtistImg.body.artists.items[0].images[1].url;
          } else {
            featuringArtist.artistImg =
              "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg";
          }
          await featuringArtist.save();
        } else {
          featuringArtist = await Artist.findOne({
            userId: userId,
            artistName: featuringArtistName,
          });
        }

        songData.featuringArtistId.push(featuringArtist._id);
      }
      const song = await Song.create({
        userId: songData.userId,
        songName: songData.songName,
        mainArtistName: songData.mainArtistName,
        mainArtistId: songData.mainArtistId,
        featuringArtistNames: songData.featuringArtistNames,
        featuringArtistId: songData.featuringArtistId,
        albumName: songData.albumName,
        albumId: songData.albumId,
        popularity: songData.popularity,
        release_date: songData.release_date,
        duration_ms: songData.duration_ms,
        albumImg: songData.albumImg,
      });
    }

    return res.status(201).json({
      message: "Musics are added.",
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.addFromSpotifyAPIDirectly = async (req, res, next) => {
  try {
    const token = await getSpotifyAccessToken();
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      accessToken: token,
    });

    const songName = req.query.songName;

    const spotifyAPIdata = await spotifyApi.searchTracks(`track:${songName}`, {
      limit: 10,
    });

    let songsArray = [];

    const array = spotifyAPIdata.body.tracks.items;

    for (let index = 0; index < array.length; index++) {
      const element = array[index];

      const songData = {
        songName: element.name,
        mainArtistName: element.artists[0].name,
        albumName: element.album.name,
        albumImg: element.album.images[1].url,
        featuringArtistNames: element.artists
          .slice(1)
          .map((artist) => artist.name),
        popularity: element.popularity,
        duration_ms: element.duration_ms,
        release_date: element.album.release_date,
        artistId: element.artists[0].id,
      };
      songsArray.push(songData);
    }

    return res.status(201).json({
      songsArray,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.addSongToDBThatComesFromSpotifyAPI = async (req, res, next) => {
  try {
    const token = await getSpotifyAccessToken();
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      accessToken: token,
    });
    const user = await User.findById(req.user.id);
    const userId = user.id;

    const songData = { userId, ...req.body };

    if ((await isSongInDB(songData)) === true) {
      return res.status(400).json({
        message: "Song is already in the database!",
        success: false,
      });
    }

    let album = null;
    let artist = null;

    if ((await isAlbumExits(songData)) === false) {
      album = await Album.create({
        userId: userId,
        name: songData.albumName,
      });
    } else {
      album = await Album.findOne({
        userId: userId,
        name: songData.albumName,
      });
    }

    if ((await isArtistExists(songData)) === false) {
      artist = await Artist.create({
        userId: userId,
        artistName: songData.mainArtistName,
      });
    } else {
      artist = await Artist.findOne({
        userId: userId,
        artistName: songData.mainArtistName,
      });
    }

    album.artistId = artist._id;

    //? IMPORTANT
    let artistImg = "";

    //* For artist image
    const artistId = songData.artistId;
    // Use the artistId as needed
    const artistData = await spotifyApi.getArtist(artistId);

    artistImg = artistData.body.images[1].url;

    artist.artistImg = artistImg;

    //* Artist image part is over

    album.release_date = songData.release_date;
    album.albumImg = songData.albumImg;
    await artist.save();
    await album.save();

    songData.albumId = album._id;
    songData.mainArtistId = artist._id;
    songData.featuringArtistId = [];
    for (let index = 0; index < songData.featuringArtistNames.length; index++) {
      const featuringArtistName = songData.featuringArtistNames[index];
      let featuringArtist;
      if (
        (await isFeaturingArtistExist(featuringArtistName, userId)) === false
      ) {
        featuringArtist = await Artist.create({
          userId: userId,
          artistName: featuringArtistName,
        });

        const featuringArtistImg = await spotifyApi.searchArtists(
          `${featuringArtistName}`,
          { limit: 1 }
        );

        if (featuringArtistImg) {
          featuringArtist.artistImg =
            featuringArtistImg.body.artists.items[0].images[1].url;
        } else {
          featuringArtist.artistImg =
            "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty-300x240.jpg";
        }
        await featuringArtist.save();
      } else {
        featuringArtist = await Artist.findOne({
          userId: userId,
          artistName: featuringArtistName,
        });
      }

      songData.featuringArtistId.push(featuringArtist._id);
    }
    const song = await Song.create({
      userId: songData.userId,
      songName: songData.songName,
      mainArtistName: songData.mainArtistName,
      mainArtistId: songData.mainArtistId,
      featuringArtistNames: songData.featuringArtistNames,
      featuringArtistId: songData.featuringArtistId,
      albumName: songData.albumName,
      albumId: songData.albumId,
      popularity: songData.popularity,
      release_date: songData.release_date,
      duration_ms: songData.duration_ms,
      albumImg: songData.albumImg,
    });

    return res.status(201).json({
      song,
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message,
      success: false,
    });
  }
};
