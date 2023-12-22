var editSub = false;
var editTeacher = false;
function toggleDropdown(dropdownHeading) {
    if (editSub === false) {
        var dropdownList = dropdownHeading.nextElementSibling;
        dropdownList.classList.toggle('show');
        dropdownHeading.classList.toggle('open');
    }
}

document.getElementById('hide_br').style.display = 'inline';

// Function to remove the click event listener from each list item
function removeRadioClickEvent() {
    for (var i = 0; i < listItems.length; i++) {
        listItems[i].removeEventListener('click', function () {
            // Get the radio button inside this list item
            var radioButton = this.querySelector('input[type="radio"]');
            // Remove the click event listener
            radioButton.removeEventListener('click', null);
        });
    }
}

// Call the function to remove the click event listener

function removeInputFieldsInSection(sectionId) {
    var section = document.getElementById(sectionId);
    var listItems = section.querySelectorAll('li');

    listItems.forEach(function (item) {
        var inputField = item.querySelector('input');
        inputField.style.display = 'none';
    });
}

function addInputFieldsInSection(sectionId) {
    var section = document.getElementById(sectionId);
    var listItems = section.querySelectorAll('li');

    listItems.forEach(function (item) {
        var inputField = item.querySelector('input');
        inputField.style.display = 'block';
    });
}

// Rest of the code...

function editPrefCollapse() {
    closeAllDropdowns();
}

function showAddCourseDiv() {
    var addCourseDiv = document.getElementById('div-for-add-course');
    var addTeacherDiv = document.getElementById('div-for-add-teacher');
    addCourseDiv.style.display = 'block';
    addTeacherDiv.style.display = 'none';
}

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

// Keep references to the Sortable instances
function activateSortable() {
    var leftBox = document.querySelector('.left-box');
    Sortable.create(leftBox, {
        animation: 150,
        delay: 100,
        chosenClass: 'sortable-chosen',
    });

    var dropdownLists = document.querySelectorAll('.dropdown-list');
    dropdownLists.forEach((dropdownList) => {
        Sortable.create(dropdownList, {
            animation: 150,
            delay: 100,
            chosenClass: 'sortable-chosen',
        });
    });
}

function deactivateSortable() {
    var leftBox = document.querySelector('.left-box');
    Sortable.get(leftBox).destroy();

    var dropdownLists = document.querySelectorAll('.dropdown-list');
    dropdownLists.forEach((dropdownList) => {
        Sortable.get(dropdownList).destroy();
    });
}
function closeEditPref1() {
    editTeacher = false;
    deactivateSortable();
    addInputFieldsInSection('subjectArea');
    document.getElementById('edit_msg_').style.display = 'none';
    document.getElementById('div-for-edit-teacher').style.display = 'none';
}

// Add event listener to the toggle checkbox
document
    .querySelector('#tt-sub-edit-switch')
    .addEventListener('change', function () {
        // Update the value of editSub based on the checkbox state
        editSub = this.checked;
        if (this.checked) {
            closeAllDropdowns();
            document.getElementById('div-for-edit-teacher').style.display =
                'none';
            document.getElementById('edit_msg_').style.display = 'block';
            document.getElementById('edit_msg_').innerText =
                'Click on the Subject to edit it.';
        } else {
            document.getElementById('div-for-edit-course').style.display =
                'none';
            document.getElementById('div-for-edit-teacher').style.display =
                'none';
            document.getElementById('edit_msg_').style.display = 'block';
            document.getElementById('edit_msg_').innerText =
                'Click on the Teacher to edit it.';
        }
    });
