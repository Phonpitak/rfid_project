const express = require('express');
const router  = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');

// More secure and flexible file storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/uploaduser'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    // Use original filename with timestamp to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, uniqueSuffix + '-' + sanitizedFilename);
  }
});

// File filter for image validation
const imageFilter = (req, file, cb) => {
  // Accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: imageFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});
router.post('/upload', upload.single('image'), (req, res) => {
    try {
      console.log('Full request body:', req.body);
      console.log('File details:', req.file);
   
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'ไม่พบไฟล์อัปโหลด' 
        });
      }
   
      // ใช้ path สัมบูรณ์สำหรับการบันทึก
      const imgPath = '/img/uploaduser/' + req.file.filename;
      const userId = req.body.userId;
   
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ต้องระบุรหัสผู้ใช้' 
        });
      }
   
      // อัปเดตโดยตรง พร้อมตรวจสอบการอัปเดต
      db.query(
        'UPDATE t_user SET std_img = ? WHERE u_id = ?',
        [imgPath, userId],
        (error, results) => {
          if (error) {
            console.error('Database update error:', error);
            return res.status(500).json({ 
              success: false, 
              message: 'ไม่สามารถบันทึกรูปภาพได้' 
            });
          }
   
          // ตรวจสอบว่ามีการอัปเดตจริง
          if (results.affectedRows === 0) {
            return res.status(404).json({ 
              success: false, 
              message: 'ไม่พบผู้ใช้' 
            });
          }
   
          res.json({ 
            success: true, 
            message: 'อัปโหลดรูปภาพสำเร็จ',
            imagePath: imgPath 
          });
        }
      );
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ 
        success: false, 
        message: 'เกิดข้อผิดพลาดภายใน' 
      });
    }
   });


   router.get('/user/profile/:userId', (req, res) => {
    const userId = req.params.userId;
  
    db.query(
      'SELECT std_img FROM t_user WHERE u_id = ?', 
      [userId], 
      (error, results) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' 
          });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'ไม่พบข้อมูลผู้ใช้' 
          });
        }
  
        console.log('Database image path:', results[0].std_img);
  
        res.json({
          success: true,
          std_img: results[0].std_img || 'img/profile-placeholder.png'
        });
      }
    );
  });

router.get('/infoname/:id', (req, res) => {
    const userId = req.params.id; // ดึงค่า ID จาก URL
    const sql = 'SELECT std_firstname, std_lastname FROM t_user WHERE u_id = ?'; // ใช้ ? เพื่อ placeholder ของ parameter

    db.query(sql, [userId], (err, result) => { // ส่งพารามิเตอร์ ID ไปที่ query
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: err.message }); // ส่งข้อความผิดพลาดกลับ
        } else {
            if (result.length > 0) {
                res.status(200).json(result[0]); // ส่งข้อมูลที่ดึงมาจากฐานข้อมูล
            } else {
                res.status(404).json({ error: 'User not found' }); // กรณีไม่พบข้อมูล
            }
        }
    });
});
router.get('/detail/fullname/:Id', (req, res) => {
    const Id = req.params.Id; // ดึง userId จาก path parameter

    if (!Id) {
        return res.status(400).json({ error: 'Id is required' }); // ตรวจสอบว่ามีการส่ง userId มาหรือไม่
    }

    const sql = 'SELECT std_firstname, std_lastname FROM t_user WHERE u_id = ?';

    db.query(sql, [Id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: err.message });
        } else {
            if (result.length === 0) {
                res.status(404).json({ message: 'User not found' }); // กรณีไม่พบข้อมูล
            } else {
                res.status(200).json(result); // ส่งข้อมูลกลับ
            }
        }
    });
});

router.get('/detail/infos', (req, res) => {
    const sql = 'SELECT std_firstname, std_lastname FROM t_user WHERE u_id = ?';
    const userId = req.query.userId || 1; // กำหนด userId ตามที่ต้องการ

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json(result); // ส่งข้อมูลในรูปแบบ JSON
        }
    });
});

// router.get('/detail/All/:userId', (req, res) => {
//     const sql = 'SELECT user_id, std_firstname, std_lastname, b_branch, f_facully, std_year, term FROM t_user WHERE u_id = ?';
//     const userId = req.params.userId; // ใช้ params แทน query

//     db.query(sql, [userId], (err, result) => {
//         if (err) {
//             console.error('Database error:', err);
//             res.status(500).json({ error: err.message });
//         } else if (result.length === 0) {
//             res.status(404).json({ message: 'ไม่พบข้อมูลนักศึกษา' });
//         } else {
//             res.status(200).json(result); // ส่งข้อมูลในรูปแบบ JSON
//         }
//     });
// });


