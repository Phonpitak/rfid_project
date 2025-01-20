const express = require('express');
const router = express.Router();
const db = require('../config/db');
router.get('/attendance4', (req, res) => {
    const teacherId = req.query.teacher_id;
    const year = req.query.year;

    const sql = `
        SELECT 
            t_user.user_id AS student_id,
            t_user.std_firstname AS firstname,
            t_user.std_lastname AS lastname,
            t_subjects.subject_name,
            t_subjects.subject_code,  -- ดึง subject_code เพิ่มมาจากตาราง
            t_subjects.subject_id,
            t_subjects.day_of_week,
            t_subjects.start_time,
            t_subjects.end_time,
            t_attendance.attendance_date,
            t_attendance.attendance_status,
            t_attendance.scan_time
        FROM t_subjects
        INNER JOIN t_enrollments ON t_subjects.subject_id = t_enrollments.subject_id
        INNER JOIN t_user ON t_enrollments.student_id = t_user.u_id
        LEFT JOIN t_attendance ON t_user.u_id = t_attendance.student_id 
            AND t_subjects.subject_id = t_attendance.subject_id
        WHERE t_subjects.teacher_id = ? 
            AND t_user.std_year = ?
        ORDER BY t_subjects.day_of_week, t_subjects.subject_id, t_user.u_id, t_attendance.attendance_date;
    `;

    db.query(sql, [teacherId, year], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
    
        const formattedData = formatAttendanceData(results);
        console.log('Formatted Data:', JSON.stringify(formattedData, null, 2)); // ตรวจสอบข้อมูล
        res.json(formattedData);
    });
});

// ฟังก์ชันแปลงวันภาษาไทยเป็นตัวเลข
function thaiDayToNumber(thaiDay) {
    const dayMap = {
        'อาทิตย์': 0,
        'จันทร์': 1,
        'อังคาร': 2,
        'พุธ': 3,
        'พฤหัส': 4,
        'ศุกร์': 5,
        'เสาร์': 6
    };
    return dayMap[thaiDay] || 2; // default เป็นวันอังคารถ้าไม่พบข้อมูล
}

// ฟังก์ชันจัดรูปแบบข้อมูล
function formatAttendanceData(rows) {
    const formattedData = {};

    // จัดกลุ่มตามวันและวิชา
    rows.forEach(row => {
        const dayOfWeek = thaiDayToNumber(row.day_of_week);
        const subjectId = row.subject_id;
        
        // สร้างโครงสร้างข้อมูลตามวัน
        if (!formattedData[dayOfWeek]) {
            formattedData[dayOfWeek] = {};
        }
        
        // สร้างโครงสร้างข้อมูลตามวิชา
        if (!formattedData[dayOfWeek][subjectId]) {
            formattedData[dayOfWeek][subjectId] = {
                subject_name: `${row.subject_name} (${row.subject_code})`, // เพิ่มรหัสวิชาต่อท้ายชื่อวิชา
                day_of_week: dayOfWeek,
                students: {}
            };
        }

        const studentId = row.student_id;
        
        // สร้างข้อมูลนักศึกษา
        if (!formattedData[dayOfWeek][subjectId].students[studentId]) {
            formattedData[dayOfWeek][subjectId].students[studentId] = {
                student_id: studentId,
                fullname: `${row.firstname} ${row.lastname}`,
                attendance: {},
                summary: {
                    present: 0,
                    late: 0,
                    absent: 0
                }
            };
        }

        // เพิ่มข้อมูลการเข้าเรียน
        if (row.attendance_date) {
            const date = new Date(row.attendance_date);
            const dateStr = date.toISOString().split('T')[0];
            
            formattedData[dayOfWeek][subjectId].students[studentId].attendance[dateStr] = {
                status: row.attendance_status?.toString() || '-',
                scan_time: row.scan_time
            };

            // อัปเดตสรุป
            const status = row.attendance_status;
            if (status === 1) {
                formattedData[dayOfWeek][subjectId].students[studentId].summary.present++;
            } else if (status === 2) {
                formattedData[dayOfWeek][subjectId].students[studentId].summary.late++;
            } else if (status === 3) {
                formattedData[dayOfWeek][subjectId].students[studentId].summary.absent++;
            }
        }
    });

    return formattedData;
}



module.exports = router;
