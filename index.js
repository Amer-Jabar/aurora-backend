import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongo from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './router/router.js';

const PORT = 4445 | process.env.PORT;
const IP = '127.0.0.1' | process.env.IP;

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(router);

const connectToDatabase = async () => {
    try {
        const DB_HOSTNAME = process.env?.DB_HOSTNAME || 'localhost';
        const DB_PORT = process.env?.DB_PORT || '27017';
        const DB_NAME = process.env?.DB_NAME || 'nextjsApp';

        await mongo.connect(`mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        console.log('[+] Connected To Database...')    
    } catch (e) {
        console.log('[X] An Error Happened While Connecting To Database...')
        console.log(e);
    }
}

const callBack = () => {
    console.log(`[+] Server Started On PORT: ${PORT || process.env.PORT} - ${IP || process.env.IP}`);
    connectToDatabase()
};

app.listen(PORT, IP, callBack);