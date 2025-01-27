const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
router.post('/add_subject', (req, res) => {
    console.log(req.body); // ตรวจสอบข้อมูลที่ส่งมาจากฟอร์ม
    const {
        subject_code,
        subject_name,
        academic_year,
        term,
        year,
        teacher_id,
        room_number,
        start_time,
        end_time,
        day_of_week
    } = req.body;

    // SQL สำหรับเพิ่มข้อมูลลงในตาราง t_subject
    const sql = `INSERT INTO t_subjects (subject_code, subject_name, academic_year, term, year, teacher_id, room_number, start_time, end_time, day_of_week) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
        sql,
        [subject_code, subject_name, academic_year, term, year, teacher_id, room_number, start_time, end_time, day_of_week],
        (err, result) => {
            if (err) {
                console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล:', err); // เพิ่มการแสดงข้อผิดพลาด
                res.status(500).send(`เกิดข้อผิดพลาด: ${err.message}`); // ส่งข้อความแสดงข้อผิดพลาดกลับไป
            } else {
                console.log('เพิ่มข้อมูลสำเร็จ:', result);
                res.send('เพิ่มรายวิชาสำเร็จ');
            }
        }
    );
});
module.exports = router;