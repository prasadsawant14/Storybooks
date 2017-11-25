const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser =require('body-parser');
const methodOverride = require('method-override');

//load models
require('./models/User');
require('./models/Story');

//Passort Config 
require('./config/passport')(passport);
 

//Load Routes
const auth = require('./routes/auth');
const index = require('./routes/index');
const stories = require('./routes/stories');

//Load keys
const keys =require('./config/keys');

//handlebars helpers
const {
    truncate,
    stripTags,
    formatDate,
    select,
    editIcon
} = require('./helpers/hbs');


//Map global promises
mongoose.Promise = global.Promise;
//mongoose connect 
mongoose.connect(keys.mongoURI,
{
    useMongoClient : true
})
.then(()=> console.log("MongoDB connected"))
.catch(err => console.log(err));

const app = express();
//body-parser middleware
app.use(bodyParser.urlencoded({ extended : false}));
app.use(bodyParser.json());

//method override middleware
app.use(methodOverride('_method'));

//Handlebars middleware
app.engine('handlebars', exphbs({
    helpers:{
        truncate : truncate,
        stripTags : stripTags,
        formatDate : formatDate,
        select : select,
        editIcon : editIcon
    },
    defaultLayout : 'main'
}));

app.set('view engine', 'handlebars');


app.use(cookieParser());
app.use(session({
    secret : ' secret',
    resave : false,
    saveUninitialized : false
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Set global vars
app.use((req,res,next)=>{
    res.locals.user = req.user || null ;
    next();
});

//set static folder
app.use(express.static(path.join(__dirname,'public')));


//Use Routes

app.use('/auth', auth);
app.use('/',index);
app.use('/stories',stories);



const port = process.env.PORT || 5000 ; 


app.listen(port, () =>{
    console.log(`Server started on ${port}`);
});

