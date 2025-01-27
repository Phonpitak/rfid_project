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
  const year = document.getElementById('year').value; // ดึงค่าปีการศึกษา (ชั้นปี)

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

              const startHour = parseInt(subject.start_time.split(':')[0]);
              const columnIndex = startHour - 8 + 1;

              const cells = targetRow.querySelectorAll('.cell');
              if (cells[columnIndex]) {
                  cells[columnIndex].innerHTML += `
                      ${subject.subject_name}<br>
                      (${subject.room_number})
                  `;
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

