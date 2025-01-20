const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ใช้ connection pool ที่เราสร้างขึ้น


router.post('/rfid', async (req, res) => {
    try {
        const { value } = req.body;

        if (!value) {
            return res.status(400).send({ message: "No RFID value provided." });
        }

        const query = "SELECT * FROM t_user WHERE rfid_id = ?";
        const [rows] = await db.promise().query(query, [value]);

        console.log('Database rows:', rows);

        if (rows.length > 0) {
            return res.status(200).send({
                status: "allowed",
                data: rows
            });
        } else {
            return res.status(404).send({
                status: "denied",
                message: "Card not registered in database."
            });
        }
    } catch (err) {
        console.error("API Error:", err.message);
        return res.status(500).send({
            status: "API Failure",
            message: err.message
        });
    }
});

module.exports = router;

// routes/rfid.js
// router.post('/rfid', async (req, res) => {
//     try {
//         const { value } = req.body;
//         console.log(`Received RFID code: ${value}`);

//         if (!value) {
//             return res.status(400).send({
//                 status: "error",
//                 message: "No RFID value provided."
//             });
//         }

//         const result = await db.execute("SELECT * FROM t_user WHERE rfid_id = ?", [value]);

//         console.log('Database result:', result);

//         const rows = result[0];  // Destructure array ที่คืนมาจาก `execute`

//         if (rows.length > 0) {
//             const student = rows[0];
//             return res.status(200).send({
//                 status: "allowed",
//                 user_id: student.user_id,
//                 username: student.std_username,
//                 firstname: student.std_firstname,
//                 lastname: student.std_lastname,
//                 year: student.std_year,
//                 group_id: student.group_id,
//                 branch_id: student.b_branch_id,
//                 branch: student.b_branch,
//                 f_faculty_id: student.f_facully_id,
//                 f_faculty: student.f_facully,
//                 term: student.term
//             });
//         } else {
//             return res.status(404).send({
//                 status: "denied",
//                 message: "Card not registered"
//             });
//         }
//     } catch (err) {
//         console.error("API Error:", err.message);
//         return res.status(500).send({
//             status: "error",
//             message: "Internal server error.",
//             error: err.message
//         });
//     }
// });

// router.post('/rfid', async (req, res) => {
//     try {
//         const { value } = req.body;
//         console.log(`Received RFID code: ${value}`);

//         if (!value) {
//             return res.status(400).send({ message: "No RFID value provided." });
//         }

//         const query = "SELECT * FROM t_user WHERE rfid_id = ?";
//         db.execute(query, [value], (error, rows) => {
//             if (error) {
//                 console.error("Database Query Error:", error.message);
//                 return res.status(500).send({ status: "error", message: "Internal Server Error" });
//             }

//             console.log('Database rows:', rows);  // Debug log ข้อมูล query

//             if (rows.length > 0) {
//                 return res.status(200).send({
//                     status: "allowed",
//                     data: rows
//                 });
//             } else {
//                 return res.status(404).send({
//                     status: "denied",
//                     message: "Card not registered in database."
//                 });
//             }
//         });
//     } catch (err) {
//         console.error("API Error:", err.message);
//         return res.status(500).send({ status: "API Failure", message: err.message });
//     }
// });

