/*
 *  This file contains the events and functions applied to
 *  the timetable
 */

import localforage from 'localforage/dist/localforage';
import html2canvas from 'html2canvas/dist/html2canvas';
import { parse, isValid, add } from 'date-fns';
import { fi, te } from 'date-fns/locale';

var timetableStoragePref = [
    {
        id: 0,
        name: 'Default Table',
        data: [],
        subject: [],
        quick: [],
    },
];

window.activeTable = timetableStoragePref[0];

$(() => {
    /*
        Click event for the add table button
     */
    $('#tt-picker-add').on('click', function () {
        var newTableId =
            timetableStoragePref[timetableStoragePref.length - 1].id + 1;
        var newTableName = 'Table ' + newTableId;

        timetableStoragePref.push({
            id: newTableId,
            name: newTableName,
            data: [],
            quick: [],
        });

        addTableToPicker(newTableId, newTableName);
        switchTable(newTableId);
        updateLocalForage();
        fillPage();
        addEventListeners();
    });

    /*
        Click event for the timetable picker dropdown labels
     */
    $('#tt-picker-dropdown').on('click', '.tt-picker-label', function () {
        var selectedTableId = Number($(this).children('a').data('table-id'));
        switchTable(selectedTableId);
    });

    /*
        Click event to set the data attribute before opening the rename modal
     */
    $('#tt-picker-dropdown').on('click', '.tt-picker-rename', function () {
        var $a = $(this).closest('li').find('a:first');

        var tableId = Number($a.data('table-id'));
        var tableName = $a.text();

        $('#table-name').val(tableName).trigger('focus');
        $('#rename-tt-button').data('table-id', tableId);
    });

    /*
        Click event for the rename button in the rename modal
     */
    $('#rename-tt-button').on('click', function () {
        var tableId = $(this).data('table-id');
        var tableName = $('#table-name').val().trim();

        if (tableName == '') {
            tableName = 'Untitled Table';
        }

        renameTable(tableId, tableName);
    });

    /*
        Keydown event for the input table name field in the rename modal
     */
    $('#table-name').on('keydown', function (e) {
        if (e.key == 'Enter') {
            $('#rename-tt-button').trigger('click');
        }
    });

    /*
        Click event to set the data attribute before opening the delete modal
     */
    $('#tt-picker-dropdown').on('click', '.tt-picker-delete', function () {
        var tableId = Number(
            $(this).closest('li').find('a:first').data('table-id'),
        );

        $('#delete-tt-button').data('table-id', tableId);
    });

    /*
        Click event for the delete button in the delete modal
     */
    $('#delete-tt-button').on('click', function () {
        var tableId = $(this).data('table-id');
        deleteTable(tableId);

        if (timetableStoragePref.length == 1) {
            $('#tt-picker-dropdown .tt-picker-delete').first().remove();
            fillPage();
            addEventListeners();
        }
    });

    /*
        Click event for the download timetable button in the download modal
     */
    $('#download-tt-button').on('click', function () {
        var buttonText = $(this).html();
        $(this)
            .html(
                `<span
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                ></span>&nbsp;&nbsp;Please Wait`,
            )
            .attr('disabled', true);

        const width = $('#timetable')[0].scrollWidth;
        var $layout = $('<div></div>').css({
            padding: '2rem',
            position: 'absolute',
            top: 0,
            left: `calc(-${width}px - 4rem)`,
        });

        $layout = appendHeader($layout, width);

        const $timetableClone = $('#timetable').clone().css({
            width: width,
        });
        $('table', $timetableClone).css({
            margin: 0,
        });
        $('tr', $timetableClone).css({
            border: 'none',
        });

        $layout.append($timetableClone);
        $('body').append($layout);

        html2canvas($layout[0], {
            scrollX: -window.scrollX,
            scrollY: -window.scrollY,
        }).then((canvas) => {
            $layout.remove();
            $(this).html(buttonText).attr('disabled', false);

            var $a = $('<a></a>')
                .css({
                    display: 'none',
                })
                .attr('href', canvas.toDataURL('image/jpeg'))
                .attr(
                    'download',
                    `FFCS On The Go ${activeTable.name} (Timetable).jpg`,
                );

            $('body').append($a);
            $a[0].click();
            $a.remove();
        });
    });

    /*
        Click event for the download course list button in the download modal
     */
    $('#download-course-list-button').on('click', function () {
        var buttonText = $(this).html();
        $(this)
            .html(
                `<span
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                ></span>&nbsp;&nbsp;Please Wait`,
            )
            .attr('disabled', true);

        const width = $('#course-list')[0].scrollWidth;
        var $layout = $('<div></div>').css({
            padding: '2rem',
            position: 'absolute',
            top: 0,
            left: `calc(-${width}px - 4rem)`,
        });

        $layout = appendHeader($layout, width);

        const $courseListClone = $('#course-list').clone().css({
            width: width,
            border: '1px solid var(--table-border-color)',
            'border-bottom': 'none',
        });
        $('table', $courseListClone).css({
            margin: 0,
        });
        $('tr', $courseListClone)
            .css({
                border: 'none',
            })
            .each(function () {
                if ($(this).children().length == 1) {
                    return;
                }

                $('th:last-child', this).remove();
                $('td:last-child', this).remove();
            });

        $layout.append($courseListClone);
        $('body').append($layout);

        html2canvas($layout[0], {
            scrollX: -window.scrollX,
            scrollY: -window.scrollY,
        }).then((canvas) => {
            $layout.remove();
            $(this).html(buttonText).attr('disabled', false);

            var $a = $('<a></a>')
                .css({
                    display: 'none',
                })
                .attr('href', canvas.toDataURL('image/jpeg'))
                .attr(
                    'download',
                    `FFCS On The Go ${activeTable.name} (Course List).jpg`,
                );

            $('body').append($a);
            $a[0].click();
            $a.remove();
        });
    });

    /*
        Click event for the quick visualization button
     */
    $('#quick-toggle').on('click', function () {
        if ($(this).attr('data-state') == 'enabled') {
            $('i', this).prop('class', 'fas fa-eye');
            $('span', this).html('&nbsp;&nbsp;Enable Quick Visualization');
            $(this).attr('data-state', 'disabled');

            $('#timetable .highlight:not(:has(div))').removeClass('highlight');
        } else {
            $('i', this).prop('class', 'fas fa-eye-slash');
            $('span', this).html('&nbsp;&nbsp;Disable Quick Visualization');
            $(this).attr('data-state', 'enabled');

            activeTable.quick.forEach((el) =>
                $('#timetable')
                    .find('tr')
                    .eq(el[0])
                    .find('td')
                    .eq(el[1])
                    .addClass('highlight'),
            );
        }

        $('.quick-buttons').slideToggle();
    });

    /*
        Click event for the reset button in the reset modal
     */
    $('#reset-tt-button').on('click', function () {
        resetPage();
        activeTable.data = [];
        activeTable.quick = [];
        activeTable['subject'] = {};
        updateLocalForage();
        showAddTeacherDiv();
        fillPage();
        addEventListeners();
    });
});

