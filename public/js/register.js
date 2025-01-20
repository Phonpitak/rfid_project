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

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the default form submission

    // Gather form data
    const formData = {
        user_id: document.getElementById('user_id').value,
        std_username: document.getElementById('std_username').value,
        std_password: document.getElementById('std_password').value,
        std_firstname: document.getElementById('std_firstname').value,
        std_lastname: document.getElementById('std_lastname').value,
        std_year: document.getElementById('std_year').value,
        group_id: document.getElementById('group_id').value,
        b_branch_id: document.getElementById('b_branch_id').value,
        b_branch: document.getElementById('b_branch').value,
        f_facully_id: document.getElementById('f_facully_id').value,
        f_facully: document.getElementById('f_facully').value,
        term: document.getElementById('term').value
    };

    // Send form data to API
    axios.post('/register/user', formData)
        .then(response => {
            if (response.data === 'SUCCESS') {
                Swal.fire({
                    title: 'Add Money Request!',
                    text: 'Data saved successfully!',
                    icon: 'success',
                    imageUrl: '/public/img/SweetAlert/success1.', // Update the path to your image
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Redirect after popup is closed
                    window.location.href = 'register.html';
                });
            } else {
                Swal.fire({
                    title: 'Registration Failed!',
                    text: 'Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error Occurred!',
                text: 'Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
});
});
public/js/detail.js
function Logout() {
    sessionStorage.clear();
  }