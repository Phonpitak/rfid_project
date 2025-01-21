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
document.getElementById('filter-button').addEventListener('click', () => {
  const academicYear = document.getElementById('academic-year').value;
  const term = document.getElementById('term').value;

  fetch(`/api/timetable?academic_year=${academicYear}&term=${term}`)
    .then(response => response.json())
    .then(data => {
      console.log(data); // ตรวจสอบข้อมูลจาก API
      const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์'];

      // เคลียร์ตารางเดิม
      document.querySelectorAll('.row').forEach(row => {
        row.querySelectorAll('.cell:not(:first-child)').forEach(cell => {
          cell.innerHTML = '';
        });
      });

      // ใส่วิชาภาคเช้า
      if (data.morning && Array.isArray(data.morning)) {
        data.morning.forEach(subject => {
          const dayIndex = days.indexOf(subject.day_of_week); // หาวันในสัปดาห์
          if (dayIndex !== -1) {
            const row = document.querySelector(`.row:nth-child(${dayIndex + 2})`);
            if (row) {
              const startHour = parseInt(subject.start_time.split(':')[0], 10);
              const cellIndex = startHour - 8; // คำนวณตำแหน่งคอลัมน์
              const cell = row.querySelector(`.cell:nth-child(${cellIndex + 2})`);
              if (cell) {
                cell.innerHTML += `
                  ${subject.subject_name}<br>(${subject.room_number})
                `;
              }
            }
          }
        });
      }

      // ใส่วิชาภาคบ่าย
      if (data.afternoon && Array.isArray(data.afternoon)) {
        data.afternoon.forEach(subject => {
          const dayIndex = days.indexOf(subject.day_of_week); // หาวันในสัปดาห์
          if (dayIndex !== -1) {
            const row = document.querySelector(`.row:nth-child(${dayIndex + 2})`);
            if (row) {
              const startHour = parseInt(subject.start_time.split(':')[0], 10);
              const cellIndex = startHour - 8; // คำนวณตำแหน่งคอลัมน์
              const cell = row.querySelector(`.cell:nth-child(${cellIndex + 2})`);
              if (cell) {
                cell.innerHTML += `
                  ${subject.subject_name}<br>(${subject.room_number})
                `;
              }
            }
          }
        });
      }
    })
    .catch(err => console.error('Error fetching timetable:', err));
  });
function Logout() {
  sessionStorage.clear();
}

