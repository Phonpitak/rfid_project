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
document.addEventListener("DOMContentLoaded", () => {
    // เรียกฟังก์ชันโหลดรายวิชาเมื่อหน้าโหลดเสร็จ
    loadSubjects();

    // ฟังก์ชันโหลดรายวิชาจาก API
    async function loadSubjects() {
        try {
            const response = await fetch("/get_subjects");
            const subjects = await response.json();

            // เติมข้อมูลลงใน dropdown รายวิชา
            const subjectSelect = document.getElementById("subject_id");
            subjects.forEach(subject => {
                const option = document.createElement("option");
                option.value = subject.subject_id;
                option.textContent = `${subject.subject_code} - ${subject.subject_name}`;
                subjectSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error loading subjects:", error);
        }
    }

    // จัดการการส่งฟอร์ม
    document.getElementById("bulkRegistrationForm").addEventListener("submit", async (event) => {
        event.preventDefault(); // หยุดการ reload หน้า

        // ดึงค่าปีการศึกษาและรายวิชาจากฟอร์ม
        const stdYear = document.getElementById("std_year").value;
        const subjectId = document.getElementById("subject_id").value;

        if (stdYear && subjectId) {
            try {
                // ส่งคำขอลงทะเบียนไปที่ API
                const response = await fetch("/bulk_enroll", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ std_year: stdYear, subject_id: subjectId }),
                });

                if (response.ok) {
                    const message = await response.text();
                    swal({
                        title: "เพิ่มรายวิชา!",
                        text: "ข้อมูลบันทึกสำเร็จ!",
                        icon: "success",
                        button: "ตกลง",
                    }).then(() => {
                        document.getElementById("bulkRegistrationForm").reset(); // ล้างฟอร์ม
                        window.location.reload(); // รีเฟรชหน้า
                    });
                } else {
                    const error = await response.text();
                    swal({
                        title: "เกิดข้อผิดพลาด!",
                        text: `ไม่สามารถบันทึกข้อมูลได้: ${error}`,
                        icon: "error",
                        button: "ลองอีกครั้ง",
                    });
                }
            } catch (error) {
                console.error("Error during bulk registration:", error);
                swal({
                    title: "เกิดข้อผิดพลาด!",
                    text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
                    icon: "error",
                    button: "ลองอีกครั้ง",
                });
            }
        } else {
            swal({
                title: "ข้อมูลไม่ครบถ้วน!",
                text: "กรุณาเลือกปีการศึกษาและรายวิชา",
                icon: "warning",
                button: "ตกลง",
            });
        }
    });
});


function Logout() {
    sessionStorage.clear();
  }
  function TB_Open() {
    console.log("TB_Open called");
    // Add logic for opening modal or similar actions
}
// ดึงข้อมูลโปรไฟล์จาก sessionStorage
const firstName = sessionStorage.getItem('Firstname');
const lastName = sessionStorage.getItem('Lastname');
if (firstName && lastName) {
    document.getElementById('profile-name').innerText = `${firstName} ${lastName}`;
} else {
    console.log('No profile data found in sessionStorage');
}