const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started Listening..");
    });
  } catch (err) {
    console.log(`There has been ${err.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

// get all movie names
app.get("/movies/", async (req, res) => {
  const sqlQuery = `
        SELECT movie_name
        FROM movie;
    `;
  const dbResponse = await db.all(sqlQuery);
  const finalResponse = dbResponse.map((item) => {
    return {
      movieName: item.movie_name,
    };
  });
  res.send(finalResponse);
});

// get specific movie details
app.get("/movies/:id/", async (req, res) => {
  const { id } = req.params;
  const sqlQuery = `
        SELECT *
        FROM movie
        WHERE movie_id = ${id};
    `;
  const dbResponse = await db.all(sqlQuery);
  const finalResponse = dbResponse.map((item) => {
    return {
      movieId: item.movie_id,
      directorId: item.director_id,
      movieName: item.movie_name,
      leadActor: item.lead_actor,
    };
  });
  res.send(finalResponse[0]);
});

// post new movie obj
app.post("/movies/", async (req, res) => {
  const movieDetails = req.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const sqlQuery = `
        INSERT INTO
            movie (director_id, movie_name, lead_actor)
        VALUES (
            '${directorId}',
            '${movieName}',
            '${leadActor}'
        );
    `;
  const dbResponse = await db.run(sqlQuery);
  res.send("Movie Successfully Added");
});

// put method, update a movie
app.put("/movies/:id/", async (req, res) => {
  const movieDetails = req.body;
  const { id } = req.params;
  const { directorId, movieName, leadActor } = movieDetails;
  const sqlQuery = `
        UPDATE
            movie 
        SET 
            director_id = '${directorId}',
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE movie_id = ${id};
    `;
  await db.run(sqlQuery);
  res.send("Movie Details Updated");
});

// delete method, delete a movie
app.delete("/movies/:id/", async (req, res) => {
  const { id } = req.params;
  const sqlQuery = `
        DELETE FROM
            movie
        WHERE movie_id = ${id};
    `;
  await db.run(sqlQuery);
  res.send("Movie Removed");
});

// get all directors names
app.get("/directors/", async (req, res) => {
  const sqlQuery = `
        SELECT *
        FROM director;
    `;
  const dbResponse = await db.all(sqlQuery);
  const finalResponse = dbResponse.map((item) => {
    return {
      directorId: item.director_id,
      directorName: item.director_name,
    };
  });
  res.send(finalResponse);
});

// get  all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const sqlQuery = `
        SELECT movie_name
        FROM director JOIN movie ON director.director_id = movie.director_id
        WHERE director.director_id = ${directorId};
    `;
  const dbResponse = await db.all(sqlQuery);
  const finalResponse = dbResponse.map((item) => {
    return {
      movieName: item.movie_name,
    };
  });
  res.send(finalResponse);
});

module.exports = app;
