// Client-side JavaScript for image upload
document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const imageDisplay = document.getElementById('imageDisplay');
    const imagePreview = document.getElementById('imagePreview');
  
    // Image preview functionality
    imageUpload.addEventListener('change', function(event) {
      const file = event.target.files[0];
      
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
  
      if (!file) {
        alert('กรุณาเลือกไฟล์รูปภาพ');
        return;
      }
  
      if (!allowedTypes.includes(file.type)) {
        alert('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (JPG, PNG, GIF)');
        imageUpload.value = ''; // Clear the file input
        return;
      }
  
      if (file.size > maxSize) {
        alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
        imageUpload.value = ''; // Clear the file input
        return;
      }
  
      // Create file reader for preview
      const reader = new FileReader();
      
      reader.onload = function(e) {
        imageDisplay.src = e.target.result;
      };
      
      reader.readAsDataURL(file);
  
      // ดึง u_id จาก sessionStorage
const userId = sessionStorage.getItem('U_ID');

if (!userId) {
  alert('กรุณาเข้าสู่ระบบก่อน');
  return;
}

const formData = new FormData();
formData.append('image', file);
formData.append('userId', userId); // ใช้ u_id ที่ได้จาก session

fetch('/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    alert('อัปโหลดรูปภาพสำเร็จ');
    // อัปเดต src รูปภาพ
    imageDisplay.src = data.imagePath;
  } else {
    console.error('Error details:', data);
    alert('เกิดข้อผิดพลาดในการอัปโหลด: ' + data.message);
  }
})
.catch(error => {
  console.error('Error:', error);
  alert('เกิดข้อผิดพลาดในการอัปโหลด');
});
    });
  });


  document.addEventListener('DOMContentLoaded', () => {
    const imageDisplay = document.getElementById('imageDisplay');
    const userId = sessionStorage.getItem('U_ID');
  
    if (userId) {
      // ดึงข้อมูลโปรไฟล์
      fetch(`/user/profile/${userId}`)
        .then(response => response.json())
        .then(data => {
          
          // ตรวจสอบและแสดงรูป
          if (data.std_img && data.std_img !== 'NULL') {
            console.log('Image path:', data.std_img);
            imageDisplay.src = data.std_img;
          } else {
            console.log('No image found, using placeholder');
            imageDisplay.src = 'img/profile-placeholder.png';
          }
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
          imageDisplay.src = 'img/profile-placeholder.png';
        });
    }
  });
let sideBar = document.querySelector("aside");
let toggle = document.querySelector("#toggle");
let logo = document.querySelector("#topbar img");

// ฟังก์ชันสำหรับการสลับขนาด Sidebar
toggle.addEventListener("click", function (e) {
  if (sideBar.classList.contains("mini")) {
    sideBar.classList.remove("mini");
    sideBar.style.width = "14rem"; // ขยาย Sidebar
    logo.style.display = "block";  // แสดงโลโก้เมื่อขยาย
  } else {
    sideBar.classList.add("mini");
    sideBar.style.width = "4rem";  // ย่อ Sidebar
    logo.style.display = "none";   // ซ่อนโลโก้เมื่อย่อ
  }
});

// ฟังก์ชันสำหรับการสลับเมนูที่ถูกเลือก
let menuItems = document.querySelectorAll(".link ul li");

menuItems.forEach(item => {
  item.addEventListener("click", function() {
    // ลบคลาส 'active' ออกจากเมนูทั้งหมด
    menuItems.forEach(menu => menu.classList.remove("active"));
    
    // เพิ่มคลาส 'active' ให้กับเมนูที่ถูกคลิก
    this.classList.add("active");

    // เปลี่ยนเส้นทางไปยังหน้าที่เลือก
    const link = this.querySelector("a").getAttribute("href");
    window.location.href = link; // ไปที่ลิงก์ของเมนูที่เลือก
  });
});


function TB_Open() {
    // ตรวจสอบว่ามีเมนูที่ต้องการแสดงอยู่หรือไม่ ถ้ามีจะเปิดแสดง
    // นี่เป็นตัวอย่างการแสดงเมนู โดยสามารถกำหนดให้เมนูที่ถูกซ่อนไว้ปรากฏอีกครั้ง

    // สมมุติว่าเมนูถูกซ่อนโดยใช้ display:none
    $('.menu-item').each(function() {
        if ($(this).css('display') === 'none') {
            $(this).show(); // แสดงเมนูที่ถูกซ่อน
        }
    });

    console.log("Menu opened and displayed.");
}

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

