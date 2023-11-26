var editSub = false;

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

function disableSelectOptions() {
    var selectOptions = document.querySelectorAll(
        '.dropdown-list input[type="radio"]',
    );
    selectOptions.forEach(function (option) {
        option.disabled = true;
    });
    var selectOptions = document.querySelectorAll(
        '.dropdown-list input[type="radio"]',
    );
    selectOptions.forEach(function (option) {
        option.disabled = false;
    });
}

function enableSelectOptions() {
    var selectOptions = document.querySelectorAll(
        '.dropdown-list input[type="radio"]',
    );
    selectOptions.forEach(function (option) {
        option.disabled = false;
    });
}

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
    document.getElementById('tt-subject-edit').style.display = 'none';
    document.getElementById('tt-subject-add').style.display = 'none';
    document.getElementById('tt-teacher-add').style.display = 'none';
    document.getElementById('div-for-add-teacher').style.display = 'none';
    document.getElementById('div-for-add-course').style.display = 'none';
    document.getElementById('tt-subject-collapse').style.display = 'block';
    document.getElementById('tt-subject-done').style.display = 'block';
    document.getElementById('tt-sub-edit-switch-div').style.display = 'block';
    activateSortable();
    openAllDropdowns();
    removeInputFieldsInSection('subjectArea');
    // Add event listeners to .h2s div elements
    document.querySelectorAll('.h2s').forEach((div) => {
        div.addEventListener('click', function () {
            if (editSub === true) {
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
            }
        });
    });

    document
        .getElementById('saveSubjectEditModal')
        .addEventListener('click', function () {
            console.log('Save button clicked');
            let courseDiv = document.getElementById('div-for-edit-course');
            let subjectArea = document.getElementById('subjectArea');
            let allSpan = subjectArea.querySelectorAll('.cname');
            spanMsg = 'Course not updated';
            spanMsgColor = 'red';
            if (courseDiv.querySelector('#credits-input-edit').value === '') {
                spanMsg = 'Credits cannot be empty';
                spanMsgColor = 'red';
            } else {
                allSpan.forEach((span) => {
                    if (
                        span.innerText ===
                        courseDiv.querySelector('#course-input-edit-pre')
                            .innerText
                    ) {
                        var tempSwitchToPassUpdates = 1;
                        console.log(allSpan);
                        // check if there is a course with same name
                        allSpan.forEach((span2) => {
                            if (
                                span2.innerText.toLowerCase() ===
                                courseDiv
                                    .querySelector('#course-input_edit')
                                    .value.toLowerCase()
                            ) {
                                tempSwitchToPassUpdates = 0;
                            }
                        });

                        if (tempSwitchToPassUpdates === 1) {
                            console.log(span.innerText);
                            span.innerText =
                                courseDiv.querySelector(
                                    '#course-input_edit',
                                ).value;
                            courseDiv.querySelector(
                                '#course-input-edit-pre',
                            ).innerText = span.innerText;
                            span.parentElement.parentElement.querySelector(
                                'h4',
                            ).innerText =
                                '[' +
                                courseDiv.querySelector('#credits-input-edit')
                                    .value +
                                ']';
                            spanMsg = 'Course updated succesfully';
                            spanMsgColor = 'green';
                            createSubjectJsonFromHtml();
                        } else {
                            spanMsg = 'Course already exists';
                            spanMsgColor = 'red';
                        }
                    }
                });
            }

            spanMsgDiv = document.getElementById('span-course-edit');
            spanMsgDiv.innerText = spanMsg;
            spanMsgDiv.style.color = spanMsgColor;
            spanMsgDiv.style.display = 'block';
            hrHide = document.getElementById('hide_br-edit');
            hrHide.style.display = 'none';
            setTimeout(function () {
                spanMsgDiv.style.display = 'none';
                hrHide.style.display = 'inline';
            }, 4000);
        });

    // Add event listeners to li items
    document.querySelectorAll('li').forEach((li) => {
        li.addEventListener('click', function () {
            allDivInLi = this.querySelectorAll('div');
            const teacherName = allDivInLi[0].innerText;
            const slot = allDivInLi[1].innerText;
            const venue = allDivInLi[2].innerText;
            console.log('Teacher Name:', teacherName);
            console.log('Slot:', slot);
            console.log('Venue:', venue);
        });
    });

    // Rest of the code...

    // Add event listeners to li items
    document.querySelectorAll('li').forEach((li) => {
        li.addEventListener('click', function () {
            allDivInLi = this.querySelectorAll('div');
            const teacherName = allDivInLi[0].innerText;
            const slot = allDivInLi[1].innerText;
            const venue = allDivInLi[2].innerText;
            console.log('Teacher Name:', teacherName);
            console.log('Slot:', slot);
            console.log('Venue:', venue);
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
    deactivateSortable();
    addInputFieldsInSection('subjectArea');
}

document
    .querySelector('#courseSaveForm')
    .addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from being submitted normally
        document.querySelector('#saveSubjectModal').click(); // Programmatically click the "Save" button
    });

document
    .querySelector('#teacherSaveForm')
    .addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from being submitted normally
        document.querySelector('#saveTeacherModal').click(); // Programmatically click the "Save" button
    });

// Add event listener to the toggle checkbox
document
    .querySelector('#tt-sub-edit-switch')
    .addEventListener('change', function () {
        // Update the value of editSub based on the checkbox state
        editSub = this.checked;
        if (this.checked) {
            closeAllDropdowns();
        }
    });
