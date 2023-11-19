document.addEventListener('DOMContentLoaded', onPageLoad);
function onPageLoad() {
    console.log(timetableStoragePref);
    console.log('hello');
}

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
    function addRadioClickEvent(ul) {
        // Get all the list items inside the given ul element
        var listItems = ul.querySelectorAll('li');
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
    }

    // Call the function for each ul element separately
    var ulList = document.querySelectorAll('.dropdown ul');
    ulList.forEach(function (ul) {
        addRadioClickEvent(ul);
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
    activateSortable();
}

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
}
