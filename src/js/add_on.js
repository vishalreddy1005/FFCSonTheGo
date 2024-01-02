document.getElementById('hide_br').style.display = 'inline';
window.addEventListener('resize', function () {
    // if mobile phone in portrait mode show div with id 'mobile_message'
    // Process each 'tr' before activating the Sortable
    var courseList = document.querySelector('#course-list tbody');

    [].forEach.call(courseList.getElementsByTagName('tr'), function (tr) {
        [].forEach.call(tr.getElementsByTagName('td'), function (td) {
            // Store the original width

            td.dataset.originalWidth = getComputedStyle(td).width;
            // Set the width to the original width
            td.style.width = td.dataset.originalWidth;
        });
    });
    if (window.innerWidth < 631) {
        document.getElementById('mobile_message').style.display = 'block';
    }
    // if mobile phone in landscape mode hide div with id 'mobile_message'
    else {
        document.getElementById('mobile_message').style.display = 'none';
    }
});

document
    .getElementById('tt-subject-add')
    .addEventListener('click', function () {
        var addCourseDiv = document.getElementById('div-for-add-course');
        var addTeacherDiv = document.getElementById('div-for-add-teacher');
        addCourseDiv.style.display = 'block';
        addTeacherDiv.style.display = 'none';
    });

document
    .getElementById('course_link')
    .addEventListener('click', function (event) {
        event.preventDefault();
        var addCourseDiv = document.getElementById('div-for-add-course');
        var addTeacherDiv = document.getElementById('div-for-add-teacher');
        addCourseDiv.style.display = 'block';
        addTeacherDiv.style.display = 'none';
    });

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-list').forEach((dropdownList) => {
        dropdownList.classList.remove('show');
        dropdownList.previousElementSibling.classList.remove('open');
    });
}

function openAllDropdowns() {
    document.querySelectorAll('.dropdown-list').forEach((dropdownList) => {
        dropdownList.classList.add('show');
        dropdownList.previousElementSibling.classList.add('open');
    });
}

// all the form elements under section with class right-box should not do anything means no request on submit
document.querySelectorAll('.right-box form').forEach((form) => {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
    });
});
