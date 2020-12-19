const express = require('express');
const mysql = require('mysql');
const key = "yes";
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const jwt = require('jsonwebtoken');
const port = process.env.port || 3000;
const exjwt = require ('express-jwt');
app.use('/',express.static('public'));
var cuser = '';
var connection = mysql.createConnection({
    host        :'sql9.freemysqlhosting.net',
    user        :'sql9382743',
    password    :'xaSpFym63X',
    database    :'sql9382743'
});
connection.connect(function(err){
    if (err) throw err
});
const jwtMW = exjwt({
    secret: key,
    algorithms: ['HS256']
});

app.post('/api/signup', async (req, res)=>{
   // database stuff
   const { username, password } = req.body;
   var inside = 0;
    connection.query(`SELECT Username FROM Users`, function(err, result, fields){
        for (var i = 0; i < result.length; i++){
            if((result[i].Username) == `${username}`){
                inside = 1;
            }
        }
        if (inside == 1){
            console.log("already inside");
            res.status(200).json({
                success: false,
                err: "User already registered"
            });
        }
       else{
            var sign = `INSERT INTO Users (Username, Password) VALUES ("${username}", "${password}")`;
            connection.query(sign, function (err, result){
                if (err) throw err;
                console.log(`${username} and ${password} added`);
            });
            var stuff = `CREATE TABLE ${username} (id BIGINT AUTO_INCREMENT PRIMARY KEY, budget VARCHAR(255), price INT, color VARCHAR(255))`;
            connection.query(stuff, function(err, result){
                console.log("Budget Created");
            });
            res.status(200).json({
                success: true,
                err: null
            });
        }
    })
    console.log("Successful Connection");
});
app.post('/api/addto', async(req,res)=>{
    const { category, budg } = req.body;
    var color = "";
    color = getRandomColor();
    console.log(`adding ${category} with a price of ${budg} and color ${color}`);
    var ins = `INSERT INTO ${cuser} (budget, price, color) VALUES ("${category}" , "${budg}", "${color}")`
    connection.query(ins, function(err, result, fields){
        console.log("information added")
        res.json(result)
    })
})
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
app.post('/api/login', async (req, res)=>{
    const { username, password } = req.body;
    console.log("working")
    var looking = 1;
    connection.query("SELECT * FROM Users", function (err, result, fields){
        console.log("Users database retrieved");
        for (var i = 0; i < result.length; i++){
            if(((result[i].Username) == `${username}`) && (result[i].Password == `${password}`)){
                looking = 0;
                cuser = `${username}`
                console.log(`User and password connect at index ${i}`);
                break;
            }
        }
        if (looking == 0){
            let token = jwt.sign({id:result[i].id, username: result[i].Username, password: result[i].Password}, key, {expiresIn: '1d'})
            res.json({
                uname: `${username}`,
                success: true,
                err: null,
                token
            });
        }
        if (looking == 1){
            res.status(401).json({
                success: false,
                err: 'Invalid login',
                token: null
            });
        }
    })
});
app.post('/api/logout', async (req,res)=>{
    const { username, password } = req.body;
    console.log(`logging out ${cuser}`)
    cuser = '';
    console.log(`logged out ${cuser}`)
    res.json({
        success: true,
        err : null,
        token: null
    })
})
app.get('/api/retrieve', async (req,res)=>{
    const labels = [];
    const budgets = [];
    const colors = [];
    console.log("retrieving data")
    connection.query(`SELECT * FROM ${cuser}`, function(err, results, fields){
        for (var i = 0; i < results.length; i++){
            labels.push(`${results[i].budget}`)
            budgets.push(results[i].price)
            colors.push(results[i].color)
        }
        console.log(`data retrieved for user ${cuser}`);
        res.json({
            label: labels,
            price: budgets,
            color: colors
        });
    })
});
app.get('/api/dash', jwtMW, async (req,res)=>{
    res.json({
        success: true
    })
})

app.listen(port, () => {
    console.log(`Server on port ${port}`);
});