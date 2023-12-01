const mongoose = require("mongoose");
const express = require("express");
const Song = require("../models/Song");
const User = require("../models/User");
const Album = require("../models/Album");
const Artist = require("../models/Artist");
const Rating = require("../models/Rating");
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
            item => item.mainArtistName === song.mainArtistName
          )
        ) {
          continue;
        }

        let songItems = {};
        const artistName = song.mainArtistName;
        const spotifyAPIdata = await spotifyApi.searchTracks(
          `artist:${artistName}`,
          { limit: 2 }
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
                  .map(artist => artist.name) || [],

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

        const oneSong = await Song.findOne({
          albumId: album.id,
          userId: userId,
        });
        if (recommendedSongs.some(item => item.mainArtistName === album.name)) {
          continue;
        }

        let songItems = {};
        const albumName = album.name;

        const spotifyAPIdata = await spotifyApi.searchTracks(
          `album:${albumName} artist:${artist.artistName}`,
          { limit: 2 }
        );

        if (spotifyAPIdata.body.tracks.items.length > 0) {
          for (let i = 0; i < spotifyAPIdata.body.tracks.items.length; i++) {
            if (oneSong.songName === spotifyAPIdata.body.tracks.items[i].name) {
              continue;
            }
            songItems = {
              songName: spotifyAPIdata.body.tracks.items[i].name,
              mainArtistName:
                spotifyAPIdata.body.tracks.items[i].artists[0].name,
              featuringArtistNames:
                spotifyAPIdata.body.tracks.items[i].artists
                  .slice(1)
                  .map(artist => artist.name) || [],

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
            item => item.mainArtistName === artist.artistName
          )
        ) {
          continue;
        }

        const oneSong = await Song.findOne({
          artistId: artist.id,
          userId: userId,
        });

        let songItems = {};

        const spotifyAPIdata = await spotifyApi.searchTracks(
          `artist:${artist.artistName}`,
          { limit: 2 }
        );

        if (spotifyAPIdata.body.tracks.items.length > 0) {
          for (let i = 0; i < spotifyAPIdata.body.tracks.items.length; i++) {
            songItems = {
              songName: spotifyAPIdata.body.tracks.items[i].name,
              mainArtistName:
                spotifyAPIdata.body.tracks.items[i].artists[0].name,
              featuringArtistNames:
                spotifyAPIdata.body.tracks.items[i].artists
                  .slice(1)
                  .map(artist => artist.name) || [],

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

      if (recommendedSongs.some(item => item.songName === song.songName)) {
        continue;
      }

      const spotifyAPIdata = await spotifyApi.searchTracks(
        `track:${song.songName} album:${song.albumName} artist:${song.mainArtistName}`,
        { limit: 1 }
      );

      const artistId = spotifyAPIdata.body.tracks.items[0].artists[0].id;
      const songId = spotifyAPIdata.body.tracks.items[0].id;

      songIds.push(songId);
      artistIds.push(artistId);

      if (songIds.length === 2) {
        const spotifyRecommandedSongs = await spotifyApi.getRecommendations({
          seed_artists: [artistIds],
          seed_tracks: [songIds],
          limit: 5,
        });

        for (
          let index = 0;
          index < spotifyRecommandedSongs.body.tracks.length;
          index++
        ) {
          if (spotifyRecommandedSongs.body.tracks.length > 0) {
            songData = {
              songName: spotifyRecommandedSongs.body.tracks[index].name,
              mainArtistName:
                spotifyRecommandedSongs.body.tracks[index].artists[0].name,
              featuringArtistNames:
                spotifyRecommandedSongs.body.tracks[index].artists
                  .slice(1)
                  .map(artist => artist.name) || [],

              albumName: spotifyRecommandedSongs.body.tracks[index].album.name,
              albumImg:
                spotifyRecommandedSongs.body.tracks[index].album.images[0].url,
              popularity: spotifyRecommandedSongs.body.tracks[index].popularity,
              release_date:
                spotifyRecommandedSongs.body.tracks[index].album.release_date,
              duration_ms:
                spotifyRecommandedSongs.body.tracks[index].duration_ms,
            };

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
        limit: 2,
      });

      for (
        let index = 0;
        index < spotifyRecommandedSongs.body.tracks.length;
        index++
      ) {
        if (spotifyRecommandedSongs.body.tracks.length > 0) {
          songData = {
            songName: spotifyRecommandedSongs.body.tracks[index].name,
            mainArtistName:
              spotifyRecommandedSongs.body.tracks[index].artists[0].name,
            featuringArtistNames:
              spotifyRecommandedSongs.body.tracks[index].artists
                .slice(1)
                .map(artist => artist.name) || [],

            albumName: spotifyRecommandedSongs.body.tracks[index].album.name,
            albumImg:
              spotifyRecommandedSongs.body.tracks[index].album.images[0].url,
            popularity: spotifyRecommandedSongs.body.tracks[index].popularity,
            release_date:
              spotifyRecommandedSongs.body.tracks[index].album.release_date,
            duration_ms: spotifyRecommandedSongs.body.tracks[index].duration_ms,
          };

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

exports.getRecommendationsBasedOnTemporalValues = async (req, res, next) => {};



exports.getRecommendationsBasedOnFriendActivity = async (req, res, next, limitResponse = false) => {
  try {
      const user = await User.findById(req.user.id);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 1);

      const maxPerCategory = 5;
      const maxPerFriend = Math.ceil(maxPerCategory / user.friends.length);

      let recommendedSongs = [];
      let recommendedAlbums = [];
      let recommendedArtists = [];

      
      const user_songs = await Song.find({ userId: user.id });
      const user_albums = await Album.find({ userId: user.id });
      const user_artists = await Artist.find({ userId: user.id });

      const userSongsIds = new Set(user_songs.map(song => song._id.toString()));
      const userAlbumsIds = new Set(user_albums.map(album => album._id.toString()));
      const userArtistsIds = new Set(user_artists.map(artist => artist._id.toString()));

      for (const friend of user.friends) {
          const friendUser = await User.findById(friend);
          const friendId = friendUser.id;

          if (friendUser.allowFriendRecommendations === true) {
              const friendRatings = await Rating.find({
                  userId: friendId,
                  createdAt: { $gte: threeDaysAgo },
                  ratingValue: { $gte: 4 }
              }).limit(maxPerFriend * 3); 

              let friendSongsIds = new Set();
              let friendAlbumsIds = new Set();
              let friendArtistsIds = new Set();

              for (let rating of friendRatings) {
                  if (rating.songId && !userSongsIds.has(rating.songId.toString()) && friendSongsIds.size < maxPerFriend) {
                      friendSongsIds.add(rating.songId);
                  }
                  if (rating.albumId && !userAlbumsIds.has(rating.albumId.toString()) && friendAlbumsIds.size < maxPerFriend) {
                      friendAlbumsIds.add(rating.albumId);
                  }
                  if (rating.artistId && !userArtistsIds.has(rating.artistId.toString()) && friendArtistsIds.size < maxPerFriend) {
                      friendArtistsIds.add(rating.artistId);
                  }
              }

              const songs = await Song.find({ _id: { $in: Array.from(friendSongsIds) } });
              const albums = await Album.find({ _id: { $in: Array.from(friendAlbumsIds) } });
              const artists = await Artist.find({ _id: { $in: Array.from(friendArtistsIds) } });

              songs.forEach(song => recommendedSongs.push({ song, recommendedBy: friendId }));
              albums.forEach(album => recommendedAlbums.push({ album, recommendedBy: friendId }));
              artists.forEach(artist => recommendedArtists.push({ artist, recommendedBy: friendId }));
          }
      }

      recommendedSongs = recommendedSongs.slice(0, maxPerCategory);
      recommendedAlbums = recommendedAlbums.slice(0, maxPerCategory);
      recommendedArtists = recommendedArtists.slice(0, maxPerCategory);

      const length = recommendedSongs.length + recommendedAlbums.length + recommendedArtists.length;
    
      
      if(limitResponse) {
          if(length === 0) {
              return res.status(200).json({
                  message: 'No new friend activity.',
              });
          } else {
              return res.status(200).json({
                  message: `You have ${length} new recommendations based on friend activities.`,
              });
          }
      } else {
          if(length === 0) {
              return res.status(200).json({
                  message: 'No new friend activity.',
              });
          }
          return res.status(200).json({
              songs: recommendedSongs,
              albums: recommendedAlbums,
              artists: recommendedArtists,
              success: true,
              message: `You have ${length} new recommendations based on friend activities.`,
          });
      }
  } catch (err) { 
      return res.status(400).json({
          message: err,
          success: false,
      });
  }
}

