const request = require("request-promise");
// BQAxPH3A8ztKaJH7pL2lUWdVDMHkaLg1_-y37RFNNBRv-VNeEWVJFUITbLyWkZkUy-QnyUM5A6O4XbGb4CEdLvPJysLOm9H7SVRedzDkZ7F_Su0j9Gs

const dotenv = require("dotenv").config({ path: "./config.env" });
const client_id = "8ed5bfd11e874bfe8077c3ea6ee4b3e4";
const client_secret = "07572e28d7e34de9967e3aeabf39dd9b";

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
