const express = require('express');
const router  = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
// Backend - แก้ไข route ใน Node.js
router.get('/api/timetable', (req, res) => {
    const { academic_year, term, year } = req.query;

    console.log('Received params:', { academic_year, term, year });

    const sql = `
        SELECT 
    day_of_week,
    subject_name,
    start_time,
    end_time,
    room_number
FROM t_subjects
WHERE academic_year = ?
AND term = ?
AND year = ?
ORDER BY 
    FIELD(day_of_week, 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'),
    start_time;

    `;

    const params = year ? [academic_year, term, year] : [academic_year, term];
    console.log('SQL Query:', sql);
    console.log('Query params:', params);

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }

        console.log('Raw database results:', results);

        if (!results || results.length === 0) {
            console.log('No data found for the given criteria');
            return res.json({
                morning: [],
                afternoon: [],
                all: [],
                message: 'No data found'
            });
        }

        const morning = results.filter(subject => {
            const time = subject.start_time instanceof Date
                ? subject.start_time
                : new Date(`1970-01-01T${subject.start_time}`);
            return time.getHours() < 12;
        });

        const afternoon = results.filter(subject => {
            const time = subject.start_time instanceof Date
                ? subject.start_time
                : new Date(`1970-01-01T${subject.start_time}`);
            return time.getHours() >= 12;
        });

        res.json({
            morning,
            afternoon,
            all: results
        });
    });
});



module.exports = router;