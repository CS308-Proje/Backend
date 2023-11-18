const mongoose = require("mongoose");
const express = require("express");
const Song = require("../models/Song");
const User = require("../models/User");
const Album = require("../models/Album");
const Artist = require("../models/Artist");
const { getSpotifyAccessToken } = require("../config/spotifyAPI");
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

    let recommendedSongs = [];

    if (highRatedSongs.length > 0) {
      for (let index = 0; index < highRatedSongs.length; index++) {
        const song = highRatedSongs[index];

        if (
          recommendedSongs.some(
            (item) => item.mainArtistName === song.mainArtistName
          )
        ) {
          continue;
        }

        let songItems = {};
        const artistName = song.mainArtistName;
        let featuringArtists = [];

        const spotifyAPIdata = await spotifyApi.searchTracks(
          `artist:${artistName}`,
          { limit: 5 }
        );

        if (spotifyAPIdata.body.tracks.items.length > 0) {
          for (let i = 0; i < spotifyAPIdata.body.tracks.items.length; i++) {
            //console.log(data.body.tracks.items[i].name);
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

    let recommendedSongs = [];

    if (highRatedAlbums.length > 0) {
      for (let index = 0; index < highRatedAlbums.length; index++) {
        const album = highRatedAlbums[index];

        const artist = await Artist.findOne({
          _id: album.artistId,
          userId: userId,
        });

        if (
          recommendedSongs.some((item) => item.mainArtistName === album.name)
        ) {
          continue;
        }

        let songItems = {};
        const albumName = album.name;
        let featuringArtists = [];

        const spotifyAPIdata = await spotifyApi.searchTracks(
          `album:${albumName} artist:${artist.artistName}`,
          { limit: 5 }
        );

        if (spotifyAPIdata.body.tracks.items.length > 0) {
          for (let i = 0; i < spotifyAPIdata.body.tracks.items.length; i++) {
            //console.log(data.body.tracks.items[i].name);
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

    let recommendedSongs = [];

    if (highRatedArtists.length > 0) {
      for (let index = 0; index < highRatedArtists.length; index++) {
        const artist = highRatedArtists[index];

        if (
          recommendedSongs.some(
            (item) => item.mainArtistName === artist.artistName
          )
        ) {
          continue;
        }

        let songItems = {};

        const spotifyAPIdata = await spotifyApi.searchTracks(
          `artist:${artist.artistName}`,
          { limit: 5 }
        );

        if (spotifyAPIdata.body.tracks.items.length > 0) {
          for (let i = 0; i < spotifyAPIdata.body.tracks.items.length; i++) {
            //console.log(data.body.tracks.items[i].name);
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
