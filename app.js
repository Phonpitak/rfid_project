const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const db = require('./config/db');
const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore({}, db);



// **Middleware แก้ปัญหา Preflight Request (OPTIONS)**
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:5555', 
        'http://127.0.0.1:5555'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});
// ตั้งค่า CORS
const corsOptions = {
    origin: true, // อนุญาตทุก origin ที่ร้องขอเข้ามา
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.set('trust proxy', 1); // ให้ Express รองรับ Proxy เช่น ngrok

// เปิดเมื่อใช้ localhost
app.use(session({
    secret: 'your_secret_key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: false,  // ปิด proxy เมื่อไม่ได้ใช้ ngrok
    cookie: { 
        secure: false,  // ต้องเป็น false เมื่อใช้ HTTP (localhost)
        httpOnly: true,
        sameSite: 'Lax'  // ปรับ sameSite เป็น Lax เมื่อไม่ได้ใช้ CORS ข้ามโดเมน
    }
}));
// เปิดเมื่อใช้ Ngrok
// // **ตั้งค่า SESSION**
// app.use(session({
//     secret: 'your_secret_key',
//     store: sessionStore,
//     resave: false,
//     saveUninitialized: false,
//     proxy: true,  // สำคัญ! เพื่อให้ Express รองรับ Proxy (ngrok)
//     cookie: { 
//         secure: true,  // ต้องเป็น true เมื่อใช้ HTTPS (ngrok)
//         httpOnly: true,
//         sameSite: 'None'  // ป้องกันปัญหา session cookies ข้าม origin
//     }
// }));


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// **Import routes**
const detailRouter = require('./routes/detail');
const subject = require('./routes/subject');
const registerRouter = require('./routes/register');
const userRouter = require('./routes/user'); 
const attendanceRouter = require('./routes/attendance_record');
const memberlistRouter = require('./routes/memberlist');
const year1Router = require('./routes/year_1');
const year2Router = require('./routes/year_2');
const year3Router = require('./routes/year_3');
const year4Router = require('./routes/year_4');
const rfidRouter = require('./routes/rfid');
const add_subject = require('./routes/add_subject');
const registerAllRouter = require('./routes/register_all');

app.use(detailRouter);
app.use(attendanceRouter);
app.use(registerRouter);
app.use(userRouter);
app.use(memberlistRouter);
app.use(year1Router);
app.use(year2Router);
app.use(year3Router);
app.use(year4Router);
app.use(rfidRouter);
app.use(subject);
app.use(add_subject);
app.use(registerAllRouter);

// **Route สำหรับหน้า Login**
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// **Route RFID**
app.post('/rfid', (req, res) => {
    console.log('Received RFID data:', req.body);
    res.status(200).send('Data received');
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
