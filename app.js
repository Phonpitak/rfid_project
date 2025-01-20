const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const db = require('./config/db');
// การกำหนดค่า express-session
app.use(session({
    secret: 'your_secret_key', // เปลี่ยนเป็นคีย์ที่ปลอดภัยของคุณเอง
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // ตั้งค่าเป็น true หากคุณใช้ HTTPS
}));

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5555']
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Import routers
const detailRouter = require('./routes/detail');
const subject = require('./routes/subject');
const registerRouter = require('./routes/register');
const registerAllRouter = require('./routes/register_all');
const userRouter = require('./routes/user'); 
const attendanceRouter = require('./routes/attendance_record');
const memberlistRouter = require('./routes/memberlist');
const year1Router = require('./routes/year_1');
const year2Router = require('./routes/year_2');
const year3Router = require('./routes/year_3');
const year4Router = require('./routes/year_4');
const rfidRouter = require('./routes/rfid');


app.use(detailRouter);
app.use(attendanceRouter);
app.use(registerRouter);
app.use(registerAllRouter);
app.use(userRouter);
app.use(memberlistRouter);
app.use(year1Router);
app.use(year2Router);
app.use(year3Router);
app.use(year4Router);
app.use(rfidRouter);
// app.use(subject);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.post('/rfid', (req, res) => {
    console.log('Received RFID data:', req.body);
    res.status(200).send('Data received');
});

const os = require('os');
const interfaces = os.networkInterfaces();

for (let interface in interfaces) {
    for (let i = 0; i < interfaces[interface].length; i++) {
        const address = interfaces[interface][i];
        if (address.family === 'IPv4' && !address.internal) {
            console.log(`Server IP Address: ${address.address}`);
        }
    }
}
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
