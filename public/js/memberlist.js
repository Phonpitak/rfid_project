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

// ในไฟล์ memberlist.js
$(document).ready(function() {
    // โหลดข้อมูลเมื่อหน้าเว็บโหลดเสร็จ
    ShowUserData();

    // จัดการกับฟอร์มแก้ไข
    $('#editUserForm').on('submit', function(e) {
        e.preventDefault();
        
        const userData = {
            user_id: $('#edit_user_id').val(),
            std_firstname: $('#edit_std_firstname').val(),
            std_lastname: $('#edit_std_lastname').val(),
            b_branch: $('#edit_b_branch').val(),
            f_facully: $('#edit_f_facully').val()
        };

        $.ajax({
            type: "PUT",
            url: "/member/update",
            contentType: "application/json",
            data: JSON.stringify(userData),
            success: function(response) {
                $('#editUserModal').modal('hide');
                alert('อัพเดทข้อมูลสำเร็จ');
                ShowUserData();
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
                alert('เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
            }
        });
    });
});

// ฟังก์ชันแสดงข้อมูลในตาราง
function ShowUserData() {
    $.ajax({
        type: "GET",
        url: "/user/memberlist",
        success: function (data) {
            $('#memberlist').empty();
            data.forEach(function(user) {
                const row = `
                    <tr>
                        <td class="text-center">${user.user_id}</td>
                        <td class="text-center">${user.std_firstname} ${user.std_lastname}</td>
                        <td class="text-center">${user.b_branch}</td>
                        <td class="text-center">${user.f_facully}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-warning btn-sm" onclick="editUser('${user.user_id}')">
                                <i class="bi bi-pencil-square"></i> แก้ไข
                            </button>
                        </td>
                        <td class="text-center">
                            <button type="button" class="btn btn-danger btn-sm" onclick="deleteUser('${user.user_id}')">
                                <i class="bi bi-trash"></i> ลบ
                            </button>
                        </td>
                    </tr>
                `;
                $('#memberlist').append(row);
            });
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
        }
    });
}

// ฟังก์ชันแก้ไขข้อมูล
function editUser(userId) {
    $.ajax({
        type: "GET",
        url: "/member/" + userId,
        success: function(data) {
            $('#edit_user_id').val(data.user_id);
            $('#edit_std_firstname').val(data.std_firstname);
            $('#edit_std_lastname').val(data.std_lastname);
            $('#edit_b_branch').val(data.b_branch);
            $('#edit_f_facully').val(data.f_facully);
            
            $('#editUserModal').modal('show');
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
        }
    });
}
function deleteUser(userId) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ที่มี ID: ' + userId + '?')) {
        // ใส่ลอจิกลบที่นี่
        alert('ผู้ใช้ที่มี ID: ' + userId + ' ถูกลบแล้ว');
    }
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
// เพิ่มโค้ดนี้ในไฟล์ memberlist.js
$(document).ready(function() {
    $('#editUserModal').on('show.bs.modal', function () {
        $('body').addClass('modal-open-fix');
    });

    $('#editUserModal').on('hidden.bs.modal', function () {
        $('body').removeClass('modal-open-fix');
        $('.modal-backdrop').remove();
        $('body').css({
            'padding-right': '0',
            'overflow': 'visible'
        });
    });
});

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