/*
    Function to add a header to the images
 */
function appendHeader($layout, width) {
    const $header = $('<div></div>')
        .css({
            width: width,
            'margin-bottom': '1rem',
        })
        .append(
            $('<h3>FFCS On The Go</h3>').css({
                margin: 0,
                display: 'inline',
                color: '#9c27b0',
                'font-weight': 'bold',
            }),
        )
        .append(
            $(`<h3>${campus} Campus</h3>`).css({
                margin: 0,
                display: 'inline',
                color: '#707070',
                float: 'right',
            }),
        )
        .append(
            $('<hr>').css({
                'border-color': '#000000',
                'border-width': '2px',
            }),
        );
    const $title = $(`<h4>${activeTable.name}</h4>`).css({
        'margin-bottom': '1rem',
        width: width,
        'text-align': 'center',
    });

    return $layout.append($header).append($title);
}

/*
    Function to update the saved data
 */
function updateLocalForage() {
    localforage
        .setItem('timetableStoragePref', timetableStoragePref)
        .catch(console.error);
}

/*
    Function to get the table index
 */
function getTableIndex(id) {
    return timetableStoragePref.findIndex((el) => el.id == id);
}

/*
    Function to fill the timetable and course list
 */
function fillPage() {
    $.each(activeTable.data, function (index, courseData) {
        addCourseToCourseList(courseData);
        addCourseToTimetable(courseData);
    });

    $.each(activeTable.quick, function (index, el) {
        var $el = $('#timetable').find('tr').eq(el[0]).find('td').eq(el[1]);
        var slot = $el.get(0).classList[1];

        $(`.quick-buttons .${slot}-tile`).addClass('highlight');

        if ($('#quick-toggle').attr('data-state') == 'enabled') {
            $el.addClass('highlight');
        }
    });
}

/*
    Function to change the active table
 */
function switchTable(tableId) {
    resetPage();

    activeTable = timetableStoragePref[getTableIndex(tableId)];
    updatePickerLabel(activeTable.name);
    showAddTeacherDiv();
    fillPage();
    addEventListeners();
}

/*
    Function to rename the timetable picker label
 */
function updatePickerLabel(tableName) {
    $('#tt-picker-button').text(tableName);
    showAddTeacherDiv();
    fillPage();
}

/*
    Function to delete a table
 */
function deleteTable(tableId) {
    var tableIndex = getTableIndex(tableId);
    timetableStoragePref.splice(tableIndex, 1);
    updateLocalForage();

    // Check if the active table is deleted
    if (activeTable.id == tableId) {
        if (tableIndex == 0) {
            switchTable(timetableStoragePref[0].id);
        } else {
            switchTable(timetableStoragePref[tableIndex - 1].id);
        }
    }

    // Removing the timetable picker item
    $('#tt-picker-dropdown .tt-picker-label')
        .find(`[data-table-id="${tableId}"]`)
        .closest('li')
        .remove();
}

/*
    Function to rename a table
 */
function renameTable(tableId, tableName) {
    var tableIndex = getTableIndex(tableId);
    timetableStoragePref[tableIndex].name = tableName;
    updateLocalForage();
    console.log(timetableStoragePref);

    // Check if the active table is renamed
    if (activeTable.id == tableId) {
        updatePickerLabel(tableName);
    }

    // Renaming the timetable picker item
    $('#tt-picker-dropdown .tt-picker-label')
        .find(`[data-table-id="${tableId}"]`)
        .text(tableName);
}

/*
    Function to add a table to the timetable picker
 */
function addTableToPicker(tableId, tableName) {
    $('#tt-picker-dropdown').append(
        `<li>
            <table class="dropdown-item">
                <td class="tt-picker-label">
                    <a href="JavaScript:void(0);" data-table-id="${tableId}"
                        >${tableName}</a
                    >
                </td>
                <td>
                    <a
                        class="tt-picker-rename"
                        href="JavaScript:void(0);"
                        data-bs-toggle="modal"
                        data-bs-target="#rename-modal"
                        ><i class="fas fa-pencil-alt"></i
                    ></a
                    ><a
                        class="tt-picker-delete"
                        href="JavaScript:void(0);"
                        data-bs-toggle="modal"
                        data-bs-target="#delete-modal"
                        ><i class="fas fa-trash"></i
                    ></a>
                </td>
            </table>
        </li>`,
    );

    if (timetableStoragePref.length == 2) {
        $('#tt-picker-dropdown .tt-picker-rename')
            .first()
            .after(
                `<a
                    class="tt-picker-delete"
                    href="JavaScript:void(0);"
                    data-bs-toggle="modal"
                    data-bs-target="#delete-modal"
                    ><i class="fas fa-trash"></i
                ></a>`,
            );
    }
    showAddTeacherDiv();
}

/*
    Function to check if slots are clashing
 */
