// ดึงข้อมูลโปรไฟล์จาก sessionStorage
const firstName = sessionStorage.getItem('Firstname');
const lastName = sessionStorage.getItem('Lastname');
if (firstName && lastName) {
    document.getElementById('profile-name').innerText = `${firstName} ${lastName}`;
} else {
    console.log('No profile data found in sessionStorage');
}
$(document).ready(async function () {
  // ✅ ดึงค่า group_id และ student_id จาก sessionStorage
  var group_id = sessionStorage.getItem("Group");
  var student_id = sessionStorage.getItem("student_id"); 

  console.log("✅ Group ID:", group_id);
  console.log("✅ Session Student ID:", student_id);

  // ✅ ถ้าไม่พบ student_id ให้ redirect ไปหน้า login
  if (!student_id || student_id === 'undefined' || student_id === '') {
      console.error("❌ ไม่พบค่า student_id, Redirecting to login...");
      alert("กรุณาเข้าสู่ระบบใหม่");
      location.href = "login.html";
      return;
  }

  // ✅ อัปเดต student_id ลงใน UI
  $('#studentId').text(student_id);

  // ✅ กำหนดสิทธิ์ของแต่ละกลุ่ม
  if (group_id == 9) {
      console.log("✅ Admin Group - เปิด TB_Open()");
      TB_Open();
  } else if (group_id == 1 || group_id == 2) {
      removeElements([
          '#registerMenu', '#memberlist', '#addsubject', '#register_all',
          '#year_1', '#year_2', '#year_3', '#year_4'
      ]);
  } else if (group_id == 5) {
      removeElements([
          '#registerMenu', '#register_all', '#memberlist', '#addsubject',
          '#detailMenu', '#subjectMenu', '#attendanceMenu'
      ]);
      TB_Open();
  } else {
      console.warn("⚠️ ไม่พบการตั้งค่าสำหรับ group_id:", group_id);
  }

 
});

// ✅ ฟังก์ชันลบเมนูที่ไม่เกี่ยวข้อง
function removeElements(selectors) {
  selectors.forEach(selector => {
      if ($(selector).length > 0) {
          $(selector).remove();
      }
  });
}

$(document).ready(async function () {
  let studentId = sessionStorage.getItem("student_id"); 

  console.log("🔍 กำลังตรวจสอบ student_id:", studentId);

  if (!studentId || studentId === 'undefined' || studentId.trim() === '') {
      console.error("❌ student_id ไม่ถูกต้อง! กำลังโหลดจาก localStorage...");
      const storedUser = JSON.parse(localStorage.getItem('user_data'));

      if (storedUser && storedUser.u_id) {
          studentId = storedUser.u_id;
          console.log("✅ Loaded student ID จาก localStorage:", studentId);
          sessionStorage.setItem("student_id", studentId); // อัปเดต sessionStorage ใหม่
      } else {
          console.error("❌ ไม่พบค่า student_id ใน localStorage เช่นกัน!");
          alert("กรุณาเข้าสู่ระบบใหม่");
          location.href = "login.html";
          return;
      }
  }

  $('#studentId').text(studentId); // อัปเดต studentId บน UI

  console.log("📌 ใช้ student_id:", studentId);
  await fetchStudentAttendance(studentId);
});

