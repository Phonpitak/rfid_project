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
var group_id = sessionStorage.getItem("Group");
console.log("Group ID:", group_id); // Debug ค่าของ group_id


if (group_id == 9) {
    TB_Open(); // สำหรับแอดมิน
} else if (group_id == 1 || group_id == 2) {
    console.log("Hiding menus for group 1 or 2...");
    $('#registerMenu').remove(); 
    $('#memberlist').remove();  
    $('#addsubject').remove();
    $('#register_all').remove();
    // ยกเว้น year_1 ถึง year_4
} else if (group_id == 5) {
    console.log("Hiding menus for group 5...");
    $('#registerMenu').remove(); 
    $('#register_all').remove();
    $('#memberlist').remove();  
    $('#addsubject').remove();
    $('#detailMenu').remove();
    $('#subjectMenu').remove();
    $('#attendanceMenu').remove();

    TB_Open(); // เปิดเฉพาะ year_1 ถึง year_4
} else {
    console.warn("Unhandled group ID:", group_id);
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
function fetchAttendanceData(teacherId, selectedSubjectId = null) {
    $.ajax({
        url: `/attendance1?teacher_id=${teacherId}&year=2`,
        method: 'GET',
        success: function (data) {
            console.log("📌 API Data:", data); // Debug API Response

            if (data && Object.keys(data).length > 0) {
                const subjects = extractSubjects(data);

                // ✅ เช็คว่าค่าที่เลือกอยู่ในลิสต์หรือไม่
                if (!selectedSubjectId || !subjects.find(s => s.id === selectedSubjectId)) {
                    selectedSubjectId = subjects[0]?.id;
                }

                console.log("📌 ใช้วิชา:", selectedSubjectId); // Debug

                // ✅ ถ้ามีหลายวิชา ให้สร้าง Dropdown
                createSubjectDropdown(subjects);

                // ✅ อัปเดต Session Storage
                sessionStorage.setItem('selectedSubjectId', selectedSubjectId);

                // ✅ แสดงข้อมูลวิชา
                createTablesByDayAndSubject(data, selectedSubjectId);
            } else {
                $('#attendance-header').html('');
                $('#attendance-records').html('<p>ไม่มีข้อมูลการเข้าชั้นเรียน</p>');
                sessionStorage.removeItem('selectedSubjectId'); // รีเซ็ตค่าถ้าไม่มีข้อมูล
            }
        },
        error: function () {
            $('#attendance-header').html('');
            $('#attendance-records').html('<p>เกิดข้อผิดพลาดในการดึงข้อมูล</p>');
        }
    });
}



function extractSubjects(data) {
    const subjectList = [];
    Object.keys(data).forEach(dayOfWeek => {
        Object.keys(data[dayOfWeek]).forEach(subjectId => {
            const subject = data[dayOfWeek][subjectId];
            if (!subjectList.find(s => s.id === subjectId)) {
                subjectList.push({ id: subjectId, name: subject.subject_name });
            }
        });
    });
    return subjectList;
}

function createSubjectDropdown(subjects) {
    let storedSubjectId = sessionStorage.getItem('selectedSubjectId');

    if (subjects.length <= 1) {
        $('#attendance-header').html(''); // ซ่อน dropdown ถ้ามีแค่ 1 วิชา
        return;
    }

    let dropdownHtml = `
        <div class="dropdown-container">
            <label for="subject-select" class="dropdown-label">เลือกวิชา:</label>
            <select id="subject-select" class="dropdown-select" onchange="changeSubject()">`;

    subjects.forEach(subject => {
        const selected = storedSubjectId === subject.id ? 'selected' : '';
        dropdownHtml += `<option value="${subject.id}" ${selected}>${subject.name}</option>`;
    });

    dropdownHtml += `</select></div>`;
    $('#attendance-header').html(dropdownHtml);
}




// สร้างตารางตามวันและวิชา
function createTablesByDayAndSubject(data, selectedSubjectId) {
    $('#attendance-records').empty();

    Object.keys(data).sort().forEach(dayOfWeek => {
        const dayData = data[dayOfWeek];
        if (dayData[selectedSubjectId]) {
            const subjectData = dayData[selectedSubjectId];
            const dayTitle = $('<h2>').text(`วัน${dayOfWeekToText(dayOfWeek)}`);
            const subjectTitle = $('<h3>').text(`วิชา: ${subjectData.subject_name}`);
            const table = createAttendanceTable(subjectData.students, parseInt(dayOfWeek));

            $('#attendance-records')
                .append(dayTitle)
                .append(subjectTitle)
                .append(table);
        }
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

// เพิ่มปุ่ม Export PDF
const exportButton = $('<button>')
    .text('Export เป็น PDF')
    .addClass('export-btn')
    .on('click', function() {
        captureTableAsPDF();
    });

$('#attendance-records').before(exportButton);

// ฟังก์ชันแปลงตารางเป็นภาพและบันทึก PDF
function captureTableAsPDF() {
    const { jsPDF } = window.jspdf;

    // 📌 ดึงชื่อวิชาจากหน้าเว็บ
    let subjectName = document.querySelector("#attendance-records h3")?.innerText || "attendance_report";
    
    // 🔹 ตัดคำว่า "วิชา: " ออกไป
    subjectName = subjectName.replace(/^วิชา:\s*/, "");

    // 🔹 ลบอักขระพิเศษที่ไม่สามารถใช้เป็นชื่อไฟล์ได้
    subjectName = subjectName.replace(/[<>:"\/\\|?*]+/g, "").trim(); 
    subjectName = subjectName.replace(/\s+/g, "_"); // แทนที่ช่องว่างด้วย "_"

    html2canvas(document.querySelector("#attendance-records"), {
        scale: 2, // เพิ่มความคมชัด
        scrollX: 0,
        scrollY: 0,
        useCORS: true
    }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // ขนาดกระดาษ PDF
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 🔹 ปรับระยะขอบ
        const marginX = 10;
        const marginY = 10;

        // 🔹 ลดขนาดรูปลงเล็กน้อย
        const imgWidth = pageWidth - marginX * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // ใส่รูปลงใน PDF พร้อมระยะขอบ
        doc.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);

        // 📌 ตั้งชื่อไฟล์เป็นชื่อวิชาอัตโนมัติ
        doc.save(`${subjectName}.pdf`);
    });
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
  
function TB_Open() {
    console.log("TB_Open function called!");
    // เพิ่มโค้ดอื่นๆ ที่คุณต้องการให้ทำงานเมื่อฟังก์ชันนี้ถูกเรียก
}
