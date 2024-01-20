// first importall library 

var express=require("exoress");
var bodyParse=require("body-parser");
var mongoose=require("mongoose");

//create app
const app= express()

app.use(bodyParse.json())
app.use(express.static('public'))
app.use(bodyParse.urlencoded({
    extended:true
}))

//connect databasessssssss

mongoose.connect('mongodb://')