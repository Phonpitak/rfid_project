const express = require('express');
const router = express.Router();
const db = require('../config/db'); // เชื่อมต่อ Database
const moment = require('moment-timezone'); // ✅ ใช้ moment-timezone


router.post('/rfid', async (req, res) => {
    try {
        console.log("📥 Received RFID Data:", req.body); // Debug
        const { value } = req.body;
        const currentDate = moment().tz("Asia/Bangkok").format("YYYY-MM-DD");
        const currentTime = moment().tz("Asia/Bangkok").format("HH:mm:ss");
        const currentDay = moment().tz("Asia/Bangkok").locale("th").format("dddd");

        if (!value) {
            return res.status(400).json({ error: "RFID value is required" });
        }

        // ✅ ใช้ async/await ได้เลย เพราะ db.query() ถูก promisify แล้ว
        const student = await db.query(
            "SELECT * FROM t_user WHERE rfid_id = ?",
            [value]
        );

        if (!student || student.length === 0) {
            return res.status(404).json({ error: "RFID ไม่ตรงกับนักศึกษาในระบบ" });
        }

        const studentId = student[0].u_id;
        const studentYear = student[0].std_year;

        // ✅ ค้นหาวิชาเรียนวันนี้ของนักศึกษา
        const schedule = await db.query(
            "SELECT subject_id FROM t_subjects WHERE day_of_week = ? AND year = ?",
            [currentDay, studentYear]
        );

        if (!schedule || schedule.length === 0) {
            return res.status(400).json({ error: "วันนี้ไม่มีวิชาเรียนสำหรับชั้นปีนี้" });
        }

        const subjectId = schedule[0].subject_id;

        // ✅ บันทึกข้อมูลการเข้าเรียน
        await db.query(
            "INSERT INTO t_attendance (student_id, subject_id, attendance_date, attendance_status, scan_time) VALUES (?, ?, ?, ?, ?)",
            [studentId, subjectId, currentDate, 1, currentTime]
        );

        return res.json({ status: "success", message: "บันทึกเวลาเข้าเรียนสำเร็จ", subject_id: subjectId });
    } catch (error) {
        console.error("❌ Error in RFID API:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;

