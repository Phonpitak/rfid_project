const express = require('express');
const router  = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs')
const saltRounds = 8;

// เพิ่มผู้ใช้ใหม่
router.post('/register/user', (req, res) => {
    const { 
        user_id, 
        std_username, 
        std_password, 
        std_firstname, 
        std_lastname, 
        std_year, 
        group_id, 
        b_branch_id, 
        b_branch, 
        f_facully_id, 
        f_facully, 
        term 
    } = req.body;

    // เข้ารหัสรหัสผ่านก่อนบันทึกลงฐานข้อมูล
    bcrypt.hash(std_password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('ERROR');
        }

        // สร้าง query สำหรับเพิ่มข้อมูลเข้าไปใน database
        const sql = 'INSERT INTO t_user (user_id, std_username, std_password, std_firstname, std_lastname, std_year, group_id, b_branch_id, b_branch, f_facully_id, f_facully, term) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        // ค่าเพื่อแทนที่เครื่องหมายคำถามใน query โดยใช้รหัสผ่านที่เข้ารหัสแล้ว
        const values = [user_id, std_username, hashedPassword, std_firstname, std_lastname, std_year, group_id, b_branch_id, b_branch, f_facully_id, f_facully, term];

        // รัน query
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                res.status(500).send('ERROR');
            } else {
                res.status(200).send('SUCCESS');
            }
        });
    });
});


module.exports = router;