function checkSlotClash() {
    $('#timetable tr td').removeClass('clash');
    $('#course-list tr').removeClass('table-danger');

    const $theoryHours = $('#theory td:not(.lunch)');
    const $labHours = $('#lab td:not(.lunch)');

    $('#timetable tr').each(function () {
        $('.highlight', this).each(function () {
            const index = $(this).index();
            var currentEnd, nextStart;

            if ($('div', this).data('is-lab')) {
                currentEnd = parse(
                    $labHours.eq(index).data('end'),
                    'h:mm aa',
                    new Date(),
                );

                if (!isValid(currentEnd)) {
                    currentEnd = parse(
                        $labHours.eq(index).data('end'),
                        'HH:mm',
                        new Date(),
                    );
                }
            } else if ($('div', this).data('is-theory')) {
                currentEnd = parse(
                    $theoryHours.eq(index).data('end'),
                    'h:mm aa',
                    new Date(),
                );

                if (!isValid(currentEnd)) {
                    currentEnd = parse(
                        $theoryHours.eq(index).data('end'),
                        'HH:mm',
                        new Date(),
                    );
                }
            }

            if ($('div', $(this).next()).data('is-lab')) {
                nextStart = parse(
                    $labHours.eq(index + 1).data('start'),
                    'h:mm aa',
                    new Date(),
                );

                if (!isValid(nextStart)) {
                    nextStart = parse(
                        $labHours.eq(index + 1).data('start'),
                        'HH:mm',
                        new Date(),
                    );
                }
            } else if ($('div', this).data('is-theory')) {
                nextStart = parse(
                    $theoryHours.eq(index + 1).data('start'),
                    'h:mm aa',
                    new Date(),
                );

                if (!isValid(nextStart)) {
                    nextStart = parse(
                        $theoryHours.eq(index + 1).data('start'),
                        'HH:mm',
                        new Date(),
                    );
                }
            }

            if ($('div', this).length > 1) {
                $(this).addClass('clash');

                $('div', this).each(function () {
                    const dataCourse = $(this).data('course');
                    $(`#course-list tr[data-course=${dataCourse}]`).addClass(
                        'table-danger',
                    );
                });
            }

            if (nextStart && nextStart < currentEnd) {
                $(this).addClass('clash');
                $(this).next().addClass('clash');

                const dataCourse = $('div', this).data('course');
                $(`#course-list tr[data-course=${dataCourse}]`).addClass(
                    'table-danger',
                );

                $('div', $(this).next()).each(function () {
                    const dataCourse = $(this).data('course');
                    $(`#course-list tr[data-course=${dataCourse}]`).addClass(
                        'table-danger',
                    );
                });
            }
        });
    });
}

/*
    Function to initialize quick visualization
 */
function initializeQuickVisualization() {
    showAddTeacherDiv();
    /*
        Click event for the quick visualization buttons
     */
    $('.quick-buttons *[class*="-tile"]').on('click', function () {
        var slot = this.classList[0].split('-')[0];

        if (
            !$(`#timetable .${slot}`).hasClass('clash') &&
            $(`#timetable .${slot}`).children('div').length == 0
        ) {
            var slots = [];

            $(`#timetable .${slot}`).each((i, el) => {
                var row = $(el).parent().index();
                var column = $(el).index();

                slots.push([row, column]);
            });

            if ($(this).hasClass('highlight')) {
                $(`#timetable .${slot}`).removeClass('highlight');

                activeTable.quick = activeTable.quick.filter((el) => {
                    for (var i = 0; i < slots.length; ++i) {
                        if (el[0] == slots[i][0] && el[1] == slots[i][1]) {
                            return false;
                        }
                    }

                    return true;
                });
            } else {
                $(`#timetable .${slot}`).addClass('highlight');
                activeTable.quick.push(...slots);
            }

            $(this).toggleClass('highlight');
            updateLocalForage();
        }
    });

    /*
        Click event for the periods when quick visualization is enabled
     */
    $('#timetable .period:not([disabled])').on('click', function () {
        if (
            $('#quick-toggle').attr('data-state') == 'enabled' &&
            !$(this).hasClass('clash') &&
            $(this).children('div').length == 0
        ) {
            var slot = this.classList[1];
            var row = $(this).parent().index();
            var column = $(this).index();

            $(this).toggleClass('highlight');

            if (!$(this).hasClass('highlight')) {
                activeTable.quick = activeTable.quick.filter(
                    (el) => el[0] != row || el[1] != column,
                );
            } else {
                activeTable.quick.push([row, column]);
            }

            if ($(`#timetable .${slot}`).not('.highlight').length == 0) {
                $(`.quick-buttons .${slot}-tile`).addClass('highlight');
            } else {
                $(`.quick-buttons .${slot}-tile`).removeClass('highlight');
            }

            updateLocalForage();
        }
    });
}

/*
    Function to initialize the timetable
 */
window.initializeTimetable = () => {
    var timetable;
    $('#timetable tr').slice(2).hide();
    $('#timetable tr td:not(:first-child)').remove();

    if (window.campus == 'Chennai') {
        timetable = require('../schemas/chennai.json');
    } else {
        timetable = require('../schemas/vellore.json');
    }

    var theory = timetable.theory,
        lab = timetable.lab;
    var theoryIndex = 0,
        labIndex = 0;
    var $quickButtons = $('.quick-buttons').eq(0); // Morning slot quick buttons

    while (theoryIndex < theory.length || labIndex < lab.length) {
        const theorySlots = theory[theoryIndex];
        const labSlots = lab[labIndex];

        if (theorySlots && labSlots && !theorySlots.days && !labSlots.days) {
            $('#timetable tr:first').append(
                '<td class="lunch" style="width: 8px;" rowspan="9">L<br />U<br />N<br />C<br />H</td>',
            );
            $quickButtons = $('.quick-buttons').eq(1); // Afternoon slot quick buttons
            ++theoryIndex;
            ++labIndex;

            continue;
        }

        const $theoryHour = $('<td class="theory-hour"></td>');
        const $labHour = $('<td class="lab-hour"></td>');

        if (theorySlots && theorySlots.start && theorySlots.end) {
            $theoryHour.html(
                `${theorySlots.start}<br />to<br />${theorySlots.end}`,
            );
            $theoryHour.data('start', theorySlots.start);
            $theoryHour.data('end', theorySlots.end);
        }

        if (labSlots && labSlots.start && labSlots.end) {
            $labHour.html(`${labSlots.start}<br />to<br />${labSlots.end}`);
            $labHour.data('start', labSlots.start);
            $labHour.data('end', labSlots.end);
        }

        $('#theory').append($theoryHour);
        $('#lab').append($labHour);

        const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        for (var i = 0; i < days.length; ++i) {
            const $period = $('<td class="period"></td>');
            const day = days[i];

            if (theorySlots && theorySlots.days && day in theorySlots.days) {
                const slot = theorySlots.days[day];
                $period.text(slot);
                $period.addClass(slot);
                $(`#${day}`).show();

                // Add quick buttons for theory slots
                if (!$(`.${slot}-tile`).get(0)) {
                    var index = slot.replace(/[^A-Z]/gi, '').length - 1;

                    while (index >= $quickButtons.find('tr').length) {
                        $quickButtons.find('table').append('<tr></tr>');
                    }

                    $quickButtons
                        .find('tr')
                        .eq(index)
                        .append(
                            `<button class="${slot}-tile btn quick-button">${slot}</button>`,
                        );
                }
            }

            if (labSlots && labSlots.days && day in labSlots.days) {
                const slot = labSlots.days[day];
                $period.text(
                    ($period.text() != '' ? $period.text() + ' / ' : '') + slot,
                );
                $period.addClass(slot);
                $(`#${day}`).show();
            }

            if ($period.text() == '') {
                $period.attr('disabled', true);
            }

            $(`#${day}`).append($period);
        }

        if (theorySlots && !theorySlots.lunch) {
            ++theoryIndex;
        }

        if (labSlots && !labSlots.lunch) {
            ++labIndex;
        }
    }
    showAddTeacherDiv();
    initializeQuickVisualization();

    /*
        Getting saved data from localforage
     */
    localforage
        .getItem('timetableStoragePref')
        .then(function (storedValue) {
            timetableStoragePref = storedValue || timetableStoragePref;
            activeTable = timetableStoragePref[0];

            updatePickerLabel(activeTable.name);

            // Renaming the 'Default Table' option
            $('#tt-picker-dropdown .tt-picker-label a')
                .first()
                .attr('data-table-id', activeTable.id)
                .text(activeTable.name);

            timetableStoragePref.slice(1).forEach(function (table) {
                addTableToPicker(table.id, table.name);
            });
        })
        .catch(console.error);
    showAddTeacherDiv();
};

