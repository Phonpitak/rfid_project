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
// ฟังก์ชัน Sidebar
function setupSidebar() {
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
}

// ฟังก์ชัน Highlight เมนู
function setupMenuHighlight() {
    let menuItems = document.querySelectorAll(".link ul li");

    menuItems.forEach(item => {
        item.addEventListener("click", function() {
            menuItems.forEach(menu => menu.classList.remove("active"));
            this.classList.add("active");
            const link = this.querySelector("a").getAttribute("href");
            window.location.href = link; 
        });
    });
}
// คำนวณสรุปการเข้าเรียนรวม
function calculateOverallAttendanceSummary(data) {
    const overallSummary = {
        totalSubjects: 0,
        subjectDetails: []
    };

    Object.keys(data).forEach(day => {
        const subjects = data[day];
        Object.keys(subjects).forEach(subjectId => {
            const subject = subjects[subjectId];
            overallSummary.totalSubjects++;

            const subjectSummary = {
                name: subject.subject_name,
                present: subject.summary.present,
                late: subject.summary.late,
                absent: subject.summary.absent,
                attendanceRate: calculateAttendanceRate(subject.summary)
            };

            overallSummary.subjectDetails.push(subjectSummary);
        });
    });

    return overallSummary;
}

// คำนวณอัตราการเข้าเรียน
function calculateAttendanceRate(summary) {
    const totalClasses = summary.present + summary.late + summary.absent;
    const presentRate = (summary.present / totalClasses) * 100;
    return presentRate.toFixed(2);
}

// แสดงสรุปการเข้าเรียนทั้งหมด
function displayOverallAttendanceSummary(data) {
    const summary = calculateOverallAttendanceSummary(data);
    
    const summaryContainer = $('<div>').addClass('overall-attendance-summary');
    const summaryTitle = $('<h2>').text('สรุปการเข้าเรียนทั้งหมด');
    summaryContainer.append(summaryTitle);

    const totalSummary = $('<div>').addClass('total-summary')
        .html(`
            <p>จำนวนวิชาทั้งหมด: <strong>${summary.totalSubjects}</strong> วิชา</p>
        `);
    summaryContainer.append(totalSummary);

    const detailTable = $('<table>').addClass('subject-attendance-table');
    const thead = $('<thead>')
        .append($('<tr>')
            .append($('<th>').text('วิชา'))
            .append($('<th>').text('มา'))
            .append($('<th>').text('สาย'))
            .append($('<th>').text('ขาด'))
            .append($('<th>').text('อัตราการเข้าเรียน'))
        );
    detailTable.append(thead);

    const tbody = $('<tbody>');
    summary.subjectDetails.forEach(subject => {
        const row = $('<tr>')
            .append($('<td>').text(subject.name))
            .append($('<td>').text(subject.present))
            .append($('<td>').text(subject.late))
            .append($('<td>').text(subject.absent))
            .append($('<td>').text(`${subject.attendanceRate}%`));
        
        // เน้นสีตามอัตราการเข้าเรียน
        if (subject.attendanceRate < 60) {
            row.addClass('low-attendance');
        } else if (subject.attendanceRate >= 80) {
            row.addClass('high-attendance');
        }

        tbody.append(row);
    });

    detailTable.append(tbody);
    summaryContainer.append(detailTable);

    $('#attendance-records').prepend(summaryContainer);
}

function createAttendanceTable(data) {
    $('#attendance-records').empty().addClass('attendance-container');

    Object.keys(data).forEach(day => {
        const subjects = data[day];
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

            // สร้างอาร์เรย์ของวันที่เรียนทั้งหมดในวิชานี้
            const attendanceDates = Object.keys(subject.attendance);
            
            // ตรวจสอบว่ามีข้อมูลการเรียนหรือไม่
            if (attendanceDates.length > 0) {
                // เรียงลำดับวันที่
                attendanceDates.sort((a, b) => new Date(a) - new Date(b));

                attendanceDates.forEach(date => {
                    const row = $('<tr>');
                    row.append($('<td>').text(date));
                    row.append($('<td>').html(getStatusIcon(subject.attendance[date])));
                    tbody.append(row);
                });
            } 
            
            // ถ้าไม่มีข้อมูลการเรียน
            else {
                const currentDate = new Date();
                const row = $('<tr>')
                    .append($('<td>').text('ยังไม่มีข้อมูลการเรียน'))
                    .append($('<td>').html('<span class="status-pending">⏳</span>'));
                tbody.append(row);
            }

            const summaryRow = $('<tr>')
                .append($('<td>').text('รวม'))
                .append($('<td>').text(`มา: ${subject.summary.present}, สาย: ${subject.summary.late}, ขาด: ${subject.summary.absent}`));

            tbody.append(summaryRow);
            table.append(tbody);

            $('#attendance-records').append(subjectTitle).append(table);
        });
    });

    // เพิ่มสรุปการเข้าเรียนทั้งหมด
    displayOverallAttendanceSummary(data);
}

