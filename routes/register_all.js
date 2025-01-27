const express = require('express');
const router = express.Router();
const db = require('../config/db');
// กำหนดฟังก์ชัน getExpectedClassDates ก่อน

// ดึงรายวิชา
router.get('/get_subjects', (req, res) => {
    const sql = "SELECT subject_id, subject_code, subject_name FROM t_subjects";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching subjects:", err);
            res.status(500).send("Error fetching subjects");
        } else {
            res.json(results);
        }
    });
});

// ลงทะเบียนกลุ่มนักศึกษา
router.post('/bulk_enroll', (req, res) => {
    const { std_year, subject_id } = req.body;

    // ดึงข้อมูลนักศึกษาตามปีการศึกษา
    const studentQuery = "SELECT u_id AS student_id FROM t_user WHERE std_year = ?";
    db.query(studentQuery, [std_year], (err, students) => {
        if (err) {
            console.error("Error fetching students:", err);
            return res.status(500).send("Error fetching students");
        }

        if (students.length === 0) {
            return res.status(404).send("ไม่มีนักศึกษาในปีการศึกษาที่เลือก");
        }

        // เตรียมคำสั่ง INSERT แบบ bulk
        const enrollmentQuery = "INSERT INTO t_enrollments (student_id, subject_id) VALUES ?";
        const values = students.map(student => [student.student_id, subject_id]);

        db.query(enrollmentQuery, [values], (err, result) => {
            if (err) {
                console.error("Error bulk enrolling students:", err);
                return res.status(500).send("Error enrolling students");
            }

            res.send("ลงทะเบียนกลุ่มสำเร็จ!");
        });
    });
});
module.exports = router;