/*
    Function to add a course to the timetable
 */
window.addCourseToTimetable = (courseData) => {
    courseData.slots.forEach(function (slot) {
        var $divElement = $(
            `<div 
                data-course="course${courseData.courseId}"
                >${courseData.courseCode}${
                courseData.venue != '' ? '-' + courseData.venue : ''
            }</div
            >`,
        );

        if (courseData.slots[0][0] == 'L') {
            $divElement.data('is-lab', true);
        } else {
            $divElement.data('is-theory', true);
        }

        $(`#timetable tr .${slot}`).addClass('highlight').append($divElement);

        $(`.quick-buttons .${slot}-tile`).addClass('highlight');
    });
    showAddTeacherDiv();
    checkSlotClash();
    updateLocalForage();
};

/*
    Function to remove a course from the timetable
 */
window.removeCourseFromTimetable = (course) => {
    $(`#timetable tr td div[data-course="${course}"]`)
        .parent()
        .each(function () {
            if ($(this).children().length != 1) {
                return;
            }

            $(this).removeClass('highlight');
            var slot = this.classList[1];

            if (!$(`.quick-buttons .${slot}-tile`).hasClass('highlight')) {
                return;
            }

            var row = $(this).parent().index();
            var column = $(this).index();

            for (var i = 0; i < activeTable.quick.length; ++i) {
                var el = activeTable.quick[i];

                if (el[0] == row && el[1] == column) {
                    if ($('#quick-toggle').attr('data-state') == 'enabled') {
                        $(this).addClass('highlight');
                    }

                    return;
                }
            }

            $(`.quick-buttons .${slot}-tile`).removeClass('highlight');
        });

    $(`#timetable tr td div[data-course="${course}"]`).remove();
    showAddTeacherDiv();
    checkSlotClash();
    updateLocalForage();
};

/*
    Function to clear the timetable from the body but not delete it's data
 */

window.clearTimetable = () => {
    $('#timetable .period').removeClass('highlight clash');
    $('.quick-buttons *[class*="-tile"]').removeClass('highlight');

    if ($('#timetable tr div[data-course]')) {
        $('#timetable tr div[data-course]').remove();
    }
    showAddTeacherDiv();
};

// save
document
    .getElementById('saveSubjectModal')
    .addEventListener('click', function () {
        const courseName = document
            .getElementById('course-input_remove')
            .value.trim();
        const credits = parseInt(
            document.getElementById('credits-input').value.trim(),
        );

        function addSubDiv(subjectName, credits) {
            const div = document.createElement('div');
            div.classList.add('dropdown');
            div.classList.add('dropdown-teacher');
            const divHeading = document.createElement('div');
            divHeading.classList.add('dropdown-heading');
            divHeading.setAttribute('onclick', 'toggleDropdown(this)');
            const divH2s = document.createElement('div');
            divH2s.classList.add('h2s');
            divH2s.style.display = 'flex';
            divH2s.style.flexDirection = 'row';
            const h2 = document.createElement('h2');
            const spanCname = document.createElement('span');
            spanCname.classList.add('cname');
            spanCname.textContent = subjectName;
            const pArrow = document.createElement('p');
            pArrow.classList.add('arrow');
            const h4 = document.createElement('h4');
            h4.textContent = `[${credits}]`;
            divH2s.appendChild(h2);
            divH2s.appendChild(h4);
            h2.appendChild(spanCname);
            h2.appendChild(pArrow);
            divHeading.appendChild(divH2s);
            div.appendChild(divHeading);
            const ul = document.createElement('ul');
            ul.classList.add('dropdown-list');
            div.appendChild(ul);
            document.getElementById('subjectArea').appendChild(div);
        }
        // <div class="dropdown dropdown-teacher"><div class="dropdown-heading" onclick="toggleDropdown(this)"><div class="h2s" style="display: flex; flex-direction: row;"><h2><span class="cname">sss</span><p class="arrow"></p></h2><h4>[1]</h4></div></div><ul class="dropdown-list"></ul></div>

        const spanCourseAddSuccess = document.getElementById('span-course-add');
        var spanMsg = '';
        var spanMsgColor = '';
        if (courseName === '' || isNaN(credits)) {
            if (courseName === '' && isNaN(credits)) {
                spanMsg = 'Course Name and Credits are empty';
                spanMsgColor = 'red';
            } else if (courseName === '') {
                spanMsg = 'Course Name is empty';
                spanMsgColor = 'red';
            } else if (isNaN(credits)) {
                spanMsg = 'Credits is empty';
                spanMsgColor = 'red';
            }
        } else {
            if (
                !timetableStoragePref[window.activeTable.id].hasOwnProperty(
                    'subject',
                )
            ) {
                timetableStoragePref[window.activeTable.id]['subject'] = {};
                const subject = { teacher: {}, credits: credits };
                timetableStoragePref[window.activeTable.id].subject[
                    courseName
                ] = subject;
                spanMsg = 'Course Added Successfully';
                spanMsgColor = 'green';
                document.getElementById('course-input_remove').value = '';
                document.getElementById('credits-input').value = '';
                addSubDiv(courseName, credits);
            } else if (
                !Object.keys(
                    timetableStoragePref[window.activeTable.id].subject,
                )
                    .map((key) => key.toLowerCase())
                    .includes(courseName.toLowerCase())
            ) {
                const subject = { teacher: {}, credits: credits };
                timetableStoragePref[window.activeTable.id].subject[
                    courseName
                ] = subject;
                spanMsg = 'Course Added Successfully';
                spanMsgColor = 'green';
                document.getElementById('course-input_remove').value = '';
                document.getElementById('credits-input').value = '';
                addSubDiv(courseName, credits);
            } else {
                spanMsg = 'Course Already Exists';
                spanMsgColor = 'orange';
            }
            console.log(timetableStoragePref);
            updateLocalForage();
        }
        document.getElementById('hide_br').style.display = 'none';
        spanCourseAddSuccess.style.color = spanMsgColor;
        spanCourseAddSuccess.style.fontWeight = 'bolder';
        spanCourseAddSuccess.textContent = spanMsg;
        setTimeout(() => {
            spanCourseAddSuccess.textContent = '';
            document.getElementById('hide_br').style.display = 'inline';
        }, 5000);
    });

