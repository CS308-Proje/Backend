const Album = require("../models/Album");
const Artist = require("../models/Artist");
const Song = require("../models/Song");

const isAlbumExits = async songData => {
  const albumName = songData.albumName;

  const album = await Album.findOne({
    userId: songData.userId,
    name: albumName,
  });
  if (!album) {
    return false;
  }
  return true;
};

const isSongExists = async songData => {
  const songName = songData.name;

  const song = await Song.findOne({
    userId: songData.userId,
    name: songName,
  });
  if (!song) {
    return false;
  }
  return true;
};

const isArtistExists = async songData => {
  const artistName = songData.mainArtistName;

  const artist = await Artist.findOne({
    userId: songData.userId,
    artistName: artistName,
  });
  if (!artist) {
    return false;
  }
  return true;
};

const isFeaturingArtistExist = async (name, id) => {
  const artistName = name;
  const userId = id;

  const artist = await Artist.findOne({
    userId: userId,
    artistName: artistName,
  });
  if (!artist) {
    return false;
  }
  return true;
};

const isSongInDB = async songData => {
  const song = await Song.findOne({
    userId: songData.userId,
    songName: songData.songName,
    mainArtistName: songData.mainArtistName,
    albumName: songData.albumName,
  });

  if (!song) {
    return false;
  }

  return true;
};

module.exports = {
  isAlbumExits,
  isSongExists,
  isArtistExists,
  isFeaturingArtistExist,
  isSongInDB,
};
