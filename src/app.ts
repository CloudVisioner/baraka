

import cors from "cors";
import express, { urlencoded } from 'express'; // building routers and controllers
import path from 'path'; // built in NodeJS package
// import router from './router'; 
// import routerAdmin from './router-admin';
import morgan from 'morgan'; // req format 
import { MORGAN_FORMAT } from './libs/config';
import cookieParser from 'cookie-parser';
import session from "express-session";
import ConnectMongoDB from 'connect-mongodb-session';
import { T } from './libs/types/common';
import routerAdmin from "./router-admin";

const MongoDBStore = ConnectMongoDB(session); // configuration - set up
const store = new MongoDBStore({
    uri: String(process.env.MONGO_URL),
    collection: 'sessions'
});

/** 1-ENTRANCE **/ // middlewares DP
const app = express();
console.log('__dirname', __dirname);
app.use(express.static(path.join(__dirname, 'public'))); //
app.use("/uploads", express.static("./uploads")) //
app.use(express.urlencoded( {extended: true} )); //
app.use(express.json()); // rest api
app.use(cors({
    credentials: true,
    origin: true,
}))
app.use(cookieParser()); //

app.use(morgan(MORGAN_FORMAT)); 



/** 2-SESSIONS **/ // Authentication vs Authorization = kimligi + huquq //

app.use( // building part
    session({ // session DATA
        secret: String(process.env.SESSION_SECRET),
        cookie: {
            maxAge: 1000 * 3600 * 6, //6h 
        },
        store: store,
        resave: true, 
        saveUninitialized: true,
    })
);


// req + session

app.use(function(req, res, next) { // next() allows to proceed to the next middleware
    const sessionInstance = req.session as T; // session data for each member with a type
    res.locals.member = sessionInstance.member; // res locals temporary req only exists for this req
    // locals is a storage is of resProducts of Zara
    // <%= member.name %> can use this in ejs temp // 
    next(); // move to the next middleware (if forgotten, it will hang forever)
})

/** 3-VIEWS **/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/** 4-ROUTERS **/
app.use("/admin", routerAdmin);// SSR: EJS // BRIDGES FOR APIs  // ADMIN AREA //
// app.use("/", router);

export default app;