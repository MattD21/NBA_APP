import express from "express";
import axios from "axios";
import mysql from "mysql";
import {db, apiKeys} from "../accounts.js";
import { teams } from "../logos.js";

var con = mysql.createConnection({
    host: db.host, 
    user: db.user,
    password: db.password,
    database: db.database
  });
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

const app = express();
app.set('view engine', 'ejs');

app.get('/', async function(req, res) {
    // current timestamp in milliseconds
    const timestamp = Date.now();
    const dateObject = new Date(timestamp);
    let date = dateObject.getDate();
    const month = dateObject.getMonth() + 1;
    const year = dateObject.getFullYear();
    if(date < 10) {
        date = '0' + date;
    }
    // prints date & time in YYYY-MM-DD format
    const full_date = `${year}-${month}-${date}`;
    console.log(full_date);
    let param_Date = "dates[]=" + full_date;
    const url = 'https://www.balldontlie.io/api/v1/games?' + param_Date;
    const options = {
        method: 'GET',
        url: url,
        headers: {
          Authorization: apiKeys.balldontlie
        }
      };

    try {
	    const response = await axios.request(options);
        res.render('pages/index.ejs', {games: response.data, teams});
    } catch (error) {
	    console.error(error);
    }
});
app.get('/games', function(req, res) {
    res.render('pages/games');
});
app.get('/players', async function(req, res) {
    con.query("SELECT players.player_name, players.points, players.assists, players.rebounds, teams.team_name FROM players INNER JOIN teams on teams.id=players.team_id", function (err, result, fields) {
        res.render('pages/players', {players: result, teams});
    });
});
app.get('/teams', async function(req, res) {

    const options = {
        method: 'GET',
        url: 'https://api-nba-v1.p.rapidapi.com/standings',
        params: {
          league: 'standard',
          season: '2023'
        },
        headers: {
          'X-RapidAPI-Key': apiKeys.rapidKey,
          'X-RapidAPI-Host': apiKeys.rapidHost
        }
      };
      
      try {
          const response = await axios.request(options);
          const tmp = response.data;
          res.render('pages/teams', {teams: response.data});
      } catch (error) {
          console.error(error);
      }
});
app.listen(8080, () => {
    console.log('server is running!')
})