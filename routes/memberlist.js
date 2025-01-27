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

router.get('/member/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT user_id, std_firstname, std_lastname, b_branch, f_facully FROM t_user WHERE user_id = ?';
  db.query(sql, [userId], (err, result) => {
      if (err) {
          res.status(500).json({ error: 'Database error' });
      } else {
          res.json(result[0]); // ส่งข้อมูลผู้ใช้กลับ
      }
  });
});

router.put('/member/update', (req, res) => {
  const { user_id, std_firstname, std_lastname, b_branch, f_facully } = req.body;
  const sql = 'UPDATE t_user SET std_firstname = ?, std_lastname = ?, b_branch = ?, f_facully = ? WHERE user_id = ?';

  db.query(sql, [std_firstname, std_lastname, b_branch, f_facully, user_id], (err, result) => {
      if (err) {
          res.status(500).json({ error: 'Database error' });
      } else {
          res.json({ message: 'Updated successfully' });
      }
  });
});


module.exports = router;