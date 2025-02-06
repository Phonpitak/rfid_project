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
document.getElementById('filter-button').addEventListener('click', () => {
    let academicYear = parseInt(document.getElementById('academic-year').value, 10);
    const term = document.getElementById('term').value;
    const year = document.getElementById('year').value;

    academicYear -= 543;

    fetch(`/api/timetable?academic_year=${academicYear}&term=${term}&year=${year}`)
      .then(response => response.json())
      .then(data => {
        // ล้างข้อมูลเดิม
        const cells = document.querySelectorAll('.row .cell:not(:first-child)');
        cells.forEach(cell => {
          cell.innerHTML = '';
          cell.style.backgroundColor = '';
          cell.style.color = '';
          cell.style.border = '';
        });

        const dayRows = {
          'จันทร์': 0, 'อังคาร': 1, 'พุธ': 2,
          'พฤหัส': 3, 'พฤหัสบดี': 3, 'ศุกร์': 4
        };

        // ใช้สีที่สดใสและมองเห็นชัดขึ้น
        const colorPalette = [
          '#FF5733', '#33B5E5', '#33FF57', '#FF33A8', 
          '#FFC233', '#A833FF', '#FF8633', '#3383FF'
        ];

        const usedColors = {};

        function getSubjectColor(subjectName) {
          if (usedColors[subjectName]) {
            return usedColors[subjectName];
          }

          const availableColors = colorPalette.filter(
            color => !Object.values(usedColors).includes(color)
          );

          const color = availableColors.length > 0 
            ? availableColors[0] 
            : colorPalette[Math.floor(Math.random() * colorPalette.length)];

          usedColors[subjectName] = color;
          return color;
        }

        const allSubjects = [...(data.morning || []), ...(data.afternoon || [])];

        allSubjects.forEach(subject => {
          const rowIndex = dayRows[subject.day_of_week];
          if (rowIndex === undefined) return;

          const rows = document.querySelectorAll('.row');
          const targetRow = rows[rowIndex];
          if (!targetRow) return;

          const startHour = parseInt(subject.start_time.split(':')[0]);
          const endHour = parseInt(subject.end_time.split(':')[0]);
          const startColumnIndex = startHour - 8 + 1;
          const endColumnIndex = endHour - 8 + 1;

          const cells = targetRow.querySelectorAll('.cell');
          const subjectColor = getSubjectColor(subject.subject_name);
          const textColor = '#fff'; // ใช้สีขาวเพื่อตัดกับพื้นหลัง

          for (let i = startColumnIndex; i < endColumnIndex; i++) {
            if (cells[i]) {
              cells[i].style.backgroundColor = subjectColor;
              cells[i].style.color = textColor;
              cells[i].style.padding = '8px';
              cells[i].style.textAlign = 'center';
              cells[i].style.fontWeight = 'bold';
              cells[i].style.border = '2px solid #ffffff';
              cells[i].style.borderRadius = '8px';
              cells[i].style.boxShadow = '0px 3px 6px rgba(0,0,0,0.2)';
            }
          }

          // วางข้อมูลไว้ตรงกลาง
          const middleColumnIndex = Math.floor((startColumnIndex + endColumnIndex) / 2);
          if (cells[middleColumnIndex]) {
            cells[middleColumnIndex].innerHTML = `
              <div class="subject-details">
                <strong>${subject.subject_name}</strong>
                <br>
                (${subject.room_number})
              </div>
            `;
          }
        });
      })
      .catch(err => {
        console.error('Error fetching timetable:', err);
        alert('Unable to load timetable. Please try again.');
      });
  });

// เพิ่ม CSS ให้แสดงผลชัดเจนขึ้น
const style = document.createElement('style');
style.textContent = `
    .subject-details {
      white-space: normal;
      word-wrap: break-word;
      font-size: 0.9em;
    }
    .cell:hover {
      transform: scale(1.05);
      transition: all 0.2s ease-in-out;
      box-shadow: 0px 4px 10px rgba(0,0,0,0.3);
    }
`;
document.head.appendChild(style);

function Logout() {
  sessionStorage.clear();
}

function TB_Open() {
    console.log("TB_Open function called!");
    // เพิ่มโค้ดอื่นๆ ที่คุณต้องการให้ทำงานเมื่อฟังก์ชันนี้ถูกเรียก
}