// show teacher view + refresh and build the course select input
function showAddTeacherDiv() {
    var addCourseDiv = document.getElementById('div-for-add-course');
    var addTeacherDiv = document.getElementById('div-for-add-teacher');
    addCourseDiv.style.display = 'none';
    addTeacherDiv.style.display = 'block';
    const courseSelect = document.getElementById('course-select-add-teacher');
    courseSelect.innerHTML = '';
    if (
        !timetableStoragePref[window.activeTable.id].hasOwnProperty('subject')
    ) {
        courseSelect.innerHTML =
            '<option selected>You need to add courses</option>';
        console.log('No subject');
    } else {
        if (
            Object.keys(timetableStoragePref[window.activeTable.id].subject)
                .length === 0
        ) {
            courseSelect.innerHTML =
                '<option selected>You need to add courses</option>';
        } else {
            courseSelect.innerHTML = '<option selected>Select Course</option>';
            console.log(timetableStoragePref[window.activeTable.id].subject);
            Object.keys(
                timetableStoragePref[window.activeTable.id].subject,
            ).forEach((key) => {
                const option = document.createElement('option');
                option.value = key;
                option.text = key;
                courseSelect.appendChild(option);
            });
        }
    }
}

// load teacher view
document
    .getElementById('tt-teacher-add')
    .addEventListener('click', function () {
        showAddTeacherDiv();
        console.log(
            JSON.stringify(timetableStoragePref[window.activeTable.id]),
        );
        addEventListeners();
    });

// close the edit view
function closeEditPref() {
    document.getElementById('tt-subject-edit').style.display = 'block';
    document.getElementById('tt-subject-add').style.display = 'block';
    document.getElementById('tt-teacher-add').style.display = 'block';
    document.getElementById('tt-subject-collapse').style.display = 'none';
    document.getElementById('tt-subject-done').style.display = 'none';
    document.getElementById('div-for-add-teacher').style.display = 'block';
    document.getElementById('tt-sub-edit-switch-div').style.display = 'none';
    document.getElementById('tt-sub-edit-switch').checked = false;
    document.getElementById('div-for-edit-course').style.display = 'none';
    editSub = false;
    createSubjectJsonFromHtml();
}
document
    .getElementById('tt-subject-done')
    .addEventListener('click', closeEditPref);

// Save teacher
document
    .getElementById('saveTeacherModal')
    .addEventListener('click', function () {
        const courseName = document.getElementById(
            'course-select-add-teacher',
        ).value;
        const teacherName = document
            .getElementById('teacher-input_remove')
            .value.trim();
        var slotsInput = document
            .getElementById('slot-input')
            .value.trim()
            .toUpperCase();
        var venueInput = document
            .getElementById('venue-input')
            .value.trim()
            .toUpperCase();
        const colorInput = document.getElementById('color1-select').value;
        const spanTeacherAddSuccess =
            document.getElementById('span-teacher-add');
        console.log(colorInput);
        var spanMsg = '';
        var spanMsgColor = '';
        if (courseName === 'Select Course' || teacherName === '') {
            if (courseName === 'Select Course' && teacherName === '') {
                spanMsg = 'Course Name and Teacher Name are empty';
                spanMsgColor = 'red';
            } else if (courseName === 'Select Course') {
                spanMsg = 'Course Name is empty';
                spanMsgColor = 'red';
            } else if (teacherName === '') {
                spanMsg = 'Teacher Name is empty';
                spanMsgColor = 'red';
            }
        } else {
            if (
                !timetableStoragePref[window.activeTable.id].hasOwnProperty(
                    'subject',
                ) ||
                Object.keys(timetableStoragePref[window.activeTable.id].subject)
                    .length === 0
            ) {
                spanMsg = 'You need to add courses first';
                spanMsgColor = 'red';
            } else if (
                !Object.keys(
                    timetableStoragePref[window.activeTable.id].subject,
                )
                    .map((key) => key.toLowerCase())
                    .includes(courseName.toLowerCase())
            ) {
                spanMsg = 'Course Does Not Exist';
                spanMsgColor = 'red';
            } else {
                if (
                    !Object.keys(
                        timetableStoragePref[window.activeTable.id].subject[
                            courseName
                        ].teacher,
                    )
                        .map((key) => key.toLowerCase())
                        .includes(teacherName.toLowerCase())
                ) {
                    timetableStoragePref[window.activeTable.id].subject[
                        courseName
                    ].teacher[teacherName] = {
                        slots: 'SLOTS',
                        venue: 'VENUE',
                        color: '',
                    };
                    if (slotsInput === '') {
                        slotsInput = 'SLOTS';
                    }
                    if (venueInput === '') {
                        venueInput = 'VENUE';
                    }

                    timetableStoragePref[window.activeTable.id].subject[
                        courseName
                    ].teacher[teacherName]['venue'] = venueInput;
                    timetableStoragePref[window.activeTable.id].subject[
                        courseName
                    ].teacher[teacherName]['slots'] = slotsInput;
                    timetableStoragePref[window.activeTable.id].subject[
                        courseName
                    ].teacher[teacherName]['color'] = colorInput;
                    spanMsg = 'Teacher Added Successfully';
                    spanMsgColor = 'green';
                    document.getElementById('slot-input').value = '';

                    const li = document.createElement('li');
                    li.style.backgroundColor = colorInput;

                    const input = document.createElement('input');
                    input.type = 'radio';
                    input.name = 'option';
                    input.value = teacherName;

                    const teacherNameDiv = document.createElement('div');
                    teacherNameDiv.style.paddingLeft = '4%';
                    teacherNameDiv.style.width = '45%';
                    teacherNameDiv.innerText = teacherName;

                    const slotsDiv = document.createElement('div');
                    slotsDiv.style.width = '40%';
                    slotsDiv.style.opacity = '70%';
                    slotsDiv.innerText = slotsInput;

                    const venueDiv = document.createElement('div');
                    venueDiv.style.width = '15%';
                    venueDiv.style.opacity = '70%';
                    venueDiv.innerText = venueInput;

                    li.appendChild(input);
                    li.appendChild(teacherNameDiv);
                    li.appendChild(slotsDiv);
                    li.appendChild(venueDiv);

                    const dropdownDivs = document.querySelectorAll('.dropdown');
                    console.log('test 1 pass');
                    for (let dropdownDiv of dropdownDivs) {
                        const cname = dropdownDiv.querySelector('.cname');
                        if (cname && cname.textContent === courseName) {
                            const ul = dropdownDiv.querySelector('ul');
                            if (ul && ul.tagName === 'UL') {
                                ul.appendChild(li);
                                addEventListeners();
                            }
                            // Exit the loop once we've found the matching element
                        }
                    }
                } else {
                    console.log('else if');

                    spanMsg = 'Teacher Already Exists';
                    spanMsgColor = 'orange';
                }
            }
            updateLocalForage();
        }
        document.getElementById('hide_br').style.display = 'none';
        spanTeacherAddSuccess.style.color = spanMsgColor;
        spanTeacherAddSuccess.style.fontWeight = 'bolder';
        spanTeacherAddSuccess.textContent = spanMsg;
        setTimeout(() => {
            spanTeacherAddSuccess.textContent = '';
            document.getElementById('hide_br').style.display = 'inline';
        }, 5000);
        console.log(timetableStoragePref);
    });

