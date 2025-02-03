const express = require('express');
const router = express.Router();
const db = require('../config/db');
router.get('/student_attendance', (req, res) => {
  let { student_id, academic_year, term, year } = req.query;

  console.log('📌 ค่าที่รับมา:', { student_id, academic_year, term, year });

  // แปลงปี พ.ศ. → ค.ศ.
  if (academic_year) {
      academic_year = parseInt(academic_year);
      if (academic_year > 2500) {
          academic_year -= 543;
      }
  }

  let sql = `
      SELECT 
          t_subjects.subject_id,
          t_subjects.subject_name,
          t_subjects.subject_code,
          t_subjects.day_of_week,
          t_subjects.start_time,
          t_subjects.end_time,
          t_attendance.attendance_date,
          COALESCE(t_attendance.attendance_status, 0) AS attendance_status,
          t_user.std_year,
          t_user.user_id AS student_id,
          CONCAT(t_user.std_firstname, ' ', t_user.std_lastname) AS student_name
      FROM t_enrollments
      INNER JOIN t_subjects ON t_enrollments.subject_id = t_subjects.subject_id
      INNER JOIN t_user ON t_enrollments.student_id = t_user.u_id
      LEFT JOIN t_attendance ON t_enrollments.student_id = t_attendance.student_id 
          AND t_subjects.subject_id = t_attendance.subject_id
      WHERE t_enrollments.student_id = ? 
          AND t_subjects.academic_year = ? 
          AND t_subjects.term = ? 
          AND t_user.std_year = ?
      ORDER BY t_subjects.day_of_week, t_subjects.subject_id, t_attendance.attendance_date;
  `;

  console.log('📌 SQL Query:', sql);
  console.log('📌 Parameters:', [student_id, academic_year, term, year]);

  db.query(sql, [student_id, academic_year, term, year], (err, results) => {
      if (err) {
          console.error('❌ Database Error:', err);
          return res.status(500).json({ error: 'Database error' });
      }

      console.log('✅ Data Fetched:', results.length, 'rows');

      // **เรียกฟังก์ชัน Format ให้เป็นโครงสร้างตาราง**
      const formattedData = formatAttendanceData(results);

      res.json(formattedData);
  });
});

// **ฟังก์ชันจัดกลุ่มข้อมูลการเข้าเรียน**
function formatAttendanceData(rows) {
  const formattedData = {};

  rows.forEach(row => {
      const dayOfWeek = row.day_of_week;
      const subjectId = row.subject_id;
      const studentId = row.student_id;

      if (!formattedData[dayOfWeek]) {
          formattedData[dayOfWeek] = {};
      }

      if (!formattedData[dayOfWeek][subjectId]) {
          formattedData[dayOfWeek][subjectId] = {
              subject_name: `${row.subject_name} (${row.subject_code})`,
              start_time: row.start_time,
              end_time: row.end_time,
              attendance: {},  
              summary: { present: 0, late: 0, absent: 0 }
          };
      }

      if (row.attendance_date) {
          const dateStr = new Date(row.attendance_date).toISOString().split('T')[0];

          formattedData[dayOfWeek][subjectId].attendance[dateStr] = row.attendance_status;

          if (row.attendance_status === 1) {
              formattedData[dayOfWeek][subjectId].summary.present++;
          } else if (row.attendance_status === 2) {
              formattedData[dayOfWeek][subjectId].summary.late++;
          } else if (row.attendance_status === 3) {
              formattedData[dayOfWeek][subjectId].summary.absent++;
          }
      }
  });

  return formattedData;
}

module.exports = router;