import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import ErrorHandler from './middleware/error.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors'
import user from './controller/user.js';
dotenv.config();
const app = express();
connectDB();
const PORT = process.env.PORT || 8080;
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
    origin: 'http://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use('/', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));



app.use('/api/v2/user', user);


app.use(ErrorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

