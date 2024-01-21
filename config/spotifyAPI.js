const request = require("request-promise");
// BQAxPH3A8ztKaJH7pL2lUWdVDMHkaLg1_-y37RFNNBRv-VNeEWVJFUITbLyWkZkUy-QnyUM5A6O4XbGb4CEdLvPJysLOm9H7SVRedzDkZ7F_Su0j9Gs

const dotenv = require("dotenv").config({ path: "./config.env" });
const client_id = "d70d599bc82a44f6a165a9b4516f85de";
const client_secret = "ee0cda9e6c4249d1aa400d2a147567a8";

var authOptions = {
  url: "https://accounts.spotify.com/api/token",
  headers: {
    Authorization:
      "Basic " +
      new Buffer.from(client_id + ":" + client_secret).toString("base64"),
  },
  form: {
    grant_type: "client_credentials",
  },
  json: true,
};

const getSpotifyAccessToken = async () => {
  try {
    const body = await request.post(authOptions);
    var token = body.access_token;
    return token;
  } catch (error) {
    console.error("Error getting Spotify access token:", error);
    //throw error;
  }
};
module.exports = { getSpotifyAccessToken };
