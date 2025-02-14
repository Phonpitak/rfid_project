const express = require('express');
const router  = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');


// กำหนดเส้นทางสำหรับจัดเก็บไฟล์ที่อัปโหลด
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/img/uploaduser'); // โฟลเดอร์สำหรับอัปโหลด
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const imgPath = '/img/uploaduser/' + req.file.filename; // เส้นทางไฟล์ที่บันทึก
  const userId = req.body.userId || 1; // รับ userId เพื่ออัปเดตข้อมูล ถ้าไม่มี ให้ใช้ค่า default เป็น 1

  // บันทึกเส้นทางรูปภาพลงฐานข้อมูล
  db.query(
      'UPDATE t_user SET std_img = ? WHERE id = ?',
      [imgPath, userId],
      (error, results) => {
          if (error) {
              console.error('Database error: ', error); // เพิ่มการ log ข้อผิดพลาด
              return res.status(500).json({ success: false, message: 'Database error' });
          }
          res.json({ success: true, message: 'File uploaded successfully' });
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


  
module.exports = router;