document.addEventListener('DOMContentLoaded', function() {
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const imageDisplay = document.getElementById('imageDisplay');
    const imagePlaceholder = document.getElementById('imagePlaceholder');

    if (imageUpload) {
        imageUpload.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                imagePlaceholder.style.display = "none";
                imageDisplay.style.display = "block";

                reader.addEventListener("load", function () {
                    imageDisplay.setAttribute("src", this.result);
                });

                reader.readAsDataURL(file);

                // อัปโหลดไฟล์ไปยังเซิร์ฟเวอร์
                const formData = new FormData();
                formData.append('image', file);

                fetch('/upload', {
                    method: 'POST',
                    body: formData
                }).then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log('รูปภาพถูกอัปโหลดสำเร็จ');
                    } else {
                        console.error('เกิดข้อผิดพลาดในการอัปโหลด');
                    }
                }).catch(error => {
                    console.error('เกิดข้อผิดพลาด: ', error);
                });
            }
        });
    }
});

let sideBar = document.querySelector("aside");
let toggle = document.querySelector("#toggle");
let logo = document.querySelector("#topbar img");

// ฟังก์ชันสำหรับการสลับขนาด Sidebar
toggle.addEventListener("click", function (e) {
  if (sideBar.classList.contains("mini")) {
    sideBar.classList.remove("mini");
    sideBar.style.width = "14rem"; // ขยาย Sidebar
    logo.style.display = "block";  // แสดงโลโก้เมื่อขยาย
  } else {
    sideBar.classList.add("mini");
    sideBar.style.width = "4rem";  // ย่อ Sidebar
    logo.style.display = "none";   // ซ่อนโลโก้เมื่อย่อ
  }
});

// ฟังก์ชันสำหรับการสลับเมนูที่ถูกเลือก
let menuItems = document.querySelectorAll(".link ul li");

menuItems.forEach(item => {
  item.addEventListener("click", function() {
    // ลบคลาส 'active' ออกจากเมนูทั้งหมด
    menuItems.forEach(menu => menu.classList.remove("active"));
    
    // เพิ่มคลาส 'active' ให้กับเมนูที่ถูกคลิก
    this.classList.add("active");

    // เปลี่ยนเส้นทางไปยังหน้าที่เลือก
    const link = this.querySelector("a").getAttribute("href");
    window.location.href = link; // ไปที่ลิงก์ของเมนูที่เลือก
  });
});


function TB_Open() {
    // ตรวจสอบว่ามีเมนูที่ต้องการแสดงอยู่หรือไม่ ถ้ามีจะเปิดแสดง
    // นี่เป็นตัวอย่างการแสดงเมนู โดยสามารถกำหนดให้เมนูที่ถูกซ่อนไว้ปรากฏอีกครั้ง

    // สมมุติว่าเมนูถูกซ่อนโดยใช้ display:none
    $('.menu-item').each(function() {
        if ($(this).css('display') === 'none') {
            $(this).show(); // แสดงเมนูที่ถูกซ่อน
        }
    });

    console.log("Menu opened and displayed.");
}

$(document).ready(function () {
    var group_id = sessionStorage.getItem("Group");

    if (!group_id) {
        location.href = "login.html";
        return; 
    }

   
    if (group_id == 9) {
        TB_Open();
    } else if (group_id == 1 || group_id == 2) {
        $('#registerMenu').remove(); 
        $('#memberlist').remove();  
        $('#addsubject').remove();
        $('#register_all').remove();
        $('#year_1').remove();
        $('#year_2').remove();
        $('#year_3').remove();
        $('#year_4').remove();
    } else if (group_id == 5) {
        $('#registerMenu').remove(); 
        $('#register_all').remove();
        $('#memberlist').remove();  
        $('#addsubject').remove();
        $('#detailMenu').remove();
        $('#subjectMenu').remove();
        $('#attendanceMenu').remove();

        TB_Open(); 
    }
});

// ดึงข้อมูลโปรไฟล์จาก sessionStorage
const firstName = sessionStorage.getItem('Firstname');
const lastName = sessionStorage.getItem('Lastname');
if (firstName && lastName) {
    document.getElementById('profile-name').innerText = `${firstName} ${lastName}`;
} else {
    console.log('No profile data found in sessionStorage');
}

// ดึง user_id และข้อมูลนักเรียน
const user_id = sessionStorage.getItem("UserID");
if (user_id) {
    $.ajax({
        url: `detail/All/${user_id}`,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            if (data.length > 0) {
                const student = data[0];
                $('#studentId').text(student.user_id);
                $('#studentName').text(`${student.std_firstname} ${student.std_lastname}`);
                $('#studentBranch').text(student.b_branch);
                $('#studentFaculty').text(student.f_facully);
                $('#studentGroup').text(student.group_id);
                $('#studentyear').text(student.std_year);
                $('#studenterm').text(student.term);
            } else {
                console.error('No student data found');
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching student details:', textStatus, errorThrown);
        }
    });
} else {
    console.error('No user_id found in sessionStorage');
}

function Logout() {
    sessionStorage.clear();
  }
