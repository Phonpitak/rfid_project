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
                    alert(message); // แสดงข้อความสำเร็จ
                    document.getElementById("bulkRegistrationForm").reset(); // ล้างฟอร์ม
                } else {
                    const error = await response.text();
                    alert(`เกิดข้อผิดพลาด: ${error}`);
                }
            } catch (error) {
                console.error("Error during bulk registration:", error);
                alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
            }
        } else {
            alert("กรุณาเลือกปีการศึกษาและรายวิชา");
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
