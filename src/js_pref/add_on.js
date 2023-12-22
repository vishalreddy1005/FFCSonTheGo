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
        item.removeChild(inputField);
    });
}

function addInputFieldsInSection(sectionId) {
    var section = document.getElementById(sectionId);
    var listItems = section.querySelectorAll('li');

    listItems.forEach(function (item) {
        var inputField = document.createElement('input');
        inputField.setAttribute('type', 'radio');
        inputField.setAttribute(
            'name',
            item.parentElement.parentElement.parentElement.querySelector(
                'h2 .cname',
            ).innerText,
        );
        liData = item.querySelectorAll('div');
        teacherName = liData[0].innerText;
        inputField.setAttribute('value', teacherName);
        item.innerHTML = '';
        item.appendChild(inputField);
        liData.forEach(function (data) {
            item.appendChild(data);
        });
    });
}

function editPref() {
    editTeacher = true;
    document.getElementById('tt-subject-edit').style.display = 'none';
    document.getElementById('tt-subject-add').style.display = 'none';
    document.getElementById('tt-teacher-add').style.display = 'none';
    document.getElementById('div-for-add-teacher').style.display = 'none';
    document.getElementById('div-for-add-course').style.display = 'none';
    document.getElementById('tt-subject-collapse').style.display = 'block';
    document.getElementById('tt-subject-done').style.display = 'block';
    document.getElementById('tt-sub-edit-switch-div').style.display = 'block';
    document.getElementById('edit_msg_').style.display = 'block';
    activateSortable();
    openAllDropdowns();
    removeInputFieldsInSection('subjectArea');
    // Add event listeners to .h2s div elements
    document.querySelectorAll('.h2s').forEach((div) => {
        div.addEventListener('click', function () {
            if (editSub === true) {
                document.getElementById('edit_msg_').style.display = 'none';
                const subjectName = this.querySelector('.cname').innerText;
                let credit = this.querySelector('h4')
                    .innerText.replace('[', '')
                    .replace(']', '');
                credit = parseInt(credit);
                let courseDiv = document.getElementById('div-for-edit-course');
                courseDiv.style.display = 'block';
                courseDiv.querySelector('#course-input_edit').value =
                    subjectName;
                courseDiv.querySelector('#credits-input-edit').value = credit;
                courseDiv.querySelector('#course-input-edit-pre').innerText =
                    subjectName;
                courseDiv.querySelector('#credit-input-edit-pre').innerText =
                    credit;
            }
        });
    });

    // Add event listeners to li items
    document.querySelectorAll('li').forEach((li) => {
        li.addEventListener('click', function () {
            if (editSub === false && editTeacher === true) {
                document.getElementById('edit_msg_').style.display = 'none';
                document.getElementById('div-for-edit-teacher').style.display =
                    'block';
                allDivInLi = this.querySelectorAll('div');
                const courseName =
                    this.parentElement.parentElement.querySelector(
                        '.cname',
                    ).innerText;
                const teacherName = allDivInLi[0].innerText;
                const slot = allDivInLi[1].innerText;
                const venue = allDivInLi[2].innerText;
                const color = this.style.backgroundColor;
                document.getElementById('teacher-input_remove-edit').value =
                    teacherName;
                document.getElementById('slot-input-edit').value = slot;
                document.getElementById('venue-input-edit').value = venue;
                document.getElementById('teacher-edit-course').value =
                    courseName;
                document.getElementById('color1-select-edit').value = color;
                document.getElementById('teacher-input_remove-edit-pre').value =
                    teacherName;
            }
        });
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