// Targets the li to make it toggable when clicked anywhere on the li element eg the teacher name list
function addEventListeners() {
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
                try {
                    radioButton.checked = false;
                    current = null; // No radio button is currently selected
                    radioButton.parentElement.querySelectorAll('div');
                    console.log(
                        'Deselect',
                        radioButton.parentElement.querySelectorAll('div')[0]
                            .innerText,
                    );
                } catch (error) {
                    console.log('error');
                }
            }
            // Otherwise, deselect the currently selected radio button (if any) and select this one
            else {
                if (current) current.checked = false;
                try {
                    radioButton.checked = true;
                    if (current !== null) {
                        console.log(
                            'Deselect 2',
                            current.parentElement.querySelectorAll('div')[0]
                                .innerText,
                        );
                    }

                    current = radioButton; // This radio button is now the currently selected one
                    console.log(
                        'Select',
                        current.parentElement.querySelectorAll('div')[0]
                            .innerText,
                    );
                    var course =
                        current.parentElement.parentElement.parentElement.parentElement.querySelector(
                            'h2 .cname',
                        ).innerText;
                    var faculty =
                        current.parentElement.querySelectorAll('div')[0]
                            .innerText;
                    var slotString =
                        current.parentElement.querySelectorAll('div')[1]
                            .innerText;
                    var venue =
                        current.parentElement.querySelectorAll('div')[2]
                            .innerText;
                    var credits = parseInt(
                        current.parentElement.parentElement.parentElement.parentElement
                            .querySelector('h4')
                            .textContent.replace('[', '')
                            .replace(']', ''),
                    );
                    var isProject = false;
                    var slots = (function () {
                        var arr = [];

                        try {
                            slotString.split(/\s*\+\s*/).forEach(function (el) {
                                if (el && $('.' + el)) {
                                    arr.push(el);
                                }
                            });
                        } catch (error) {
                            arr = [];
                        }

                        return arr;
                    })();
                    var courseId = 0;
                    if (activeTable.data.length != 0) {
                        var lastAddedCourse =
                            activeTable.data[activeTable.data.length - 1];
                        courseId = lastAddedCourse.courseId + 1;
                    }
                    courseTitle = course;
                    var courseData = {
                        courseId: courseId,
                        courseTitle: course,
                        faculty: faculty,
                        slots: slots,
                        venue: venue,
                        credits: credits,
                        isProject: isProject,
                        courseCode: 'course',
                    };
                    activeTable.data.push(courseData);
                    addCourseToCourseList(courseData);
                    addCourseToTimetable(courseData);
                } catch (error) {
                    console.log('error');
                }
            }
        });
    }
}

// Call the function after the HTML is generated

// Function to create the HTML for subject dropdown
function createSubjectDropdown(courseName, subject) {
    console.log(subject);
    var sub = Object.keys(subject)[0];

    const dropdown = document.createElement('div');
    dropdown.classList.add('dropdown');
    dropdown.classList.add('dropdown-teacher');

    const dropdownHeading = document.createElement('div');
    dropdownHeading.classList.add('dropdown-heading');
    dropdownHeading.setAttribute('onclick', 'toggleDropdown(this)');

    const h2sDiv = document.createElement('div');
    h2sDiv.classList.add('h2s');
    h2sDiv.style.display = 'flex';
    h2sDiv.style.flexDirection = 'row';

    const cName = document.createElement('span');
    cName.classList.add('cname');
    cName.innerText = courseName;
    const h2 = document.createElement('h2');
    h2.innerText = '';
    h2.appendChild(cName);

    const span = document.createElement('p');
    span.classList.add('arrow');

    const h4 = document.createElement('h4');
    h4.innerText = `[${subject.credits}]`;
    h2.appendChild(span);
    h2sDiv.appendChild(h2);
    h2sDiv.appendChild(h4);

    dropdownHeading.appendChild(h2sDiv);

    const dropdownList = document.createElement('ul');
    dropdownList.classList.add('dropdown-list');

    for (const teacherName in subject.teacher) {
        const teacher = subject.teacher[teacherName];

        const li = document.createElement('li');
        li.style.backgroundColor = teacher.color;

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'option';
        input.value = teacherName;

        const teacherNameDiv = document.createElement('div');
        teacherNameDiv.style.paddingLeft = '4%';
        teacherNameDiv.style.width = '45%';
        teacherNameDiv.innerText = teacherName;

        const slotsDiv = document.createElement('div');
        slotsDiv.style.width = '40%';
        slotsDiv.style.opacity = '70%';
        slotsDiv.innerText = teacher.slots;

        const venueDiv = document.createElement('div');
        venueDiv.style.width = '15%';
        venueDiv.style.opacity = '70%';
        venueDiv.innerText = teacher.venue;

        li.appendChild(input);
        li.appendChild(teacherNameDiv);
        li.appendChild(slotsDiv);
        li.appendChild(venueDiv);

        dropdownList.appendChild(li);
    }

    dropdown.appendChild(dropdownHeading);
    dropdown.appendChild(dropdownList);

    return dropdown;
}

