// ฟังก์ชันสำหรับการสลับขนาด Sidebar
const sideBar = document.querySelector("aside"); // ดึง Sidebar
const toggle = document.getElementById("toggle"); // ดึงปุ่ม Toggle
const logo = document.querySelector(".logo"); // ตรวจสอบว่ามีหรือไม่


toggle.addEventListener("click", function (e) {
    if (sideBar.classList.contains("mini")) {
      sideBar.classList.remove("mini");
      sideBar.style.width = "14rem"; // ขยาย Sidebar
      
    } else {
      sideBar.classList.add("mini");
      sideBar.style.width = "4rem";  // ย่อ Sidebar
      
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
  $(document).ready(function () {
    if (typeof TB_Open === "function") {
      TB_Open();
    } else {
      console.error("Error: TB_Open() ไม่ถูกโหลด กรุณาตรวจสอบว่า thickbox.js ถูกโหลดหรือไม่");
    }
  });

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

// Modal
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("editModal").style.display = "none";
});

// Search
$(document).ready(function() {
    $("#search_custom").on("keyup", function() {
        var searchText = $(this).val().toLowerCase();
        
        $("#memberlist tr").each(function() {
            var rowText = $(this).text().toLowerCase(); // รวมทุกคอลัมน์ในแถวเดียว
            if (rowText.indexOf(searchText) > -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});

$(document).ready(function () {
    ShowUserData();
});

// เมื่อกด "บันทึก" ในฟอร์มแก้ไข
$('#editUserForm').on('submit', async function (e) {
    e.preventDefault();
    let userData = {
        user_id: $('#edit_user_id').val(),
        std_firstname: $('#edit_std_firstname').val(),
        std_lastname: $('#edit_std_lastname').val(),
        b_branch: $('#edit_b_branch').val(),
        f_facully: $('#edit_f_facully').val()
    };

    try {
        const response = await fetch("/member/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            Swal.fire({
                title: "อัปเดตข้อมูลสำเร็จ!",
                text: "ข้อมูลสมาชิกถูกอัปเดตเรียบร้อยแล้ว",
                icon: "success",
                confirmButtonText: "ตกลง"
            }).then(() => {
                closeModal();
                ShowUserData();
            });
        } else {
            Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถอัปเดตข้อมูลได้", "error");
        }
    } catch (error) {
        console.error("Error during update:", error);
        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
    }
});

// โหลดข้อมูลสมาชิก
function ShowUserData() {
    $.ajax({
        type: "GET",
        url: "/user/memberlist",
        success: function (data) {
            $('#memberlist').empty();
            data.forEach(function (user) {
                const row = `
                    <tr>
                        <td>${user.user_id}</td>
                        <td>${user.std_firstname} ${user.std_lastname}</td>
                        <td>${user.b_branch}</td>
                        <td>${user.f_facully}</td>
                        <td><button class="edit-btn" onclick="editUser('${user.user_id}')">✏️</button></td>
                        <td><button class="delete-btn" onclick="deleteUser('${user.user_id}')">🗑️</button></td>
                    </tr>`;
                $('#memberlist').append(row);
            });
        },
        error: function () {
            Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถโหลดข้อมูลได้", "error");
        }
    });
}

// ดึงข้อมูลสมาชิกมาแสดงใน Modal
function editUser(userId) {
    $.ajax({
        type: "GET",
        url: "/member/" + userId,
        success: function (data) {
            $('#edit_user_id').val(data.user_id);
            $('#edit_std_firstname').val(data.std_firstname);
            $('#edit_std_lastname').val(data.std_lastname);
            $('#edit_b_branch').val(data.b_branch);
            $('#edit_f_facully').val(data.f_facully);
            $('#editModal').show();
        },
        error: function () {
            Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถดึงข้อมูลผู้ใช้ได้", "error");
        }
    });
}

// ลบผู้ใช้
function deleteUser(userId) {
    Swal.fire({
        title: "คุณแน่ใจหรือไม่?",
        text: "คุณต้องการลบผู้ใช้ที่มี ID: " + userId + " หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            fetch("/member/delete/" + userId, { method: "DELETE" })
                .then(response => {
                    if (response.ok) {
                        Swal.fire({
                            title: "ลบสำเร็จ!",
                            text: "ผู้ใช้ถูกลบเรียบร้อยแล้ว",
                            icon: "success",
                            confirmButtonText: "ตกลง"
                        }).then(() => {
                            ShowUserData();
                        });
                    } else {
                        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบผู้ใช้ได้", "error");
                    }
                })
                .catch(error => {
                    console.error("Error during delete:", error);
                    Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
                });
        }
    });
}

// ปิด Modal
function closeModal() {
    $('#editModal').hide();
}


// เรียกใช้ฟังก์ชันเพื่อแสดงข้อมูลเมื่อโหลดหน้าเว็บ
$(document).ready(function () {
    ShowUserData();
});
function Logout() {
    sessionStorage.clear();
  }
  function TB_Open() {
    console.log("TB_Open function called!");
    // เพิ่มโค้ดอื่นๆ ที่คุณต้องการให้ทำงานเมื่อฟังก์ชันนี้ถูกเรียก
}


// ดึงข้อมูลโปรไฟล์จาก sessionStorage
const firstName = sessionStorage.getItem('Firstname');
const lastName = sessionStorage.getItem('Lastname');
if (firstName && lastName) {
    document.getElementById('profile-name').innerText = `${firstName} ${lastName}`;
} else {
    console.log('No profile data found in sessionStorage');
}

$(document).ready(function() {
    $("#search_TH").on("keyup", function() {
        var searchText = $(this).val().toLowerCase();
        
        $("#memberlist tr").each(function() {
            var id = $(this).find("td:eq(0)").text().toLowerCase();
            var name = $(this).find("td:eq(1)").text().toLowerCase();
            var branch = $(this).find("td:eq(2)").text().toLowerCase();
            var faculty = $(this).find("td:eq(3)").text().toLowerCase();
            
            if (id.indexOf(searchText) > -1 || 
                name.indexOf(searchText) > -1 || 
                branch.indexOf(searchText) > -1 || 
                faculty.indexOf(searchText) > -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});