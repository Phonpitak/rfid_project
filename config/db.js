const mysql = require('mysql2');
const util = require('util'); // ✅ ใช้ promisify เพื่อรองรับ async/await

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'rfid_server'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// ✅ ใช้ promisify() เพื่อให้ db.query() ใช้งาน async/await ได้
db.query = util.promisify(db.query);

module.exports = db;
