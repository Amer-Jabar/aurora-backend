import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongo from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './router/router.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(router);

(async () => {
    await mongo.connect('mongodb://localhost:27017/nextjsApp', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });
})();


const PORT = Number(process.env.PORT) + 1;
const IP = process.env.IP;

const callBack = () => console.log(`[+] Server Started On PORT: ${PORT}`);

app.listen(PORT, IP, callBack);