const express = require('express')
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs')
const multer = require('multer');
const path = require('path');
const saltRounds = 8;
const secret = 'your_secret_key';
const jwt = require('jsonwebtoken');

router.route('/user/login')
    .post((req, res, next) => {
        const sql = 'SELECT * FROM t_user WHERE std_username = ?'; // Query ที่ถูกต้อง
        const values = [req.body.std_username]; // กำหนดค่าที่จะใช้ใน query
        
        // เรียกใช้งาน query
        db.query(sql, values, function (error, result, fields) {
            if (error) {
                console.error('Database error:', error);
                res.json({ status: 'error', message: 'Database error' });
                return;
            }
            if (result.length === 0) {
                res.json({ status: 'error', message: 'No user found' });
                return;
            }
            
            // ใช้ bcrypt.compare เพื่อเช็ค password
            bcrypt.compare(req.body.std_password, result[0].std_password, function (err, match) {
                if (err) {
                    console.error('bcrypt error:', err); // แสดงข้อผิดพลาดของ bcrypt
                    res.json({ status: 'error', message: 'Internal server error' });
                    return;
                }
                if (match) {
                    // สร้าง JWT token
                    const token = jwt.sign({ std_username: result[0].std_username }, secret, { expiresIn: '1h' });

                    // เก็บข้อมูลในเซสชัน
                    req.session.user = {
                        u_id: result[0].u_id, // teacher_id
                        user_id: result[0].user_id,
                        std_username: result[0].std_username,
                        std_firstname: result[0].std_firstname,
                        std_lastname: result[0].std_lastname,
                        group_id: result[0].group_id,
                        std_year: result[0].std_year,
                        b_branch_id: result[0].b_branch_id,
                        b_branch: result[0].b_branch,
                        f_facully_id: result[0].f_facully_id,
                        f_facully: result[0].f_facully,
                        term: result[0].term,
                        rfid_id: result[0].rfid_id
                    };

                    console.log('Session data:', req.session.user); // ตรวจสอบข้อมูลที่เก็บในเซสชัน

                    // ส่งข้อมูลกลับไปยัง frontend
                    res.json({
                        status: 'SUCCESS',
                        message: 'Login Success',
                        token,
                        user: {
                            u_id: result[0].u_id, // teacher_id
                            user_id: result[0].user_id,
                            std_username: result[0].std_username,
                            std_firstname: result[0].std_firstname,
                            std_lastname: result[0].std_lastname,
                            group_id: result[0].group_id,
                            std_year: result[0].std_year,
                            b_branch_id: result[0].b_branch_id,
                            b_branch: result[0].b_branch,
                            f_facully_id: result[0].f_facully_id,
                            f_facully: result[0].f_facully,
                            term: result[0].term,
                            rfid_id: result[0].rfid_id
                        }
                    });
                } else {
                    res.json({ status: 'error', message: 'Login failed' });
                }
            });
        });
    });




    router.route('/user/login/authen')
    .post((req, res, next) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, secret);
            res.json({ status: 'SUCCESS', decoded });
        } catch (err) {
            res.status(401).json({ status: 'ERROR', message: err.message });
        }
    });

// API สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/users', (req, res) => {
    const sql = 'SELECT * FROM t_user';

    db.query(sql, values, (err, result) => {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ error: err.message }); // ส่งข้อความผิดพลาดกลับ
        } else {
          res.status(200).json({ message: 'SUCCESS' });
        }
      });
    });
    
    
    router.post('/user/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.error('Session destruction error:', err);
                res.status(500).json({ status: 'error', message: 'Logout failed' });
            } else {
                console.log('Session destroyed successfully');
                res.json({ status: 'SUCCESS', message: 'Logged out successfully' });
            }
        });
    });
    

    router.route('/user/reminder')        
    .post((req,res) => {
        var email = req.body.email;
        var password = req.body.password;
        var ID = req.body.card;
        var str = "SELECT u_id FROM t_user WHERE std_username = ? AND user_id = ?"  
        var str1 = "UPDATE t_user SET std_password= ? WHERE u_id = ?"
        
              db.query(str,[email,ID],function(error,results){
                  if(results.length > 0){
                      bcrypt.hash(req.body.password, 10, function(err, hash) {
                          if(err){
                              return  res.json('error2');
                          }else{
                              db.query(str1,[hash,results[0].u_id],function(error,results){
                                    if(error){
                                      return  res.json('error2');
                                    }else{
                                      return  res.json('success');
                                    }           
                              })
                          }   
                    });                            
                  } else{
                      return  res.json('error1');
                  }                      
              })                                
        });

    
        router.route('/user/register/CheckUser/') 
        .post((req,res) => {
          var user  = req.body.user;                             
              var str = 'SELECT * FROM t_user WHERE std_username = ?'

              db.query(str,[user],function (error,results) {
                  
                  if(error){
                      return res.send('error');
                  }else{
                      if(results.length > 0){
                          return res.send('error');
                      }else{
                          return res.send('success');
                      }                        
                  }
              });
        });

module.exports = router;