// Function to fill the timetable and course list/ subjectArea
function fillPage() {
    const activeId = window.activeTable.id;
    const activeTable = timetableStoragePref[activeId];

    if (activeTable.subject && Object.keys(activeTable.subject).length > 0) {
        const leftBox = document.getElementById('subjectArea');
        leftBox.innerHTML = '';

        for (const courseName in activeTable.subject) {
            const subject = activeTable.subject[courseName];
            const dropdown = createSubjectDropdown(courseName, subject);
            leftBox.appendChild(dropdown);
        }
    } else {
        const leftBox = document.getElementById('subjectArea');
        leftBox.innerHTML = '';
    }
    addEventListeners();
}

// Function to be executed on page load'
// Load the subjectArea show all info
document.addEventListener('DOMContentLoaded', onPageLoad);
function onPageLoad() {
    fillPage();
    console.log(timetableStoragePref);
}
// Add event listener for DOMContentLoaded event

function createSubjectJsonFromHtml() {
    let result = {};
    let dropdowns = document.querySelectorAll('.dropdown-teacher');
    console.log(dropdowns);

    dropdowns.forEach((dropdown) => {
        let courseNameElement = dropdown.querySelector('h2 .cname');
        let courseName = courseNameElement
            ? courseNameElement.textContent
            : null;
        let credits = parseInt(
            dropdown
                .querySelector('h4')
                .textContent.replace('[', '')
                .replace(']', ''),
        );
        let teachers = dropdown.querySelectorAll('li');

        let teacherData = {};

        teachers.forEach((teacher) => {
            let teacherName = teacher.querySelectorAll('div')[0].textContent;
            let slots = teacher.querySelectorAll('div')[1].textContent;
            let venue = teacher.querySelectorAll('div')[2].textContent;
            let color = teacher.style.backgroundColor;

            teacherData[teacherName] = {
                slots: slots,
                venue: venue,
                color: color,
            };
        });

        result[courseName] = {
            teacher: teacherData,
            credits: credits,
        };
    });
    timetableStoragePref[window.activeTable.id].subject = result;
    updateLocalForage();
    addEventListeners();
}

// Edit Subject Save button cliuck event

