const express = require('express');
const app = express();
require("dotenv").config();
const key =process.env.SECRET_KEY
const db= require("./config/config")
const bodyParser = require('body-parser');
const userModel = require('./models/user');
const taskModel= require("./models/tasks")
app.set('view engine', 'ejs');
const jwt= require("jsonwebtoken");
const cookieParser = require('cookie-parser');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieParser())
const PORT = process.env.PORT || 3000

app.get("/",(req,res)=>
{
    res.send("hii this is main page")
})


app.listen(PORT)