const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ใช้ connection pool
const moment = require('moment-timezone'); // ✅ ใช้ moment-timezone

router.post('/rfid', async (req, res) => {
    try {
        console.log("📥 Received RFID Data:", req.body);
        const { value, room_number } = req.body;
        const currentDate = moment().tz("Asia/Bangkok").format("YYYY-MM-DD");
        const currentTime = moment().tz("Asia/Bangkok").format("HH:mm:ss");

        if (!value || !room_number) {
            return res.status(400).json({ error: "RFID and room_number are required." });
        }

        // ✅ ค้นหานักศึกษาจาก t_user
        const student = await db.query(
            "SELECT u_id, std_year FROM t_user WHERE rfid_id = ?",
            [value]
        );

        if (!student.length) {
            return res.status(404).json({ error: "RFID not found in the system." });
        }

        const studentId = student[0].u_id;
        const studentYear = student[0].std_year;
        const currentDay = moment().tz("Asia/Bangkok").locale("th").format("dddd");

        // ✅ ดึงข้อมูลวิชาที่สอนวันนี้ พร้อมเวลา start_time, end_time และ room_number
        const schedule = await db.query(
            "SELECT subject_id, start_time, end_time, room_number FROM t_subjects WHERE day_of_week = ? AND year = ?",
            [currentDay, studentYear]
        );

        if (!schedule.length) {
            return res.status(400).json({ error: "No class scheduled for today." });
        }

        let subjectId = null;
        let attendanceStatus = 1; // Default: On time

        for (let sub of schedule) {
            // ✅ ตรวจสอบห้องเรียน
            if (sub.room_number !== room_number) {
                continue; // ข้ามไปถ้าห้องไม่ตรงกัน
            }

            const startTime = moment(sub.start_time, "HH:mm:ss");
            const lateThreshold = startTime.clone().add(15, "minutes");  // After 15 mins = Late
            const absentThreshold = startTime.clone().add(60, "minutes"); // After 60 mins = Absent
            const endTime = moment(sub.end_time, "HH:mm:ss");
            const scanTime = moment(currentTime, "HH:mm:ss");

            if (scanTime.isBetween(startTime, lateThreshold, null, "[)")) {
                subjectId = sub.subject_id;
                attendanceStatus = 1; // ✅ On time
                break;
            } else if (scanTime.isBetween(lateThreshold, absentThreshold, null, "[)")) {
                subjectId = sub.subject_id;
                attendanceStatus = 2; // ⚠️ Late
                break;
            } else if (scanTime.isAfter(absentThreshold) && scanTime.isBefore(endTime)) {
                subjectId = sub.subject_id;
                attendanceStatus = 3; // ❌ Absent
                break;
            }
        }

        if (!subjectId) {
            return res.status(400).json({ error: "No class found or wrong room." });
        }

        // ✅ ตรวจสอบการสแกนไปแล้วในวันนี้
        const checkExisting = await db.query(
            "SELECT attendance_status FROM t_attendance WHERE student_id = ? AND subject_id = ? AND attendance_date = ?",
            [studentId, subjectId, currentDate]
        );

        if (checkExisting.length > 0) {
            return res.status(400).json({ error: "Already scanned today." });
        }

        // ✅ บันทึกข้อมูลการเข้าเรียน
        await db.query(
            "INSERT INTO t_attendance (student_id, subject_id, attendance_date, attendance_status, scan_time, room_number) VALUES (?, ?, ?, ?, ?, ?)",
            [studentId, subjectId, currentDate, attendanceStatus, currentTime, room_number]
        );

        return res.json({
            status: "success",
            message: "Attendance recorded successfully",
            subject_id: subjectId,
            attendance_status: attendanceStatus
        });

    } catch (error) {
        console.error("❌ Error in RFID API:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});





module.exports = router;
