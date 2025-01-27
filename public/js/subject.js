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
});// เพิ่ม event listener เมื่อโหลดหน้าเว็บ
// Frontend JavaScript
document.getElementById('filter-button').addEventListener('click', () => {
    let academicYear = parseInt(document.getElementById('academic-year').value, 10);
    const term = document.getElementById('term').value;
    const year = document.getElementById('year').value; // ดึงค่าชั้นปี
  
    academicYear -= 543; // แปลง พ.ศ. -> ค.ศ.
  
    console.log('Sending request with:', { academicYear, term, year });
  
    fetch(`/api/timetable?academic_year=${academicYear}&term=${term}&year=${year}`)
        .then(response => response.json())
        .then(data => {
            console.log('Received data:', data);
  
            // เคลียร์ตารางเดิม
            const cells = document.querySelectorAll('.row .cell:not(:first-child)');
            cells.forEach(cell => {
                cell.innerHTML = '';
                cell.removeAttribute('colspan'); // ล้าง colspan ที่เคยตั้งไว้
                cell.style.display = ''; // รีเซ็ต display ของเซลล์
            });
  
            const dayRows = {
                'จันทร์': 0,
                'อังคาร': 1,
                'พุธ': 2,
                'พฤหัส': 3,
                'พฤหัสบดี': 3,
                'ศุกร์': 4
            };
  
            const allSubjects = [...(data.morning || []), ...(data.afternoon || [])];
  
            allSubjects.forEach(subject => {
                const rowIndex = dayRows[subject.day_of_week];
                if (rowIndex === undefined) {
                    console.warn('Invalid day:', subject.day_of_week);
                    return;
                }
  
                const rows = document.querySelectorAll('.row');
                const targetRow = rows[rowIndex];
                if (!targetRow) {
                    console.warn('Row not found for:', subject.day_of_week);
                    return;
                }
  
                const startHour = parseInt(subject.start_time.split(':')[0]); // ชั่วโมงเริ่มต้น
                const endHour = parseInt(subject.end_time.split(':')[0]); // ชั่วโมงสิ้นสุด
                const duration = endHour - startHour; // ระยะเวลาเรียน (ชั่วโมง)
                const columnIndex = startHour - 8 + 1; // คำนวณคอลัมน์เริ่มต้น
  
                const cells = targetRow.querySelectorAll('.cell');
                const targetCell = cells[columnIndex];
  
                if (targetCell) {
                    targetCell.innerHTML = `
                        ${subject.subject_name}<br>
                        (${subject.room_number})
                    `;
                    targetCell.setAttribute('colspan', duration); // รวมเซลล์ตามชั่วโมงที่ใช้
  
                    // ทำให้เซลล์ในช่วงเวลาที่เหลือเป็น hidden
                    for (let i = 1; i < duration; i++) {
                        if (cells[columnIndex + i]) {
                            cells[columnIndex + i].style.display = 'none';
                        }
                    }
                }
            });
        })
        .catch(err => {
            console.error('Error:', err);
        });
  });
  
  
function Logout() {
  sessionStorage.clear();
}

