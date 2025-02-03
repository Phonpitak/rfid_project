function click_Login(event) { 
    event.preventDefault(); // หยุดการทำงานปกติของปุ่ม submit

    // ดึงข้อมูลจากฟอร์ม
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;

    // ส่งข้อมูลเข้าสู่ระบบไปยัง API
    axios.post('http://localhost:5002/user/login', {
        std_username: username,
        std_password: password
    })
    .then(response => {
        console.log('Response from login API:', response.data); // ตรวจสอบข้อมูลที่ได้รับจาก API
        if (response.data.status === 'SUCCESS') {
            // เก็บ token ลงใน localStorage
            localStorage.setItem('authToken', response.data.token);

            // เก็บข้อมูลผู้ใช้ลงใน sessionStorage
            sessionStorage.setItem("TeacherID", response.data.user.u_id);
            sessionStorage.setItem("student_id", response.data.user.u_id);
            sessionStorage.setItem("U_ID", response.data.user.u_id);
            sessionStorage.setItem("UserID", response.data.user.user_id);
            sessionStorage.setItem("Username", response.data.user.std_username);
            sessionStorage.setItem("Firstname", response.data.user.std_firstname);
            sessionStorage.setItem("Lastname", response.data.user.std_lastname);
            sessionStorage.setItem("Group", response.data.user.group_id);
            sessionStorage.setItem("Year", response.data.user.std_year);
            sessionStorage.setItem("Branch_ID", response.data.user.b_branch_id);
            sessionStorage.setItem("Branch", response.data.user.b_branch);
            sessionStorage.setItem("Facully_ID", response.data.user.f_facully_id);
            sessionStorage.setItem("Facully", response.data.user.f_facully);
            sessionStorage.setItem("Term", response.data.user.term);
            sessionStorage.setItem("RFID_ID", response.data.user.rfid_id);

            console.log('User info saved to sessionStorage:', {
                TeacherID: sessionStorage.getItem('TeacherID'),
                Group: sessionStorage.getItem('Group'),
            });

            // ตรวจสอบ Group ของผู้ใช้
            const group = response.data.user.group_id;
            if (group == 5) { // ถ้าเป็นอาจารย์
                console.log('Login as teacher, redirecting to year overview.');
                window.location.href = 'year_1.html'; // หน้าใหม่สำหรับอาจารย์
            } else {
                console.log('Login as student, redirecting to detail.html');
                window.location.href = 'detail.html'; // หน้าปกติสำหรับนักเรียน
            }
        } else {
            alert('Login failed: ' + response.data.message);
        }
    })    
    .catch(error => {
        console.error('Login error:', error);
        alert('An error occurred. Please try again.');
    });
}

async function Click_reminder(event) {
    event.preventDefault(); // หยุดการทำงานปกติของฟอร์ม

    var email = document.getElementById("reminder_email").value;
    var password = document.getElementById("reminder_password").value;
    var password1 = document.getElementById("reminder_password_verify").value;
    var card = document.getElementById("reminder_card").value;

    // ตรวจสอบข้อมูลผู้ใช้และรหัสผ่าน
    var CheckUser = await reminder_CheckUser();
    var CheckPassword = reminder_CheckPassword();
    var CheckPasswordVerify = reminder_CheckPasswordVerify();
    var card_number = reminder_card1();

    // ตรวจสอบว่าทุกอย่างถูกต้อง
    if (CheckUser === 1 && CheckPassword === 1 && password === password1 && card.length === 13) {
        var data_Register = { "email": email, "password": password, "card": card };
        
        $.ajax({
            type: "POST",
            url: "/user/reminder",
            data: data_Register,
            success: function (data) {
                console.log(data); // ตรวจสอบผลลัพธ์จากเซิร์ฟเวอร์
                if (data === "success") {
                    swal("Success!", "Reminder account success!", "success").then((value) => {
                        window.location = 'login.html'; // ใช้ window.location
                    });
                } else {
                    swal("False!", "Reminder account error!", "error").then((value) => {});
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error occurred: " + textStatus, errorThrown); // ตรวจสอบข้อผิดพลาด
            }
        });
    } else {
        // จัดการข้อผิดพลาดที่เกิดขึ้น
    }
}


// ฟังก์ชันตรวจสอบอีเมล
function reminder_CheckUser() {
    return new Promise((resolve, reject) => {
        var user = document.getElementById("reminder_email").value;
        if (user.length < 10) {
            document.getElementById("MS_reminder_email").innerText = "Invalid email.";
            resolve(0);
        } else {
            document.getElementById("MS_reminder_email").innerText = "";
            resolve(1);
        }
    });
}

// ฟังก์ชันตรวจสอบรหัสผ่าน
function reminder_CheckPassword() {
    var password = document.getElementById("reminder_password").value;
    if (password.length < 6) {
        document.getElementById("MS_reminder_password").innerText = "Password too short.";
        return 0;
    } else {
        document.getElementById("MS_reminder_password").innerText = "";
        return 1;
    }
}

// ฟังก์ชันตรวจสอบการยืนยันรหัสผ่าน
function reminder_CheckPasswordVerify() {
    var password = document.getElementById("reminder_password").value;
    var password1 = document.getElementById("reminder_password_verify").value;

    if (password !== password1) {
        document.getElementById("MS_reminder_password_verify").innerText = "Passwords do not match.";
        return 0;
    } else {
        document.getElementById("MS_reminder_password_verify").innerText = "";
        return 1;
    }
}

// ฟังก์ชันตรวจสอบหมายเลขบัตรประชาชน
function reminder_card1() {
    var card = document.getElementById("reminder_card").value;
    if (card.length !== 13) {
        document.getElementById("MS_reminder_card").innerText = "ID card must be 13 digits.";
        return 0;
    } else {
        document.getElementById("MS_reminder_card").innerText = "";
        return 1;
    }
}

document.getElementById('link-reminder-login').addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-reminder').style.display = 'block';
});
function Logout() {
    sessionStorage.clear();
  }