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
// ฟังก์ชันสำหรับส่งข้อมูลฟอร์มเพิ่มรายวิชา
async function submitSubjectForm(event) {
    event.preventDefault();

    // เลือกฟอร์มจาก DOM
    const form = event.target;

    // เก็บข้อมูลจากฟอร์มลงในออบเจกต์
    const formData = new FormData(form);
    const subjectData = {};
    formData.forEach((value, key) => {
        subjectData[key] = value;
    });

    try {
        // ส่งข้อมูลไปยังเซิร์ฟเวอร์ผ่าน Fetch API
        const response = await fetch("/add_subject", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(subjectData),
        });

        // ตรวจสอบผลลัพธ์
        if (response.ok) {
            const result = await response.text();
            swal({
                title: "เพิ่มรายวิชา!",
                text: result,
                icon: "success",
                button: "ตกลง",
            }).then(() => {
                form.reset(); // ล้างฟอร์มหลังส่งสำเร็จ
            });
        } else {
            const errorMessage = await response.text();
            swal({
                title: "เกิดข้อผิดพลาด!",
                text: errorMessage || "ไม่สามารถเพิ่มรายวิชาได้",
                icon: "error",
                button: "ลองอีกครั้ง",
            });
        }
    } catch (error) {
        console.error("Error:", error);
        swal({
            title: "เกิดข้อผิดพลาด!",
            text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
            icon: "error",
            button: "ลองอีกครั้ง",
        });
    }
}

// เพิ่ม event listener ให้กับฟอร์มเมื่อ DOM โหลดเสร็จ
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    form.addEventListener("submit", submitSubjectForm);
});

function Logout() {
    sessionStorage.clear();
  }
  