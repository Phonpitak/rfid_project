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

function Logout() {
    sessionStorage.clear();
  }
  