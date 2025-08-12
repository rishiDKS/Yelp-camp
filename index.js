const express=require('express');
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const catchAsync=require('./utils/catchAsync');
// const ExpressError=require('./utils/ExpressError.js')
const CampGround=require('./models/campground.js');
const methodOverride=require('method-override');
const Review=require("./models/review.js");
const session=require('express-session');
const flash=require('connect-flash')
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user.js');
const MongoDBStore=require('connect-mongo');

if(process.env.NODE_ENV!=='production'){
require('dotenv').config();
}

const userRoutes=require('./routes/users.js');
const campgroundRoutes=require('./routes/campground.js')
const reviewRoutes=require('./routes/reviews.js')

// const dbUrl=process.env.DB_URL;
const dbUrl='mongodb://localhost:27017/yelp-camp';
// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl,{
    useNewUrlParser:true,
    // useCreateIndex:true,
    useUnifiedTopology:true,
    // useFindAndModify:false
});

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected")
});

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret: 'thisshouldbeabettersecret',
    touchAfter: 24 * 60 * 60 // in seconds
});

const sessionConfig={
    store,
    secret:'thisshouldbeabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}


app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    console.log(req.session);
    res.locals.currentUser=req.user;
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
})


app.get("/",(req,res)=>{
    res.render("home.ejs");
})
// app.get("/fakeUser",async(req,res)=>{
//     const user=new User({email:'',username:''});
//     const newUser=await User.register(user,"chicken");
//     res.send(newUser);
// })

app.use("/",userRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/reviews",reviewRoutes);
app.use(express.static(path.join(__dirname,'public')));



// app.all('*',(req,res,next)=>{
//     res.status(404).send("404 - Page Not Found");
// })

app.use((err,req,res,next)=>{
    res.send("something wrong!!!");
})

app.listen(3000,()=>{
    console.log("Serving on port 3000");
})