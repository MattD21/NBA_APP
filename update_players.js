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
import axios from "axios";

con.query("SELECT * FROM teams where id>='11' and id<='20'", function (err, result, fields) {
    if (err) throw err;
    console.log(result.length);
    for(let j = 0; j < result.length; j++) {
        get_player(result[j].id)
        .then(response => {
            const players = response.data;
            for(let i = 0; i < players.response.length; i++) {
                let flag = 0;
                let firstname = players.response[i].firstname.replace("'", "\\'");
                let lastname = players.response[i].lastname.replace("'", "\\'");
                var sql = "SELECT id FROM players where id='"+players.response[i].id+"'";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(result.length);
                    if (result.length > 0)
                        flag = 1;
                });
                if(flag==1)
                    continue;
                var sql = "INSERT INTO players (id, player_name, team_id) VALUES ('"+players.response[i].id+"','"+firstname+" "+lastname+"', '"+players.parameters.team+"')";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("1 record inserted");
                });
            }
        });;
    }
});
async function get_player(result) {
    const options = {
        method: 'GET',
        url: 'https://api-nba-v1.p.rapidapi.com/players',
        params: {
            team: result,
            season: '2023'
        },
        headers: {
            'X-RapidAPI-Key': '145370f3f9mshf0d80bc156dc9d6p1d239djsnef65e15562ac',
            'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com'
        }
    };
  
    try {
      const response = await axios.request(options)
      return response;
    } catch (error) {
      console.error(error);
    }
}