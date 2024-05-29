const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();

// Database connection
const DB = "mongodb+srv://usman53538:mypassword@cluster0.ezk4knw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to database!");
}).catch((err) => {
    console.error("Not connected!", err);
});

// CORS configuration
const corsOptions = {
    origin: ["https://finance-snowy-ten.vercel.app"],
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Middleware setup
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Routes setup
app.use('/user', require('./routes/user'));
app.use('/inventory', require('./routes/inventory'));
app.use('/vendor', require('./routes/vendor'));

// Handling preflight requests
app.options('*', cors(corsOptions));

// Start server
const PORT = 8001;
app.listen(PORT, () => {
    console.log(`Your server is running on port ${PORT}`);
});

module.exports = app;