// แปลงสถานะเป็นไอคอน
function getStatusIcon(status) {
    switch (status) {
        case 1: return '<span class="status-present">✔️</span>';
        case 2: return '<span class="status-late">🕒</span>';
        case 3: return '<span class="status-absent">❌</span>';
        default: return '-';
    }
}

// ฟังก์ชันดึงข้อมูลการเข้าเรียน
async function fetchStudentAttendance() {
    let studentId = sessionStorage.getItem("student_id") || localStorage.getItem("student_id");

    if (!studentId || studentId === 'undefined' || studentId.trim() === '') {
        console.error("❌ student_id เป็นค่าว่าง หรือไม่ได้รับค่า");
        $('#attendance-records').html('<p>เกิดข้อผิดพลาด: ไม่พบรหัสนักศึกษา</p>');
        return;
    }

    studentId = String(studentId).trim();

    const academicYear = $('#academic-year').val();
    const term = $('#term').val();
    const year = $('#year').val();

    try {
        let response = await fetch(`/student_attendance?student_id=${studentId}&academic_year=${academicYear}&term=${term}&year=${year}`);
        let data = await response.json();

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

// เพิ่ม CSS สำหรับสถานะรอดำเนินการ
function addAttendanceStyles() {
    $('<style>')
        .text(`
            .overall-attendance-summary {
                background-color: #f4f4f4;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            }
            .total-summary {
                text-align: center;
                margin-bottom: 15px;
            }
            .subject-attendance-table {
                width: 100%;
                border-collapse: collapse;
            }
            .subject-attendance-table th, 
            .subject-attendance-table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center;
            }
            .low-attendance {
                background-color: #ffebee;
                color: #d32f2f;
            }
            .high-attendance {
                background-color: #e8f5e9;
                color: #2e7d32;
            }
            .status-pending {
                color: #FFA500; /* สีส้ม */
                font-weight: bold;
            }
        `)
        .appendTo('head');
}

// เตรียมหน้าเว็บเมื่อโหลดเสร็จ
$(document).ready(function () {
    // เพิ่ม CSS
    addAttendanceStyles();

    // อัปเดตชื่อโปรไฟล์
    updateProfileName();

    // จัดการสิทธิ์และเมนู
    const group_id = sessionStorage.getItem("Group");
    manageUserAccess(group_id);

    // ตรวจสอบ student_id
    const studentId = sessionStorage.getItem("student_id") || localStorage.getItem("student_id");
    
    if (!studentId || studentId === 'undefined' || studentId.trim() === '') {
        console.error("❌ student_id ไม่ถูกต้อง! กำลังโหลดจาก localStorage...");
        const storedUser = JSON.parse(localStorage.getItem('user_data'));

        if (storedUser && storedUser.u_id) {
            const newStudentId = storedUser.u_id;
            console.log("✅ Loaded student ID จาก localStorage:", newStudentId);
            sessionStorage.setItem("student_id", newStudentId);
            $('#studentId').text(newStudentId);
        } else {
            console.error("❌ ไม่พบค่า student_id ใน localStorage เช่นกัน!");
            alert("กรุณาเข้าสู่ระบบใหม่");
            location.href = "login.html";
            return;
        }
    }

    // ดึงข้อมูลการเข้าเรียน
    fetchStudentAttendance();
});



// ฟังก์ชัน Logout
function Logout() {
    sessionStorage.clear();
    location.href = "login.html";
}

// เปิด Modal หรือการทำงานอื่นๆ
function TB_Open() {
    console.log("TB_Open called");
    // เพิ่มโลจิกสำหรับเปิด Modal หรือการทำงานอื่นๆ
}
