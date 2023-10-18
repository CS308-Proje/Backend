const express = require("express");
const request = require("request");
// BQAxPH3A8ztKaJH7pL2lUWdVDMHkaLg1_-y37RFNNBRv-VNeEWVJFUITbLyWkZkUy-QnyUM5A6O4XbGb4CEdLvPJysLOm9H7SVRedzDkZ7F_Su0j9Gs

var client_id = "d91f433da46d4b6ebdcc2a4a8b5e7c83";
var client_secret = "1b6800dcd1c7461bb270d227e0d2bb15";
/*
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

request.post(authOptions, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    var token = body.access_token;
    console.log(token);
  }
});
*/

var authOptions = {
  url: "https://api.spotify.com/v1/users/beminustun3",
  headers: {
    Authorization:
      "Bearer BQAxPH3A8ztKaJH7pL2lUWdVDMHkaLg1_-y37RFNNBRv-VNeEWVJFUITbLyWkZkUy-QnyUM5A6O4XbGb4CEdLvPJysLOm9H7SVRedzDkZ7F_Su0j9Gs",
  },
  json: true,
};
/*
request.get(authOptions, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    var artist = body;
    console.log(artist);
  }
});
