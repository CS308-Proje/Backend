# Backend Part of the SRS - Song Recommendation System

## What we have done so far?

- Authentication part is done.

  - Reset Password might be added.

- Song dataset is found.

- Friend management is adjusted.

- Manual input entry is handled.

- Song, Album and Artist models is created. When a user enters a song, if the album and artist was not included in the database, they will be created. Otherwise, we push those values in the songId part under Album model, and albumId part under Artist model.

## What are we going to the next?

- We will add validation functions to check if the song, album or artist is already in the database.

- There is a minor bug in the adding friend route.

- Batch input will be handled. In this function, users will specify a folder path, then the contents of will be added to the database after it gets validation.

- Song data that we found will be adjusted to conform our models in the backend.
