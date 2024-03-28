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
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', async function(req, res) {
    // current timestamp in milliseconds
    const timestamp = Date.now();
    const full_date = date(timestamp);
    
    let param_Date = "dates[]=" + full_date;
    const url = 'https://api.balldontlie.io/v1/games?' + param_Date;
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
app.get('/games', async function(req, res) {
    let timestamp = Date.now();
    const end_date = date(timestamp);

    timestamp = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const start_date = date(timestamp);
    
    const params = "start_date=" + start_date;
    const url = 'https://api.balldontlie.io/v1/games?per_page=100&' + params;
    const options = {
        method: 'GET',
        url: url,
        headers: {
          Authorization: apiKeys.balldontlie
        }
      };

    try {
	    const response = await axios.request(options);
        console.log(response.data);
        res.render('pages/games.ejs', {games: response.data, teams});
    } catch (error) {
	    console.error(error);
    }
});
app.get('/players', async function(req, res) {
    con.query("SELECT players.player_name, players.points, players.assists, players.rebounds, teams.team_name FROM players INNER JOIN teams on teams.id=players.team_id", function (err, result, fields) {
        res.render('pages/players', {players: result, teams});
    });
});
app.get('/teams', async function(req, res) {

    const options_rapid = {
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
          const response = await axios.request(options_rapid);
          const tmp = response.data;
          res.render('pages/teams', {teams: response.data});
      } catch (error) {
          console.error(error);
      }
});
app.listen(8080, () => {
    console.log('server is running!')
})

function date(timestamp) {
    const dateObject = new Date(timestamp);
    let date = dateObject.getDate();
    let month = dateObject.getMonth() + 1;
    const year = dateObject.getFullYear();
    if(date < 10) {
        date = '0' + date;
    }
    if(month < 10) {
        month = '0' + month;
    }
    // prints date & time in YYYY-MM-DD format
    const result = `${year}-${month}-${date}`;
    console.log(result);
    return result;
}