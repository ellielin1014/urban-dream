var express = require('express');
var app = express();
var port = process.env.PORT || 8000;

//to handle the post function
var bodyParser = require("body-parser");
// mustache express
var mustacheExpress = require('mustache-express');

//take the post content and past it to the page we asked it to

app.use(bodyParser.urlencoded({
  extended: false
}));
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname);

app.use(express.static('public'));

// database:
const text1 = 'INSERT INTO story(name, email, hometown, place, message) VALUES($1, $2, $3, $4, $5)';
const text2 = 'SELECT * FROM story WHERE (id) in (SELECT max(id) FROM story)';
const text3 = 'SELECT * FROM story WHERE (id) in (SELECT max(id)-1 FROM story)';
const text4 = 'SELECT * FROM story WHERE (id) in (SELECT max(id)-2 FROM story)';
// const text2 = 'SELECT * FROM story';

// Client
const {
  Client
} = require('pg');
var client;
if (process.env.DATABASE_URL) {
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });
} else {
  client = new Client({
    database: 'urban-dream'
  });
}
client.connect();


var max_name;
var max_hometown;
var max_place;
var max_message;
var sec_name;
var sec_hometown;
var sec_place;
var sec_message;
var third_name;
var third_hometown;
var third_place;
var third_message;

// Getting latest posts
app.get('/', function(req, res1, next) {
  client.query(text2, (err, res2) => {
    if (err) throw err;
    for (let row of res2.rows) {
      max_name = row.name;
      max_hometown = row.hometown;
      max_place = row.place;
      max_message = row.message;
    }
  });
  next();
}, function(req, res1, next) {
  client.query(text3, (err, res4) => {
    if (err) throw err;
    for (let row2 of res4.rows) {
      sec_name = row2.name;
      sec_hometown = row2.hometown;
      sec_place = row2.place;
      sec_message = row2.message;
    }
  });
  next();
}, function(req, res1, next) {
  client.query(text4, (err, res5) => {
    if (err) throw err;
    for (let row3 of res5.rows) {
      third_name = row3.name;
      third_hometown = row3.hometown;
      third_place = row3.place;
      third_message = row3.message;
    }

    res1.render('index', {
      max_name,
      max_hometown,
      max_place,
      max_message,
      sec_name,
      sec_hometown,
      sec_place,
      sec_message,
      third_name,
      third_hometown,
      third_place,
      third_message
    });
  });
});


app.post('/post', function(req, res3) {
  var info = [req.body.story_name, req.body.story_email, req.body.story_hometown, req.body.story_place, req.body.story_message];
  if (info == "") {
    return false;
  } else {
    client.query(text1, info, function(error, results) {
      if (error) throw error;
      res3.redirect('/submitted.html');
    });
  }
})


app.listen(port, function() {
  console.log('Listen to port: ' + port);
})
