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

mongoose.connect('mongodb://0.0.0.027017/mydb',{
    useNewUrlParser:true,
    useUnifiedTopology: true
})

var db= mongoose.connection;

//check connection 

db.on('error', () => console.log("error in connecting database"));
db.once('open', () => console.log("Connected to Database"));

//create checking page

app.get("/", (req, res) => {
    return res.redirect("index.html");
}).listen(3000);
