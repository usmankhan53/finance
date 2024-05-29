const  mongo = require('mongoose');
const  bodyParser = require('body-parser')
const express = require('express');
const cookieParser= require('cookie-parser');
const logger = require('morgan');
const  cors = require("cors");


const app = express();



const DB = "mongodb+srv://usman53538:mypassword@cluster0.ezk4knw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongo.connect(DB).then(()=>{
    console.log("connected to database !")
}).catch(()=>{
    console.log("Not connected!");
});

app.use(cors(
    {
        origin: ["https://finance-snowy-ten.vercel.app"],
        methods: ["POST", "GET"],
        credentials: true
    }
));
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Use Routes
app.use(require('./routes/user'));
app.use(require('./routes/inventory'));
app.use(require('./routes/vendor'));







app.listen(8001,()=>{
    console.log("Your server is running on port 8001");
});

module.exports =app;
