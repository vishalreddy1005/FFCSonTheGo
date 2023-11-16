function toggleDropdown(dropdownHeading) {
    var dropdownList = dropdownHeading.nextElementSibling;
    dropdownList.classList.toggle('show');
    dropdownHeading.classList.toggle('open');
}
document.getElementById('hide_br').style.display = 'inline';

// Get all the list items
var listItems = document.querySelectorAll('.dropdown li');

// Variable to keep track of the currently selected radio button
var current = null;

// Add a click event listener to each list item
for (var i = 0; i < listItems.length; i++) {
    listItems[i].addEventListener('click', function () {
        // Get the radio button inside this list item
        var radioButton = this.querySelector('input[type="radio"]');

        // If this radio button is already selected, deselect it
        if (radioButton === current) {
            radioButton.checked = false;
            current = null; // No radio button is currently selected
        }
        // Otherwise, deselect the currently selected radio button (if any) and select this one
        else {
            if (current) current.checked = false;
            radioButton.checked = true;
            current = radioButton; // This radio button is now the currently selected one
        }
    });
}

var addTeacherDiv = document.getElementById('div-for-add-teacher');
addTeacherDiv.style.display = 'none';

function showAddCourseDiv() {
    var addCourseDiv = document.getElementById('div-for-add-course');
    var addTeacherDiv = document.getElementById('div-for-add-teacher');
    addCourseDiv.style.display = 'block';
    addTeacherDiv.style.display = 'none';
}