// ✅ ฟังก์ชันดึงข้อมูลการเข้าเรียน
async function fetchStudentAttendance() {
  let studentId = sessionStorage.getItem("student_id") || localStorage.getItem("student_id");

  console.log('📌 ตรวจสอบ student_id ก่อนเรียก API:', studentId);
  console.log('📌 Type of studentId:', typeof studentId);

  if (!studentId || studentId === 'undefined' || studentId.trim() === '') {
      console.error("❌ student_id เป็นค่าว่าง หรือไม่ได้รับค่า");
      $('#attendance-records').html('<p>เกิดข้อผิดพลาด: ไม่พบรหัสนักศึกษา</p>');
      return;
  }

  studentId = String(studentId).trim(); // แปลงเป็น String และลบช่องว่าง

  const academicYear = $('#academic-year').val();
  const term = $('#term').val();
  const year = $('#year').val();

  console.log('📌 Query Parameters ที่กำลังส่งไป API:', {
      student_id: studentId, academic_year: academicYear, term: term, year: year
  });

  try {
      let response = await fetch(`/student_attendance?student_id=${studentId}&academic_year=${academicYear}&term=${term}&year=${year}`);
      let data = await response.json();

      console.log('✅ Data received:', data);
      if (data && Object.keys(data).length > 0) {
          createAttendanceTable(data);
      } else {
          $('#attendance-records').html('<p>ไม่มีข้อมูลการเข้าชั้นเรียน</p>');
      }
  } catch (error) {
      console.error('❌ Error fetching attendance data:', error);
      $('#attendance-records').html('<p>เกิดข้อผิดพลาดในการดึงข้อมูล</p>');
  }
}

// ✅ ฟังก์ชันสร้างตารางข้อมูลเข้าเรียน
function createAttendanceTable(data) {
  $('#attendance-records').empty().addClass('attendance-container');

  Object.keys(data).forEach(day => {
      const subjects = data[day];

      // ✅ แสดงชื่อวัน (เช่น "วันอังคาร")
      const dayTitle = $('<h2>').addClass('attendance-header').text(`วัน${day}`);
      $('#attendance-records').append(dayTitle);

      Object.keys(subjects).forEach(subjectId => {
          const subject = subjects[subjectId];
          const subjectTitle = $('<h3>').addClass('attendance-header').text(`วิชา: ${subject.subject_name}`);

          const table = $('<table>').addClass('attendance-table');
          const thead = $('<thead>');
          const headerRow = $('<tr>')
              .append($('<th>').text('วันที่'))
              .append($('<th>').text('สถานะ'));

          thead.append(headerRow);
          table.append(thead);

          const tbody = $('<tbody>');

          Object.keys(subject.attendance).forEach(date => {
              const row = $('<tr>');
              row.append($('<td>').text(date));
              row.append($('<td>').html(getStatusIcon(subject.attendance[date])));
              tbody.append(row);
          });

          // ✅ สรุปผล (จำนวนที่มาเรียน, สาย, ขาด)
          const summaryRow = $('<tr>')
              .append($('<td>').text('รวม'))
              .append($('<td>').text(`มา: ${subject.summary.present}, สาย: ${subject.summary.late}, ขาด: ${subject.summary.absent}`));

          tbody.append(summaryRow);
          table.append(tbody);

          $('#attendance-records').append(subjectTitle).append(table);
      });
  });
}

// ✅ ฟังก์ชันแปลงสถานะเป็นไอคอน
function getStatusIcon(status) {
  switch (status) {
      case 1: return '<span class="status-present">✔️</span>';  // มาเรียน (เขียว)
      case 2: return '<span class="status-late">🕒</span>';      // มาสาย (ส้ม)
      case 3: return '<span class="status-absent">❌</span>';    // ขาดเรียน (แดง)
      default: return '-';   // ไม่มีข้อมูล
  }
}

// ✅ เมนู Sidebar
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

// ✅ ระบบ Highlight เมนูที่เลือก
let menuItems = document.querySelectorAll(".link ul li");

menuItems.forEach(item => {
  item.addEventListener("click", function() {
      menuItems.forEach(menu => menu.classList.remove("active"));
      this.classList.add("active");
      const link = this.querySelector("a").getAttribute("href");
      window.location.href = link; 
  });
});

// ✅ ฟังก์ชัน Logout
function Logout() {
  sessionStorage.clear();
  location.href = "login.html";
}
function TB_Open() {
  console.log("TB_Open called");
  // Add logic for opening modal or similar actions
}
