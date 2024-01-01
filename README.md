# Backend Part of the SRS - Song Recommendation System

## Done

- The data format that we are collecting is:
  - song name
  - main artist name
  - featuring artist names
  - album name
  - popularity
  - duration in milliseconds
  - release date
  - album image
  - created at
  - rating value (from 1 to 5)

- Authentication part is done.

  - Forgot Password and Reset Password is done.

- Models are created. Models can be found below:

  - User
  - Song
  - Album
  - Artist
  - Invitation
  - Friends
  - Rating
  - Image

- Spotify API is adjusted.

  - We refresh the access token in every function related to Spotify API.

- Cascading deleting is handled.

  - When we delete an album, we delete songs that are related to that album.
  - When we delete an artist, we delete albums and songs related to that artist.

- Friend management is adjusted.

  - If a user wants to add a friend, they should create an invitation using the friend's ID.
  - If the invitation is accepted, they will be friends. Otherwise, the invitation will be deleted.

- Manual input entry is handled.

  - Songs In Spotify: Users can add songs that are in Spotify using Spotify Search.
  - Songs Not In Spotify: Users can add songs by entering the song name, album name, main artist name, featuring artist names, and release date.

- File (batch) input is handled.

  - Users can enter their songs using JSON file. In JSON file, users must enter song name, album name, main artist name, and featuring artist names

- Transfering database collection is handled.
  - Users can transfer their songs from their MongoDB database. They should enter their database URI, database name, and collection name.

- Ratings are adjusted.
  - All the old ratings of a song are saved to the collection named Rating for analysis purposes.

- Recommendations are handled.
  - Recommendations based on songs: Songs will be recommended from SpotifyAPI based on users' ratings of their songs. If a song of the user is rated higher or equal to 4. Spotify API will use this song. (This is not the Spotify Recommendations).
  - Recommendations based on the album: If a user rated an album greater or equal to 4, we will recommend another song that is a part of that album.
  - Recommendations based on artist: If a user rated an artist greater or equal to 4, we will recommend other songs that belong to that artist.
  - Recommendations based on Spotify Recommendations: If a user rates a song greater or equal to 4, we will recommend other songs from the Spotify Recommendations system.
  - Recommendations based on Temporal Values: If a user rated a song from a specific artist, and does not rate or add any songs from that user over a month, we will recommend other songs from that user.
  - Recommendations based on friends: If users' friends have rated songs that are rated greater or equal to 4, we will recommend these songs to the user.
 
- Data Exporting is handled.
  - Users can export their ratings. They can specify the artist's name and rating value.

- The analysis part is done.
  - Users can see their favorite songs, albums, and artists. They can filter the result by selecting the start and end date.
  - Users can see their average ratings based on artists. They should write the artist's names.
  - Users can see their song count based on artists. They should write the artist's names.

## In Progress

- Analysis based on the average rating the user provided during the last month on a daily basis as a line chart.

- Result Sharing
  - Normally, result sharing is handled in the backend. However, Twitter cannot tweet base 64 encoded images. For this reason, we will upload the analysis images to the MongoDB.


## Will Do

- The user should customize the analysis medium such as letting the user select and build pivot tables.

## Documentation

- Documentation can be reached by [Postman Documentation](https://www.postman.com/p308backend/workspace/cs308-srs/collection/26964445-4e82c611-a6ff-4651-8174-6d45d6bfa655?action=share&creator=26964445).

- For any questions please email eustun@sabanciuniv.edu

## Guide

To start the code, write the following lines after downloading the codebase:

1. **npm install** to install the needed packages
2. **npm start** for starting the backend.
- For more information, please look at the Postman Documentation provided above. 