// ดึงข้อมูลโปรไฟล์จาก sessionStorage
const firstName = sessionStorage.getItem('Firstname');
const lastName = sessionStorage.getItem('Lastname');
if (firstName && lastName) {
    document.getElementById('profile-name').innerText = `${firstName} ${lastName}`;
} else {
    console.log('No profile data found in sessionStorage');
}

// ดึง user_id และข้อมูลนักเรียน
const user_id = sessionStorage.getItem("UserID");
if (user_id) {
    $.ajax({
        url: `detail/All/${user_id}`,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            if (data.length > 0) {
                const student = data[0];
                $('#studentId').text(student.user_id);
                $('#studentName').text(`${student.std_firstname} ${student.std_lastname}`);
                $('#studentBranch').text(student.b_branch);
                $('#studentFaculty').text(student.f_facully);
                $('#studentGroup').text(student.group_id);
                $('#studentyear').text(student.std_year);
                $('#studenterm').text(student.term);
            } else {
                console.error('No student data found');
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching student details:', textStatus, errorThrown);
        }
    });
} else {
    console.error('No user_id found in sessionStorage');
}


   // นาฬิกาดิจิตอล
        function updateClock() {
            const now = new Date();
            const thaiOptions = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'Asia/Bangkok'
            };

            // ฟอร์แมตเวลา
            let hours = now.getHours().toString().padStart(2, '0');
            let minutes = now.getMinutes().toString().padStart(2, '0');
            let seconds = now.getSeconds().toString().padStart(2, '0');
            document.getElementById('digitalClock').textContent = `${hours}:${minutes}:${seconds}`;
            
            // ฟอร์แมตวันที่แบบไทย
            let thaiDate = now.toLocaleDateString('th-TH', thaiOptions);
            document.getElementById('dateDisplay').textContent = thaiDate;

            setTimeout(updateClock, 1000);
        }

        // ปฏิทิน
        let currentDate = new Date();
        
        function renderCalendar() {
            const calendarDates = document.getElementById('calendarDates');
            calendarDates.innerHTML = '';
            
            // แสดงเดือนปัจจุบัน
            const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                               'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
            
            document.getElementById('currentMonth').textContent = 
                `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear() + 543}`;
            
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            // วันแรกของเดือน (0 = อาทิตย์, 1 = จันทร์, ...)
            let firstDayIndex = firstDay.getDay();
            
            // เพิ่มวันว่างก่อนวันแรกของเดือน
            for (let i = 0; i < firstDayIndex; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.classList.add('date-item', 'date-disabled');
                calendarDates.appendChild(emptyDay);
            }
            
            // เพิ่มวันที่ของเดือนปัจจุบัน
            const today = new Date();
            
            for (let i = 1; i <= lastDay.getDate(); i++) {
                const dateItem = document.createElement('div');
                dateItem.classList.add('date-item');
                dateItem.textContent = i;
                
                // ตรวจสอบว่าเป็นวันนี้หรือไม่
                if (i === today.getDate() && 
                    currentDate.getMonth() === today.getMonth() && 
                    currentDate.getFullYear() === today.getFullYear()) {
                    dateItem.classList.add('date-today');
                }
                
                calendarDates.appendChild(dateItem);
            }
        }
        
        // เปลี่ยนเดือน
        document.getElementById('prevMonth').addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        // กราฟสถิติการเข้าเรียน
        function createAttendanceChart() {
            const ctx = document.getElementById('attendanceChart').getContext('2d');
            
            // ข้อมูลตัวอย่าง (สามารถแทนที่ด้วยข้อมูลจริงได้)
            const data = {
                labels: ['วิชา A', 'วิชา B', 'วิชา C', 'วิชา D', 'วิชา E'],
                datasets: [{
                    label: 'เข้าเรียน (%)',
                    data: [95, 88, 76, 92, 85],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(201, 203, 207, 0.6)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(201, 203, 207, 1)'
                    ],
                    borderWidth: 1
                }]
            };
            
            const options = {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            };
            
            new Chart(ctx, {
                type: 'bar',
                data: data,
                options: options
            });
        }

        // Toggle sidebar function (keep existing functionality)
        $(document).ready(function() {
            $('#toggle').click(function() {
                $('aside').toggleClass('mini');
            });
            
            // Populate profile info from database (placeholder)
            $('#welcome-name').text($('#studentName').text());
            
            // Initialize widgets
            updateClock();
            renderCalendar();
            // createAttendanceChart();
        });
//dfyuhjki
function Logout() {
    sessionStorage.clear();
  }
