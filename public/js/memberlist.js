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

// ฟังก์ชันเพื่อดึงข้อมูลและแสดงผลในตาราง
function ShowUserData() {
    $.ajax({
        type: "GET",
        url: "/user/memberlist", // URL สำหรับดึงข้อมูล
        success: function (data) {
            $('#memberlist').empty(); // ล้างข้อมูลในตารางก่อนแสดงข้อมูลใหม่
            var tr;
            for (var i = 0; i < data.length; i++) {
                tr = $('<tr/>');
                tr.append("<td class='text-center'>" + data[i].user_id + "</td>");
                tr.append("<td class='text-center'>" + data[i].std_firstname + " " + data[i].std_lastname + "</td>");
                tr.append("<td class='text-center'>" + data[i].b_branch + "</td>");
                tr.append("<td class='text-center'>" + data[i].f_facully + "</td>");
                tr.append("<td class='text-center'><button class='btn btn-edit' onclick='editUser(" + data[i].user_id + ")'>Edit</button></td>");
                tr.append("<td class='text-center'><button class='btn btn-delete' onclick='deleteUser(" + data[i].user_id + ")'>Delete</button></td>");
                $('#memberlist').append(tr); // เพิ่มแถวลงในตาราง
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', status, error);
            alert('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + status + ' ' + error);
        }
    });
}

// ฟังก์ชันสำหรับแก้ไขและลบ
function editUser(userId) {
    alert('คุณต้องการแก้ไขข้อมูลของผู้ใช้ที่มี ID: ' + userId);
    // ใส่ลอจิกแก้ไขที่นี่
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