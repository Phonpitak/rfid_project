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

$("#search_TH").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#show_Detail ").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });

let sideBar = document.querySelector("aside");
let toggle = document.querySelector("#toggle");
let logo = document.querySelector("#topbar img");


toggle.addEventListener("click", function (e) {
  if (sideBar.classList.contains("mini")) {
    sideBar.classList.remove("mini");
    sideBar.style.width = "16rem"; 
    logo.style.display = "block";  
  } else {
    sideBar.classList.add("mini");
    sideBar.style.width = "4rem";  
    logo.style.display = "none";  
  }
});

// 
let menuItems = document.querySelectorAll(".link ul li");

menuItems.forEach(item => {
  item.addEventListener("click", function() {
    menuItems.forEach(menu => menu.classList.remove("active"));
    this.classList.add("active");
    const link = this.querySelector("a").getAttribute("href");
    window.location.href = link; 
  });
});


function ShowStatusData() {
    var userID = sessionStorage.getItem('UserID');
    var rfid_id = sessionStorage.getItem('RFID_ID');

    if (userID) {
        $.ajax({
            type: "GET",
            url: "/recode/" + userID,  
            success: function (data) {
                $('#show_Detail').empty();  
                var tr;
                for (var i = 0; i < data.length; i++) {
                    console.log(data[i].s_status);
                    tr = $('<tr/>');
                    tr.append("<td class='text-center'>" + data[i].s_date + "</td>");
                    tr.append("<td class='text-center'>" + data[i].s_study_period + "</td>");
                    tr.append("<td class='text-center'>" + data[i].sj_subject_id + "</td>");
                    tr.append("<td class='text-center'>" + data[i].sj_subject_name + "</td>");
                    tr.append("<td class='text-center'>" + data[i].t_teacher_id + "</td>");
                    tr.append("<td class='text-center'>" + data[i].t_teacher_name + "</td>");
                    tr.append("<td class='text-center'>" + data[i].s_class_id + "</td>");

                    if (data[i].s_status == 1) {
                        tr.append("<td class='text-center'><span class='label label-normal'>ปกติ</span></td>");
                    } else if (data[i].s_status == 2) {
                        tr.append("<td class='text-center'><span class='label label-late'>สาย</span></td>");
                    } else if (data[i].s_status == 3) {
                        tr.append("<td class='text-center'><span class='label label-absent'>ขาด</span></td>");
                    }

                    $('#show_Detail').append(tr);    
                }
            },
            error: function (xhr, status, error) {
                console.error('Error:', status, error);
                alert('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + status + ' ' + error);
            }
        });
    } else {
        alert('ไม่พบข้อมูล UserID ใน sessionStorage');
    }
}


$(document).ready(function () {
    ShowStatusData();  // ดึงข้อมูลเฉพาะผู้ใช้
});

function Logout() {
    sessionStorage.clear();
  }