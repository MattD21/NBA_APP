import express from "express";
import axios from "axios";
import mysql from "mysql";

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Dylan1006",
    database: "nba"
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
    };

    try {
	    const response = await axios.request(options);
        res.render('pages/index', {games: response.data});
    } catch (error) {
	    console.error(error);
    }
    const data = {
        username: 'Matt D',
    };
    //res.render('pages/index', data);
});
app.get('/games.html', function(req, res) {
    res.sendFile(__dirname + "/views/games.html");
});
app.get('/players.html', async function(req, res) {
    con.query("SELECT players.player_name, teams.team_name FROM players INNER JOIN teams on teams.id=players.team_id", function (err, result, fields) {
        console.log(result);
        res.render('pages/players', {players: result});
    });
});
app.get('/teams.html', async function(req, res) {

    const options = {
        method: 'GET',
        url: 'https://api-nba-v1.p.rapidapi.com/standings',
        params: {
          league: 'standard',
          season: '2023'
        },
        headers: {
          'X-RapidAPI-Key': '145370f3f9mshf0d80bc156dc9d6p1d239djsnef65e15562ac',
          'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com'
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