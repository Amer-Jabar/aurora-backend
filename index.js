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
    const DB_NAME = process.env?.DB_NAME || 'shop';
    const DB_USERNAME = process.env?.DB_USERNAME || 'Amer';
    const DB_PASSWORD = process.env?.DB_PASSWORD || 'Amer';
    const url = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@cluster-shard-00-00.an7p6.mongodb.net:27017,cluster-shard-00-01.an7p6.mongodb.net:27017,cluster-shard-00-02.an7p6.mongodb.net:27017/${DB_NAME}?ssl=true&replicaSet=atlas-pb8j52-shard-0&authSource=admin&retryWrites=true&w=majority`;

    try {
        await mongo.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        console.log('[+] Connected To Database...')  
    } catch (e) {
        console.log('[X] Error In Connecting To Database...', e);
    }
}

const callBack = () => {
    console.log(`[+] Server Started On PORT: ${PORT || process.env.PORT} - ${IP || process.env.IP}`);
    connectToDatabase()
};

app.listen(PORT, IP, callBack);