router.get('/detail/All/:userId', async (req, res) => {
    try {
        const sql = `
            SELECT user_id, std_firstname, std_lastname, b_branch, f_facully, group_id, std_year, term 
            FROM t_user WHERE user_id = ?
        `;
        const userId = req.params.userId;
        const result = await db.query(sql, [userId]); // ✅ ใช้ await

        if (result.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลนักศึกษา' });
        }

        res.status(200).json(result);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});

// API Route สำหรับดึงสถิติการเข้าเรียนรายบุคคล
router.get('/student-attendance-statistics', (req, res) => {
    const studentId = req.query.student_id;
    const year = req.query.year || 2567; // ค่าเริ่มต้นเป็นปีปัจจุบัน
    
    // SQL สำหรับดึงข้อมูลสถิติการเข้าเรียนของนักศึกษา
    const sql = `
        SELECT 
            t_subjects.subject_id,
            t_subjects.subject_name,
            t_subjects.subject_code,
            COUNT(CASE WHEN t_attendance.attendance_status = 1 THEN 1 END) AS present_count,
            COUNT(CASE WHEN t_attendance.attendance_status = 2 THEN 1 END) AS late_count,
            COUNT(CASE WHEN t_attendance.attendance_status = 3 THEN 1 END) AS absent_count,
            COUNT(t_attendance.attendance_id) AS total_classes
        FROM t_enrollments
        INNER JOIN t_subjects ON t_enrollments.subject_id = t_subjects.subject_id
        LEFT JOIN t_attendance ON t_enrollments.subject_id = t_attendance.subject_id 
            AND t_enrollments.student_id = t_attendance.student_id
        WHERE t_enrollments.student_id = ?
            AND t_subjects.academic_year = ?
        GROUP BY t_subjects.subject_id, t_subjects.subject_name, t_subjects.subject_code
        ORDER BY t_subjects.subject_name;
    `;
    
    db.query(sql, [studentId, year], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        // สรุปข้อมูลทั้งหมด
        const summary = {
            total_present: 0,
            total_late: 0,
            total_absent: 0,
            total_classes: 0,
            subject_statistics: results.map(item => {
                // เพิ่มข้อมูลสรุปรวม
                summary.total_present += item.present_count;
                summary.total_late += item.late_count;
                summary.total_absent += item.absent_count;
                summary.total_classes += item.total_classes;
                
                // คำนวณเปอร์เซ็นต์
                const attendance_rate = item.total_classes > 0 
                    ? ((item.present_count + item.late_count) / item.total_classes * 100).toFixed(2) 
                    : 0;
                
                return {
                    subject_id: item.subject_id,
                    subject_name: item.subject_name,
                    subject_code: item.subject_code,
                    present: item.present_count,
                    late: item.late_count,
                    absent: item.absent_count,
                    total_classes: item.total_classes,
                    attendance_rate: parseFloat(attendance_rate)
                };
            })
        };
        
        // คำนวณอัตราการเข้าเรียนรวม
        summary.overall_attendance_rate = summary.total_classes > 0
            ? ((summary.total_present + summary.total_late) / summary.total_classes * 100).toFixed(2)
            : 0;
        
        res.json(summary);
    });
});

// API Route สำหรับดึงข้อมูลแนวโน้มการเข้าเรียนตามเวลา (รายเดือนหรือรายสัปดาห์)
router.get('/student-attendance-trend', (req, res) => {
    const studentId = req.query.student_id;
    const year = req.query.year || 2567;
    const period = req.query.period || 'monthly'; // 'monthly' หรือ 'weekly'
    
    let timeGrouping;
    if (period === 'monthly') {
        timeGrouping = "DATE_FORMAT(t_attendance.attendance_date, '%Y-%m')";
    } else {
        timeGrouping = "YEARWEEK(t_attendance.attendance_date, 1)";
    }
    
    const sql = `
        SELECT 
            ${timeGrouping} AS time_period,
            COUNT(CASE WHEN t_attendance.attendance_status = 1 THEN 1 END) AS present_count,
            COUNT(CASE WHEN t_attendance.attendance_status = 2 THEN 1 END) AS late_count,
            COUNT(CASE WHEN t_attendance.attendance_status = 3 THEN 1 END) AS absent_count,
            COUNT(t_attendance.attendance_id) AS total_classes
        FROM t_enrollments
        INNER JOIN t_subjects ON t_enrollments.subject_id = t_subjects.subject_id
        INNER JOIN t_attendance ON t_enrollments.subject_id = t_attendance.subject_id 
            AND t_enrollments.student_id = t_attendance.student_id
        WHERE t_enrollments.student_id = ?
            AND t_subjects.academic_year = ?
        GROUP BY time_period
        ORDER BY time_period;
    `;
    
    db.query(sql, [studentId, year], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        // แปลงข้อมูลให้เหมาะสำหรับการแสดงกราฟ
        const formattedResults = results.map(item => {
            let periodLabel;
            if (period === 'monthly') {
                // แปลงรูปแบบ YYYY-MM เป็นชื่อเดือน
                const [year, month] = item.time_period.split('-');
                const monthNames = [
                    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                ];
                periodLabel = `${monthNames[parseInt(month) - 1]} ${parseInt(year) + 543}`;
            } else {
                // แปลง YYYYWW เป็นรูปแบบ "สัปดาห์ที่ W เดือน M ปี Y"
                const yearWeek = item.time_period.toString();
                const year = yearWeek.substring(0, 4);
                const week = yearWeek.substring(4);
                periodLabel = `สัปดาห์ที่ ${week} ปี ${parseInt(year) + 543}`;
            }
            
            // คำนวณอัตราการเข้าเรียน
            const attendance_rate = item.total_classes > 0 
                ? ((item.present_count + item.late_count) / item.total_classes * 100).toFixed(2) 
                : 0;
            
            return {
                period: periodLabel,
                present: item.present_count,
                late: item.late_count,
                absent: item.absent_count,
                total: item.total_classes,
                attendance_rate: parseFloat(attendance_rate)
            };
        });
        
        res.json(formattedResults);
    });
});
  
module.exports = router;