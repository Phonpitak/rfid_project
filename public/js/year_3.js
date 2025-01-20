$(document).ready(function() {
    const teacherId = sessionStorage.getItem('TeacherID');  // ดึงข้อมูล TeacherID จาก sessionStorage หรือเปลี่ยนตามที่คุณใช้เก็บค่า

    // ตรวจสอบว่า teacherId มีค่าหรือไม่
    if (!teacherId) {
        console.error('Teacher ID not found. Please log in again.');
        alert('กรุณาเข้าสู่ระบบใหม่');
        window.location.href = 'login.html'; // ถ้าไม่มี TeacherID ให้ redirect ไปยังหน้า login
    } else {
        fetchAttendanceData(teacherId); // เรียกฟังก์ชัน fetchAttendanceData เพื่อดึงข้อมูล
    }
});

function handleAccessControl(group_id) {
    if (group_id == 9) {
        TB_Open();
    } else if (group_id == 1 || group_id == 2) {
        removeElements(['registerMenu', 'memberlist', 'addsubject', 'register_all', 'year_1', 'year_2', 'year_3', 'year_4']);
    } else if (group_id == 5) {
        removeElements(['registerMenu', 'register_all', 'memberlist', 'addsubject', 'detailMenu', 'subjectMenu', 'attendanceMenu']);
        TB_Open();
    }
}

function removeElements(ids) {
    ids.forEach(id => $(`#${id}`).remove());
}
// ดึงข้อมูลโปรไฟล์จาก sessionStorage
const firstName = sessionStorage.getItem('Firstname');
const lastName = sessionStorage.getItem('Lastname');
if (firstName && lastName) {
    document.getElementById('profile-name').innerText = `${firstName} ${lastName}`;
} else {
    console.log('No profile data found in sessionStorage');
}
// ดึงข้อมูลจาก API
function fetchAttendanceData(teacherId) {
    $.ajax({
        url: `/attendance3?teacher_id=${teacherId}&year=3`,
        method: 'GET',
        success: function (data) {
            if (data && Object.keys(data).length > 0) {
                createTablesByDayAndSubject(data); // ส่งข้อมูลไปสร้างตาราง
            } else {
                $('#attendance-records').html('<p>ไม่มีข้อมูลการเข้าชั้นเรียน</p>');
            }
        },
        error: function (error) {
            console.error('Error fetching attendance data:', error);
            $('#attendance-records').html('<p>เกิดข้อผิดพลาดในการดึงข้อมูล</p>');
        }
    });
}

// สร้างตารางตามวันและวิชา
function createTablesByDayAndSubject(data) {
    console.log('Data received for table generation:', data); // Debug ข้อมูลที่ส่งมาจาก API
    $('#attendance-records').empty();

    Object.keys(data).sort().forEach(dayOfWeek => {
        const dayData = data[dayOfWeek];
        const dayTitle = $('<h2>').text(`วัน${dayOfWeekToText(dayOfWeek)}`);
        $('#attendance-records').append(dayTitle);

        Object.keys(dayData).forEach(subjectId => {
            const subjectData = dayData[subjectId];
            const subjectTitle = $('<h3>').text(`วิชา: ${subjectData.subject_name}`);
            const table = createAttendanceTable(subjectData.students, parseInt(dayOfWeek));

            $('#attendance-records')
                .append(subjectTitle)
                .append(table);
        });
    });
}

// สร้างตารางข้อมูลการเข้าเรียน
function createAttendanceTable(students, dayOfWeek) {
    const table = $('<table>').addClass('attendance-table');
    const thead = $('<thead>');
    const dates = generateDates('2024-11-18', dayOfWeek);

    // Create header
    const headerRow = $('<tr>')
        .append($('<th>').text('รหัสนักศึกษา'))
        .append($('<th>').text('ชื่อ - นามสกุล'));

    dates.forEach(date => {
        headerRow.append($('<th>').text(`${date.day}/${date.month}`));
    });

    headerRow.append($('<th>').text('สรุป'));
    thead.append(headerRow);
    table.append(thead);

    // Create body
    const tbody = $('<tbody>');
    Object.values(students).forEach(student => {
        const row = $('<tr>');
        row.append($('<td>').text(student.student_id));
        row.append($('<td>').text(student.fullname));
    
        dates.forEach(date => {
            const attendance = student.attendance[date.fullDate]; // ค้นหา attendance ด้วย fullDate
            const status = attendance ? getStatusIcon(attendance.status) : '-'; // ถ้าไม่มีข้อมูลแสดงเป็น "-"
            row.append($('<td>').html(status)); // ใช้ .html() เพื่อแสดงไอคอน
        });
    
        const summary = `มา: ${student.summary.present}, สาย: ${student.summary.late}, ขาด: ${student.summary.absent}`;
        row.append($('<td>').text(summary));
    
        tbody.append(row);
    });

    table.append(tbody);
    return table;
}

// ฟังก์ชันสร้างวันที่
function generateDates(startDate, dayOfWeek) {
    const dates = [];
    const startDateObj = new Date(startDate);

    // ตั้งวันที่เป็น 00:00:00 เพื่อลดผลกระทบจาก Time Zone
    startDateObj.setHours(0, 0, 0, 0);

    // ปรับให้ตรงกับ dayOfWeek
    while (startDateObj.getDay() !== dayOfWeek) {
        startDateObj.setDate(startDateObj.getDate() + 1);
    }

    for (let i = 0; i < 16; i++) { // 16 สัปดาห์
        const currentDate = new Date(startDateObj);
        currentDate.setDate(startDateObj.getDate() + i * 7); // เพิ่มทีละ 7 วัน
        dates.push({
            day: currentDate.getDate(),
            month: currentDate.getMonth() + 1,
            fullDate: currentDate.toISOString().split('T')[0]
        });
    }

    console.log('Generated dates:', dates); // Debug วันที่
    return dates;
}


// ฟังก์ชันแปลงสถานะเป็นไอคอน
function getStatusIcon(status) {
    switch (status) {
        case '1': return '✔️'; // มา
        case '2': return '🕒'; // สาย
        case '3': return '❌'; // ขาด
        default: return '-';  // ไม่มีข้อมูล
    }
}

// ฟังก์ชันแปลงวันเป็นข้อความ
function dayOfWeekToText(dayOfWeek) {
    const days = {
        0: 'อาทิตย์',
        1: 'จันทร์',
        2: 'อังคาร',
        3: 'พุธ',
        4: 'พฤหัส',
        5: 'ศุกร์',
        6: 'เสาร์'
    };
    return days[dayOfWeek] || 'ไม่ระบุ';
}

// ส่วนของ Sidebar toggle
$(document).ready(function() {
    let sideBar = $("aside");
    let toggle = $("#toggle");
    let logo = $("#topbar img");

    toggle.on("click", function() {
        if (sideBar.hasClass("mini")) {
            sideBar.removeClass("mini").css("width", "14rem");
            logo.show();
        } else {
            sideBar.addClass("mini").css("width", "4rem");
            logo.hide();
        }
    });

    // Active menu item
    $(".link ul li").on("click", function() {
        $(".link ul li").removeClass("active");
        $(this).addClass("active");
        const link = $(this).find("a").attr("href");
        window.location.href = link;
    });
});
function Logout() {
    sessionStorage.clear();
  }
  