

function click_Login(event) { 
    event.preventDefault(); // หยุดการทำงานปกติของปุ่ม submit

    // ดึงข้อมูลจากฟอร์ม
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;
    // ใช้ localhost
    axios.post('http://10.10.52.71.:5004/user/login', {
    // ใช้ ngrok URL จริง
    // axios.post(' https://25f3-203-158-222-50.ngrok-free.app/user/login', {
        std_username: username,
        std_password: password
    }, { withCredentials: true }) // สำคัญ! เพื่อให้ cookies ส่งไปด้วย
    .then(response => {
        console.log('Response from login API:', response.data);
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
            if (group == 5) { 
                console.log('Login as teacher, redirecting to year overview.');
                window.location.href = 'year_1.html';
            } else {
                console.log('Login as student, redirecting to detail.html');
                window.location.href = 'detail.html';
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
    localStorage.removeItem('authToken');
    document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = 'login.html';
}
