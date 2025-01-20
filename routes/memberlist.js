const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.get('/user/memberlist', (req, res) => {
  const sql = 'SELECT user_id, std_firstname, std_lastname, b_branch , f_facully, std_year , term FROM t_user';

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(result); // ส่งข้อมูลกลับ
    }
  });
});


module.exports = router;