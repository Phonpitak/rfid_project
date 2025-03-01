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
// ฟังก์ชันสร้างวันที่

// ดึงข้อมูลจาก API
function fetchAttendanceData(teacherId, selectedSubjectId = null) {
    $.ajax({
        url: `/attendance1?teacher_id=${teacherId}&year=4`,
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


function changeSubject() {
    const selectedSubject = $('#subject-select').val();
    
    console.log("🔄 เปลี่ยนวิชาเป็น:", selectedSubject);

    sessionStorage.setItem('selectedSubjectId', selectedSubject);

    // ✅ โหลดข้อมูลใหม่ (แต่ต้องให้ส่ง subject ID ใหม่ไปด้วย)
    fetchAttendanceData(sessionStorage.getItem('TeacherID'), selectedSubject);
}

// สร้างตารางตามวันและวิชา (ปรับปรุงฟังก์ชัน)
function createTablesByDayAndSubject(data, selectedSubjectId) {
    $('#attendance-records').empty();

    Object.keys(data).sort().forEach(dayOfWeek => {
        const dayData = data[dayOfWeek];
        if (dayData[selectedSubjectId]) {
            const subjectData = dayData[selectedSubjectId];
            const dayTitle = $('<h2>').text(`วัน${dayOfWeekToText(dayOfWeek)}`);
            const subjectTitle = $('<h3>').text(`วิชา: ${subjectData.subject_name}`);
            
            // เพิ่มคำอธิบายสัญลักษณ์
            const legendContainer = $('<div>').addClass('status-legend');
            const legendText = $('<p>').html(
                '<strong>คำอธิบายสัญลักษณ์:</strong> ' +
                '✔️ = มา, ' +
                '🕒 = สาย, ' +
                '❌ = ขาด'
            );
            legendContainer.append(legendText);
            
            const table = createAttendanceTable(subjectData.students, parseInt(dayOfWeek));

            $('#attendance-records')
                .append(dayTitle)
                .append(subjectTitle)
                .append(legendContainer)
                .append(table);
        }
    });
}

// เพิ่ม CSS สำหรับคำอธิบายสัญลักษณ์
$(document).ready(function() {
    // เพิ่ม style สำหรับคำอธิบายสัญลักษณ์
    $('<style>')
        .text(`
            .status-legend {
                margin-bottom: 15px;
                background-color: #f9f9f9;
                padding: 8px 12px;
                border-radius: 4px;
                border-left: 3px solid #4a90e2;
            }
            .status-legend p {
                margin: 0;
                font-size: 0.9rem;
            }
        `)
        .appendTo('head');
});


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
        
        // เพิ่มตัวแปรสำหรับคำนวณสรุปในตารางเท่านั้น
        let presentCount = 0;
        let lateCount = 0;
        let absentCount = 0;
    
        dates.forEach(date => {
            const attendance = student.attendance[date.fullDate]; // ค้นหา attendance ด้วย fullDate
            const status = attendance ? getStatusIcon(attendance.status) : '-'; // ถ้าไม่มีข้อมูลแสดงเป็น "-"
            
            // นับสถานะจากข้อมูลในตารางเท่านั้น
            if (attendance) {
                if (attendance.status === '1') presentCount++;
                else if (attendance.status === '2') lateCount++;
                else if (attendance.status === '3') absentCount++;
            }
            
            row.append($('<td>').html(status)); // ใช้ .html() เพื่อแสดงไอคอน
        });
    
        // ใช้ข้อมูลสรุปที่คำนวณจากตารางเท่านั้น
        const tableSummary = `มา: ${presentCount}, สาย: ${lateCount}, ขาด: ${absentCount}`;
        row.append($('<td>').text(tableSummary));
    
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

    for (let i = 0; i < 19; i++) { // 16 สัปดาห์
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

function captureTableAsPDF() {
    const { jsPDF } = window.jspdf;
    
    // สร้าง PDF แบบ landscape
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    
    // ดึงข้อมูลจากหน้าเว็บ
    let subjectName = document.querySelector("#attendance-records h3")?.innerText || "attendance_report";
    subjectName = subjectName.replace(/^วิชา:\s*/, "").trim();
    const filename = subjectName.replace(/[<>:"\/\\|?*]+/g, "").replace(/\s+/g, "_");
    
    // ดึงข้อมูลจากตารางเดิม
    const originalTable = document.querySelector("#attendance-records table");
    if (!originalTable) {
        console.error("ไม่พบตารางข้อมูล");
        return;
    }
    
    // ดึงข้อมูลส่วนหัวของหน้า
    const headerTitle = document.querySelector("#attendance-records h2")?.innerHTML || "";
    const headerSubtitle = document.querySelector("#attendance-records h3")?.innerHTML || "";
    
    // ดึงข้อมูลส่วนคำอธิบายสัญลักษณ์
    const legendContent = document.querySelector("#attendance-records .status-legend")?.innerHTML || "";
    
    // สร้างตารางข้อมูล
    const rows = Array.from(originalTable.rows);
    
    // ถ้าไม่มีข้อมูล ให้จบการทำงาน
    if (rows.length <= 1) {
        console.error("ตารางไม่มีข้อมูล");
        return;
    }
    
    // แยกหัวตารางกับข้อมูล
    const headerRow = rows[0];
    const dataRows = rows.slice(1);
    
    // กำหนดจำนวนแถวต่อหน้า - อาจต้องปรับตามความเหมาะสม
    const rowsPerPage = 20;
    
    // แบ่งข้อมูลเป็นหน้า
    const pageGroups = [];
    for (let i = 0; i < dataRows.length; i += rowsPerPage) {
        pageGroups.push(dataRows.slice(i, i + rowsPerPage));
    }
    
    // สร้างฟังก์ชันสำหรับสร้างแต่ละหน้า
    async function generatePages() {
        // เตรียม promises เพื่อจัดการกับรูปภาพทั้งหมด
        const pagePromises = [];
        
        for (let pageIndex = 0; pageIndex < pageGroups.length; pageIndex++) {
            // สร้าง container สำหรับหน้านี้
            const pageContainer = document.createElement('div');
            pageContainer.style.position = 'absolute';
            pageContainer.style.left = '-9999px';
            pageContainer.style.width = '297mm'; // A4 landscape
            pageContainer.style.padding = '5mm'; // ลดขอบกระดาษจาก 10mm เป็น 5mm
            pageContainer.style.background = 'white';
            pageContainer.style.fontFamily = 'Arial, sans-serif';
            
            // สร้างหัวรายงานเฉพาะหน้าแรก
            if (pageIndex === 0) {
                if (headerTitle) {
                    const titleDiv = document.createElement('h2');
                    titleDiv.innerHTML = headerTitle;
                    titleDiv.style.textAlign = 'center';
                    titleDiv.style.margin = '0 0 3mm 0'; // ลดระยะห่าง
                    pageContainer.appendChild(titleDiv);
                }
                
                if (headerSubtitle) {
                    const subtitleDiv = document.createElement('h3');
                    subtitleDiv.innerHTML = headerSubtitle;
                    subtitleDiv.style.textAlign = 'center';
                    subtitleDiv.style.margin = '0 0 3mm 0'; // ลดระยะห่าง
                    pageContainer.appendChild(subtitleDiv);
                }
                
                // เพิ่มคำอธิบายสัญลักษณ์เฉพาะหน้าแรก
                if (legendContent) {
                    const legendDiv = document.createElement('div');
                    legendDiv.className = 'status-legend';
                    legendDiv.innerHTML = legendContent;
                    legendDiv.style.margin = '0 0 3mm 0'; // ลดระยะห่าง
                    pageContainer.appendChild(legendDiv);
                }
            }
            
            // สร้างหมายเลขหน้า
            const pageInfo = document.createElement('div');
            pageInfo.textContent = `หน้า ${pageIndex + 1}/${pageGroups.length}`;
            pageInfo.style.textAlign = 'right';
            pageInfo.style.margin = '0 0 2mm 0'; // ลดระยะห่าง
            pageInfo.style.fontSize = '9pt';
            pageContainer.appendChild(pageInfo);
            
            // สร้างตารางใหม่
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.fontSize = '10pt';
            
            // สร้างส่วนหัวตาราง (ทุกหน้ามีหัวตาราง)
            const thead = document.createElement('thead');
            const newHeaderRow = headerRow.cloneNode(true);
            thead.appendChild(newHeaderRow);
            table.appendChild(thead);
            
            // สร้างส่วนเนื้อหาตาราง
            const tbody = document.createElement('tbody');
            const pageRows = pageGroups[pageIndex];
            
            for (const row of pageRows) {
                const newRow = row.cloneNode(true);
                tbody.appendChild(newRow);
            }
            
            table.appendChild(tbody);
            pageContainer.appendChild(table);
            
            // เพิ่ม container ลงในเอกสาร
            document.body.appendChild(pageContainer);
            
            // จัดรูปแบบตาราง
            styleElements(pageContainer, pageIndex > 0);
            
            // ใช้ Promise เพื่อจัดการกับการสร้างภาพแต่ละหน้า
            const pagePromise = new Promise((resolve) => {
                html2canvas(pageContainer, {
                    scale: 2, // ลดลงจาก 3 เพื่อป้องกันรูปยืด
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#FFFFFF',
                    allowTaint: true,
                    letterRendering: true,
                    imageTimeout: 0
                }).then(canvas => {
                    // ลบ container หลังจากสร้างภาพเสร็จ
                    document.body.removeChild(pageContainer);
                    
                    // เตรียมข้อมูลสำหรับเพิ่มในหน้า PDF
                    const imgData = canvas.toDataURL('image/jpeg', 1.0);
                    resolve({ imgData, pageIndex, width: canvas.width, height: canvas.height });
                });
            });
            
            pagePromises.push(pagePromise);
        }
        
        // รอให้ทุกหน้าสร้างเสร็จ
        const pageResults = await Promise.all(pagePromises);
        
        // เรียงหน้าตามลำดับ
        pageResults.sort((a, b) => a.pageIndex - b.pageIndex);
        
        // เพิ่มทุกหน้าลงใน PDF
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 5; // ลดขอบกระดาษจาก 10 เป็น 5
        
        pageResults.forEach((result, index) => {
            if (index > 0) {
                doc.addPage();
            }
            
            // คำนวณความสูงเพื่อรักษาอัตราส่วน
            const imgWidth = pageWidth - (margin * 2);
            const imgHeight = imgWidth * (result.height / result.width);

            if (!isFinite(imgHeight) || imgHeight <= 0) {
                console.error("ขนาดของรูปภาพไม่ถูกต้อง:", imgWidth, imgHeight);
                return;
            }
            
            doc.addImage(result.imgData, 'JPEG', margin, margin, imgWidth, imgHeight, null, 'FAST');
        });
        
        // บันทึก PDF
        doc.save(`${filename}.pdf`);
    }
    
    // เริ่มการสร้างหน้า
    generatePages();
}

// ฟังก์ชันจัดรูปแบบองค์ประกอบต่างๆ
function styleElements(container, isSecondaryPage = false) {
    // จัดรูปแบบส่วนหัว
    const headings = container.querySelectorAll('h2, h3');
    headings.forEach(heading => {
        heading.style.fontFamily = 'Arial, sans-serif';
        heading.style.color = '#333';
        heading.style.margin = '2mm 0'; // ลดระยะห่าง
        heading.style.padding = '0';
        heading.style.textAlign = 'center';
        
        // ลดขนาดตัวอักษรหัวเรื่อง
        if (heading.tagName === 'H2') {
            heading.style.fontSize = '14pt';
        } else {
            heading.style.fontSize = '12pt';
        }
    });
    
    // จัดรูปแบบคำอธิบายสัญลักษณ์
    const legend = container.querySelector('.status-legend');
    if (legend) {
        legend.style.background = '#f8f8f8';
        legend.style.border = '1px solid #ddd';
        legend.style.borderLeft = '3px solid #4a90e2';
        legend.style.padding = '3mm'; // ลดระยะห่าง
        legend.style.margin = '2mm 0'; // ลดระยะห่าง
        legend.style.borderRadius = '2mm';
        legend.style.fontSize = '9pt'; // ลดขนาดตัวอักษร
    }
    
    // จัดรูปแบบตาราง
    const table = container.querySelector('table');
    if (table) {
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '10pt';
        table.style.marginBottom = '5mm'; // ลดระยะห่าง
        
        // ปรับความกว้างคอลัมน์
        const headerRow = table.rows[0];
        if (headerRow) {
            const columnCount = headerRow.cells.length;
            
            // คอลัมน์รหัสนักศึกษา
            if (headerRow.cells[0]) headerRow.cells[0].style.width = '15%';
            // คอลัมน์ชื่อ-นามสกุล
            if (headerRow.cells[1]) headerRow.cells[1].style.width = '20%';
            // คอลัมน์สรุป
            if (headerRow.cells[columnCount-1]) headerRow.cells[columnCount-1].style.width = '15%';
            
            // คอลัมน์วันที่
            const dateColumnWidth = 50 / (columnCount - 3);
            for (let i = 2; i < columnCount - 1; i++) {
                if (headerRow.cells[i]) headerRow.cells[i].style.width = dateColumnWidth + '%';
            }
            
            // หากเป็นหน้าที่ 2 เป็นต้นไป ปรับหัวตารางให้เรียบง่าย
            if (isSecondaryPage) {
                for (let i = 0; i < columnCount; i++) {
                    const cell = headerRow.cells[i];
                    
                    // ถ้าเป็นคอลัมน์วันที่ ให้ตัดข้อความเหลือแค่วันที่
                    if (i >= 2 && i < columnCount - 1) {
                        const text = cell.textContent;
                        // เก็บเฉพาะวันที่ (ถ้ามี)
                        const dateMatch = text.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
                        if (dateMatch) {
                            cell.textContent = dateMatch[0];
                        }
                    }
                }
            }
        }
        
        // จัดรูปแบบเซลล์
        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => {
            cell.style.border = '1px solid #bbb';
            cell.style.padding = '1.5mm'; // ลดระยะห่าง
            
            // หัวตาราง
            if (cell.tagName === 'TH') {
                cell.style.backgroundColor = '#f2f2f2';
                cell.style.fontWeight = 'bold';
                cell.style.textAlign = 'center';
                cell.style.color = '#333';
            } else {
                // เซลล์ข้อมูล
                const content = cell.textContent.trim();
                if (content === '✔️' || content === '🕒' || content === '❌' || content === '-') {
                    cell.style.textAlign = 'center';
                    cell.style.fontSize = '12pt';
                    
                    // สีพื้นหลังตามสถานะ
                    if (content === '✔️') cell.style.backgroundColor = '#e8f5e9';
                    else if (content === '🕒') cell.style.backgroundColor = '#fff8e1';
                    else if (content === '❌') cell.style.backgroundColor = '#ffebee';
                } else if (/^\d+$/.test(content) || content.includes('/')) {
                    cell.style.textAlign = 'center';
                } else if (content.includes('มา:') || content.includes('สาย:') || content.includes('ขาด:')) {
                    cell.style.textAlign = 'left';
                    cell.style.fontSize = '9pt';
                }
            }
        });
    }
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
