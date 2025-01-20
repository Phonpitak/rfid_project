// JavaScript บนหน้าเว็บ

async function getStudentInfo(uid) {
    const response = await fetch('http://localhost:5002/rfid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid })
    });

    const data = await response.json();
    if (data.student) {
        console.log('Student Info:', data.student);
        // แสดงข้อมูลนักศึกษา เช่น ชื่อ หรือ ID บนหน้าเว็บ
    } else {
        console.log(data.message);
    }
}
