const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.get('/recode/:user_id', (req, res) => {
  const user_id = req.params.user_id; // รับค่า user_id จาก URL parameter
  
  // query ข้อมูลจากตาราง t_status โดยเชื่อมกับ rfid_id จากตาราง t_user
  const sql = `
    SELECT t_status.*
    FROM t_status 
    JOIN t_user ON t_status.rfid_id = t_user.rfid_id  -- เชื่อม rfid_id
    WHERE t_user.user_id = ?`;  // กรองด้วย user_id

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(result); // ส่งข้อมูลกลับ
    }
  });
});





module.exports = router;