document
    .getElementById('saveSubjectEditModal')
    .addEventListener('click', function () {
        console.log('Save button clicked');
        let courseDiv = document.getElementById('div-for-edit-course');
        let subjectArea = document.getElementById('subjectArea');
        let allSpan = subjectArea.querySelectorAll('.cname');
        spanMsg = 'Course not updated';
        spanMsgColor = 'red';
        if (
            courseDiv.querySelector('#credits-input-edit').value === '' ||
            courseDiv.querySelector('#credits-input-edit').value < 0
        ) {
            spanMsg = 'Credits cannot be empty';
            spanMsgColor = 'red';
        } else if (courseDiv.querySelector('#course-input_edit').value === '') {
            spanMsg = 'Course name cannot be empty';
            spanMsgColor = 'red';
        } else {
            allSpan.forEach((span) => {
                if (
                    span.innerText.toLowerCase() ===
                    courseDiv
                        .querySelector('#course-input-edit-pre')
                        .innerText.toLowerCase()
                ) {
                    var tempSwitchToPassUpdates = 1;
                    var countSameCourseName = 0;
                    console.log(allSpan);
                    // check if there is a course with same name

                    allSpan.forEach((span2) => {
                        if (
                            span2.innerText.toLowerCase() ===
                            courseDiv
                                .querySelector('#course-input_edit')
                                .value.trim()
                                .toLowerCase()
                        ) {
                            countSameCourseName += 1;
                        }
                    });
                    if (
                        countSameCourseName > 0 &&
                        courseDiv
                            .querySelector('#course-input_edit')
                            .value.trim()
                            .toLowerCase() !==
                            courseDiv
                                .querySelector('#course-input-edit-pre')
                                .innerText.toLowerCase()
                    ) {
                        tempSwitchToPassUpdates = 0;
                    }
                    if (
                        courseDiv
                            .querySelector('#course-input_edit')
                            .value.toString() ===
                            courseDiv
                                .querySelector('#course-input-edit-pre')
                                .innerText.toString() &&
                        courseDiv.querySelector('#credits-input-edit').value ===
                            courseDiv.querySelector('#credit-input-edit-pre')
                                .innerText
                    ) {
                        spanMsg = 'No changes made';
                        spanMsgColor = 'orange';
                    } else if (tempSwitchToPassUpdates === 1) {
                        console.log(span.innerText);
                        span.innerText =
                            courseDiv.querySelector('#course-input_edit').value;
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
                        courseDiv.querySelector(
                            '#credit-input-edit-pre',
                        ).innerText = courseDiv.querySelector(
                            '#credits-input-edit',
                        ).value;
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

// Edit Teacher Save button click event
document
    .getElementById('saveTeacherEdit')
    .addEventListener('click', function () {
        const courseName = document.getElementById('teacher-edit-course').value;
        const teacherNamePre = document.getElementById(
            'teacher-input_remove-edit-pre',
        ).value;
        const teacherName = document
            .getElementById('teacher-input_remove-edit')
            .value.trim();
        const slotsInput = document
            .getElementById('slot-input-edit')
            .value.trim()
            .toUpperCase();
        const venueInput = document
            .getElementById('venue-input-edit')
            .value.trim()
            .toUpperCase();
        console.log('hello testing 123');
        const colorInput = document.getElementById('color1-select-edit').value;
        const spanTeacherMsg = document.getElementById('span-teacher-edit');
        const brHideTeacher = document.getElementById('hide_br_teacher-edit');
        var subjectArea = document.getElementById('subjectArea');
        var allSpan = subjectArea.querySelectorAll('.cname');
        var spanMsg = 'Not Updated';
        var spanMsgColor = 'red';
        for (const span of allSpan) {
            console.log(span.innerText);
            if (span.innerText.toLowerCase() === courseName.toLowerCase()) {
                if (teacherName === '') {
                    spanMsg = 'Teacher name cannot be empty';
                    spanMsgColor = 'red';
                } else if (
                    teacherNamePre.toLowerCase() === teacherName.toLowerCase()
                ) {
                    allLi =
                        span.parentElement.parentElement.parentElement.nextElementSibling.querySelectorAll(
                            'li',
                        );
                    for (const li of allLi) {
                        const allDiv = li.querySelectorAll('div');
                        if (
                            allDiv[0].innerText.toLowerCase() ===
                            teacherNamePre.toLowerCase()
                        ) {
                            allDiv[0].innerText = teacherName;
                            allDiv[1].innerText = slotsInput;
                            allDiv[2].innerText = venueInput;
                            li.style.backgroundColor = colorInput;
                            document.getElementById(
                                'teacher-input_remove-edit-pre',
                            ).value = teacherName;
                            spanMsg = 'Teacher updated successfully';
                            createSubjectJsonFromHtml();
                            spanMsgColor = 'green';
                            break;
                        }
                    }
                } else {
                    allLi =
                        span.parentElement.parentElement.parentElement.nextElementSibling.querySelectorAll(
                            'li',
                        );
                    editTeacherSwitch = 1;
                    for (const li of allLi) {
                        const allDiv = li.querySelectorAll('div');
                        if (
                            allDiv[0].innerText.toLowerCase() ===
                            teacherName.toLowerCase()
                        ) {
                            spanMsg = 'Teacher already exists';
                            spanMsgColor = 'orange';
                            editTeacherSwitch = 0;
                            break;
                        }
                    }
                    if (editTeacherSwitch === 1) {
                        for (const li of allLi) {
                            const allDiv = li.querySelectorAll('div');
                            if (
                                allDiv[0].innerText.toLowerCase() ===
                                teacherNamePre.toLowerCase()
                            ) {
                                allDiv[0].innerText = teacherName;
                                allDiv[1].innerText = slotsInput;
                                allDiv[2].innerText = venueInput;
                                li.style.backgroundColor = colorInput;
                                document.getElementById(
                                    'teacher-input_remove-edit-pre',
                                ).value = teacherName;
                                spanMsg = 'Teacher updated successfully';
                                spanMsgColor = 'green';
                                createSubjectJsonFromHtml();
                                break;
                            }
                        }

                        break;
                    }
                }
            }
        }
        console.log('TEST 1 PASS', spanMsg);
        spanTeacherMsg.innerText = spanMsg;
        spanTeacherMsg.style.color = spanMsgColor;
        spanTeacherMsg.style.display = 'block';
        brHideTeacher.style.display = 'none';
        setTimeout(function () {
            spanTeacherMsg.style.display = 'none';
            brHideTeacher.style.display = 'inline';
        }, 4000);
        return;
    });

// Delete Teacher button click event
document
    .getElementById('deleteTeacherEdit')
    .addEventListener('click', function () {
        const courseName = document.getElementById('teacher-edit-course').value;
        const teacherName = document.getElementById(
            'teacher-input_remove-edit-pre',
        ).value;
        var subjectArea = document.getElementById('subjectArea');
        var allSpan = subjectArea.querySelectorAll('.cname');

        // Confirmation popup
        if (
            !confirm(
                `Are you sure you want to delete ${teacherName} from ${courseName}?`,
            )
        ) {
            spanMsg = 'Teacher not deleted';
            spanMsgColor = 'red';
            const spanTeacherMsg = document.getElementById('span-teacher-edit');
            const brHideTeacher = document.getElementById(
                'hide_br_teacher-edit',
            );
            spanTeacherMsg.innerText = spanMsg;
            spanTeacherMsg.style.color = spanMsgColor;
            spanTeacherMsg.style.display = 'block';
            brHideTeacher.style.display = 'none';
            setTimeout(function () {
                spanTeacherMsg.style.display = 'none';
                brHideTeacher.style.display = 'inline';
            }, 4000);
            return;
        }

        for (const span of allSpan) {
            console.log(span.innerText);
            if (span.innerText.toLowerCase() === courseName.toLowerCase()) {
                allLi =
                    span.parentElement.parentElement.parentElement.nextElementSibling.querySelectorAll(
                        'li',
                    );
                for (const li of allLi) {
                    const allDiv = li.querySelectorAll('div');
                    if (
                        allDiv[0].innerText.toLowerCase() ===
                        teacherName.toLowerCase()
                    ) {
                        li.remove();
                        spanMsg = 'Teacher deleted successfully';
                        spanMsgColor = 'green';
                        createSubjectJsonFromHtml();
                        if (true) {
                            document.getElementById(
                                'div-for-edit-teacher',
                            ).style.display = 'none';
                            document.getElementById('edit_msg_').innerText =
                                'Click on the Teacher to edit it.';
                            document.getElementById('edit_msg_').style.display =
                                'block';
                        }
                        break;
                    }
                }
            }
        }
    });

// Delete for Subject Edit
document
    .getElementById('deleteSubjectEdit')
    .addEventListener('click', function () {
        const courseName = document
            .getElementById('course-input-edit-pre')
            .innerText.trim();
        var subjectArea = document.getElementById('subjectArea');
        var allSpan = subjectArea.querySelectorAll('.cname');
        if (!confirm(`Are you sure you want to delete ${courseName}?`)) {
            spanMsg = 'Course not deleted';
            spanMsgColor = 'red';
            const spanCourseMsg = document.getElementById('span-course-edit');
            const brHideCourse = document.getElementById('hide_br-edit');
            spanCourseMsg.innerText = spanMsg;
            spanCourseMsg.style.color = spanMsgColor;
            spanCourseMsg.style.display = 'block';
            brHideCourse.style.display = 'none';
            setTimeout(function () {
                spanCourseMsg.style.display = 'none';
                brHideCourse.style.display = 'inline';
            }, 4000);
            return;
        }
        for (const span of allSpan) {
            if (span.innerText.toLowerCase() === courseName.toLowerCase()) {
                span.parentElement.parentElement.parentElement.parentElement.remove();
                document.getElementById('div-for-edit-course').style.display =
                    'none';
                document.getElementById('edit_msg_').innerText =
                    'Click on the Subject to edit it.';
                document.getElementById('edit_msg_').style.display = 'block';
                createSubjectJsonFromHtml();
                break;
            }
        }
    });
