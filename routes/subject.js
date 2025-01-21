const express = require('express');
const router  = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
router.get('/api/timetable', (req, res) => {
    const { academic_year, term } = req.query;
    const sql = `
        SELECT day_of_week, subject_name, start_time, end_time, room_number
        FROM t_subjects
        WHERE academic_year = ? AND term = ?
        ORDER BY FIELD(day_of_week, 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์'), start_time;
    `;
    db.query(sql, [academic_year, term], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Database error');
            return;
        }

        // Log ข้อมูลที่ได้จาก database
        console.log('Query Results:', results);

        const morningSubjects = results.filter(subject => subject.start_time < '12:00:00');
        const afternoonSubjects = results.filter(subject => subject.start_time >= '12:00:00');

        // Log ข้อมูลที่แยกได้
        console.log('Morning Subjects:', morningSubjects);
        console.log('Afternoon Subjects:', afternoonSubjects);

        res.json({ morning: morningSubjects, afternoon: afternoonSubjects });
    });
});


module.exports = router;