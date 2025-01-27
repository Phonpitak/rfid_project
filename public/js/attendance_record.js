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
async function fetchSubjects() {
    try {
      // เรียก API ที่สร้างไว้
      const response = await fetch('/api/subjects'); // หรือ '/subjects' ถ้าไม่มี prefix
      const subjects = await response.json();
  
      // อ้างอิงถึง Dropdown
      const subjectDropdown = document.getElementById("t_subjects");
  
      // ล้างข้อมูลเก่าใน Dropdown
      subjectDropdown.innerHTML = '<option value="" disabled selected>เลือกวิชา</option>';
  
      // เติมข้อมูลวิชาจาก API
      subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject.id; // ใช้ ID เป็นค่า
        option.textContent = subject.subject_name; // ใช้ชื่อวิชาเป็นข้อความ
        subjectDropdown.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  }
  
  // เรียกใช้งานฟังก์ชันเมื่อโหลดหน้า
  document.addEventListener("DOMContentLoaded", fetchSubjects);
  

  // เรียกใช้ฟังก์ชันเมื่อโหลดหน้า
  window.onload = function () {
    fetchSubjects();

    // เติมข้อมูลวันที่
    const daySelect = document.getElementById("day-select");
    for (let i = 1; i <= 31; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      daySelect.appendChild(option);
    }

    // เติมข้อมูลเดือน
    const monthSelect = document.getElementById("month-select");
    const monthNames = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    monthNames.forEach((month, index) => {
      const option = document.createElement("option");
      option.value = index + 1;
      option.textContent = month;
      monthSelect.appendChild(option);
    });

    // เติมข้อมูลปี
    const yearSelect = document.getElementById("year-select");
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }
  };

  // ดึงข้อมูลโปรไฟล์จาก sessionStorage
const firstName = sessionStorage.getItem('Firstname');
const lastName = sessionStorage.getItem('Lastname');
if (firstName && lastName) {
    document.getElementById('profile-name').innerText = `${firstName} ${lastName}`;
} else {
    console.log('No profile data found in sessionStorage');
}

async function fetchSubjects() {
    try {
      // เรียก API ที่สร้างไว้
      const response = await fetch('/api/subjects'); // หรือ '/subjects' ถ้าไม่มี prefix
      const subjects = await response.json();
  
      // อ้างอิงถึง Dropdown
      const subjectDropdown = document.getElementById("t_subjects");
  
      // ล้างข้อมูลเก่าใน Dropdown
      subjectDropdown.innerHTML = '<option value="" disabled selected>เลือกวิชา</option>';
  
      // เติมข้อมูลวิชาจาก API
      subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject.id; // ใช้ ID เป็นค่า
        option.textContent = subject.subject_name; // ใช้ชื่อวิชาเป็นข้อความ
        subjectDropdown.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  }
  
  // เรียกใช้งานฟังก์ชันเมื่อโหลดหน้า
  document.addEventListener("DOMContentLoaded", fetchSubjects);
  

  // เรียกใช้ฟังก์ชันเมื่อโหลดหน้า
  window.onload = function () {
    fetchSubjects();

    // เติมข้อมูลวันที่
    const daySelect = document.getElementById("day-select");
    for (let i = 1; i <= 31; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      daySelect.appendChild(option);
    }

    // เติมข้อมูลเดือน
    const monthSelect = document.getElementById("month-select");
    const monthNames = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    monthNames.forEach((month, index) => {
      const option = document.createElement("option");
      option.value = index + 1;
      option.textContent = month;
      monthSelect.appendChild(option);
    });

    // เติมข้อมูลปี
    const yearSelect = document.getElementById("year-select");
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }
  };

$(document).ready(function () {
    ShowStatusData();  // ดึงข้อมูลเฉพาะผู้ใช้
});

function Logout() {
    sessionStorage.clear();
  }