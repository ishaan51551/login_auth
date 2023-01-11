import express from "express";
import cors from "cors";
import morgan from "morgan";//morgan lib logs all the http request inside the 
import connect from "./database/conn.js";
import router from "./router/route.js";

const app = express();

//middlewares
app.use(express.json()); //json() is a built-in middleware function in Express. This method is used to parse the incoming requests with JSON payloads 
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by');

const PORT = 8000;

// http get request
app.get('/', (req, res) => {
    res.status(201).json('Home GET REQ');
})

// api routes
app.use('/api',router);


//Start server only if we have valid connection

connect().then(() => { // then is used becoz back in conn.js we have use PROMISE
    try {
        app.listen(PORT, () => { //handler function
            console.log(`server connected to http://localhost:${PORT}`);
        })
    } catch (err) {
        console.log('cannnot connect to  servere');
    }
}).catch(error => {
    console.log('Invalid database connection');
})

