/*
 *  This file contains the events and functions applied to
 *  the timetable
 */

import localforage from '../../node_modules/localforage/dist/localforage';
import html2canvas from '../../node_modules/html2canvas/dist/html2canvas';

var timetableStorage = [
    {
        id: 0,
        name: 'Default Table',
        data: [],
    },
];

window.activeTable = timetableStorage[0];

let highlighted = {
    0: [],
    highlight: function(id) {
        if (highlighted[id]) {
            highlighted[id].forEach(function(slot) {
                $(`#timetable .${slot}`).addClass('highlight');
                if ($(`.quick-buttons.${slot}-tile`)) {
                    $(`.quick-buttons.${slot}-tile`).addClass('highlight');
                }
            });

            $('.quick-buttons button:not([disabled])').each(function() {
                if (
                    $(`#timetable .${this.classList[0].split('-')[0]}`).not(
                        '.highlight',
                    ).length == 0
                ) {
                    $(this).addClass('highlight');
                }
            });
        } else {
            highlighted[id] = [];
        }
    },
};

$(() => {
    /*
        Click event for the add table button
     */
    $('#tt-picker-add').on('click', function() {
        var newTableId = timetableStorage[timetableStorage.length - 1].id + 1;
        var newTableName = 'Table ' + newTableId;

        timetableStorage.push({
            id: newTableId,
            name: newTableName,
            data: [],
        });

        addTableToPicker(newTableId, newTableName);
        switchTable(newTableId);
        updateLocalForage();
        highlighted[newTableId] = [];
    });

    /*
        Click event for the timetable picker dropdown labels
     */
    $('#tt-picker-dropdown').on('click', '.tt-picker-label', function() {
        var selectedTableId = Number(
            $(this)
                .children('a')
                .data('table-id'),
        );
        switchTable(selectedTableId);
    });

    /*
        Click event to set the data attribute before opening the rename modal
     */
    $('#tt-picker-dropdown').on('click', '.tt-picker-rename', function() {
        var $a = $(this)
            .closest('li')
            .find('a:first');

        var tableId = Number($a.data('table-id'));
        var tableName = $a.text();

        $('#table-name')
            .val(tableName)
            .trigger('focus');
        $('#rename-tt-button').data('table-id', tableId);
    });

    /*
        Click event for the rename button in the rename modal
     */
    $('#rename-tt-button').on('click', function() {
        var tableId = $(this).data('table-id');
        var tableName = $('#table-name')
            .val()
            .trim();

        if (tableName == '') {
            tableName = 'Untitled Table';
        }

        renameTable(tableId, tableName);
    });

    /*
        Keydown event for the input table name field in the rename modal
     */
    $('#table-name').on('keydown', function(e) {
        if (e.key == 'Enter') {
            $('#rename-tt-button').trigger('click');
        }
    });

    /*
        Click event to set the data attribute before opening the delete modal
     */
    $('#tt-picker-dropdown').on('click', '.tt-picker-delete', function() {
        var tableId = Number(
            $(this)
                .closest('li')
                .find('a:first')
                .data('table-id'),
        );

        $('#delete-tt-button').data('table-id', tableId);
    });

    /*
        Click event for the delete button in the delete modal
     */
    $('#delete-tt-button').on('click', function() {
        var tableId = $(this).data('table-id');
        deleteTable(tableId);

        if (timetableStorage.length === 1) {
            $('#tt-picker-dropdown .tt-picker-delete')
                .first()
                .remove();
        }
    });

    /*
        Click event for the download timetable button in the download modal
     */
    $('#download-tt-button').on('click', function() {
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

        const $timetableClone = $('#timetable')
            .clone()
            .css({
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
            $(this)
                .html(buttonText)
                .attr('disabled', false);

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
    $('#download-course-list-button').on('click', function() {
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

        const $courseListClone = $('#course-list')
            .clone()
            .css({
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
            .each(function() {
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
            $(this)
                .html(buttonText)
                .attr('disabled', false);

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
    $('#quick-toggle').on('click', function() {
        if ($(this).attr('data-state') === 'enabled') {
            $('i', this).prop('class', 'fas fa-eye');
            $('span', this).html('&nbsp;&nbsp;Enable Quick Visualization');
            $(this).attr('data-state', 'disabled');
        } else {
            $('i', this).prop('class', 'fas fa-eye-slash');
            $('span', this).html('&nbsp;&nbsp;Disable Quick Visualization');
            $(this).attr('data-state', 'enabled');
        }

        $('.quick-buttons').slideToggle();
    });

    /*
        Click event for the reset button in the reset modal
     */
    $('#reset-tt-button').on('click', function() {
        resetPage();
        activeTable.data = [];
        updateLocalForage();
        highlighted[activeTable.id] = [];
    });

    /*
        Getting saved data from localforage
     */
    localforage
        .getItem('timetableStorage')
        .then(function(storedValue) {
            timetableStorage = storedValue || timetableStorage;
            activeTable = timetableStorage[0];

            fillPage(activeTable.data);
            updatePickerLabel(activeTable.name);

            // Renaming the 'Default Table' option
            $('#tt-picker-dropdown .tt-picker-label a')
                .first()
                .attr('data-table-id', activeTable.id)
                .text(activeTable.name);

            timetableStorage.slice(1).forEach(function(table) {
                addTableToPicker(table.id, table.name);
            });
        })
        .catch(console.error);
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
        .setItem('timetableStorage', timetableStorage)
        .catch(console.error);
}

/*
    Function to get the table index
 */
function getTableIndex(id) {
    return timetableStorage.findIndex(function(el) {
        return el.id === id;
    });
}

/*
    Function to get the course index
 */
function getCourseIndex(id) {
    return activeTable.data.findIndex(function(el) {
        return el.courseId === id;
    });
}

/*
    Function to fill the timetable and course list
 */
function fillPage(data) {
    $.each(data, function(index, courseData) {
        addCourseToCourseList(courseData);
        addCourseToTimetable(courseData);
    });
}

/*
    Function to change the active table
 */
function switchTable(tableId) {
    resetPage();
    activeTable = timetableStorage[getTableIndex(tableId)];
    updatePickerLabel(activeTable.name);
    fillPage(activeTable.data);
    highlighted.highlight(tableId);
}

/*
    Function to rename the timetable picker label
 */
function updatePickerLabel(tableName) {
    $('#tt-picker-button').text(tableName);
}

/*
    Function to delete a table
 */
function deleteTable(tableId) {
    var tableIndex = getTableIndex(tableId);
    timetableStorage.splice(tableIndex, 1);
    updateLocalForage();

    // Check if the active table is deleted
    if (activeTable.id === tableId) {
        if (tableIndex === 0) {
            switchTable(timetableStorage[0].id);
        } else {
            switchTable(timetableStorage[tableIndex - 1].id);
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
    timetableStorage[tableIndex].name = tableName;
    updateLocalForage();

    // Check if the active table is renamed
    if (activeTable.id === tableId) {
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

    if (timetableStorage.length === 2) {
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
}

/*
    Function to check is slots are clashing
 */
function checkSlotClash() {
    // Remove table-danger class (shows clashing) form tr in course list table.
    $('#course-list tbody tr').removeClass('table-danger');
    $('#timetable tr .hidden').removeClass('hidden');

    // Check clash from timetable in each slot area
    $('#timetable tr .highlight').each(function() {
        var $highlightedCell = $(this);
        var $highlightedCellDivs = $(this).children('div[data-course]');

        var noPostLabFlag =
            $(this).hasClass('no-post-lab') &&
            $(this).children('div[data-is-lab="false"]').length > 0 &&
            $(this)
                .next()
                .children('div[data-is-lab="true"]').length > 0;
        var noPreTheoryFlag =
            $(this).hasClass('no-pre-theory') &&
            $(this).children('div[data-is-lab="true"]').length > 0 &&
            $(this)
                .prev()
                .children('div[data-is-lab="false"]').length > 0;

        if (
            $highlightedCellDivs.length > 1 ||
            noPostLabFlag ||
            noPreTheoryFlag
        ) {
            var isClashing = true;

            // Check if there are two dissimilar courses or if there is a J
            // component course and a sibling in this cell.
            if ($highlightedCellDivs.length === 2) {
                var $firstCellDiv = $highlightedCellDivs.eq(0),
                    $secondCellDiv = $highlightedCellDivs.eq(1);

                var isFirstCourseJComp = $firstCellDiv.data('is-project'),
                    isSecondCourseJComp = $secondCellDiv.data('is-project');

                if (isFirstCourseJComp && isSecondCourseJComp) {
                } // Two J components in the same slot is a clash.
                else if (isFirstCourseJComp || isSecondCourseJComp) {
                    // Otherwise, check for similarity.
                    var firstCourseId = +$firstCellDiv
                        .data('course')
                        .split(/(\d+)/)[1];
                    var secondCourseId = +$secondCellDiv
                        .data('course')
                        .split(/(\d+)/)[1];

                    var firstCourseIdx = getCourseIndex(firstCourseId);
                    var secondCourseIdx = getCourseIndex(secondCourseId);

                    var firstCourse = activeTable.data[firstCourseIdx];
                    var secondCourse = activeTable.data[secondCourseIdx];

                    // Check to see if two courses are similar.
                    if (
                        firstCourse[1] === secondCourse[1] && // Course Code
                        firstCourse[2] === secondCourse[2] // Course Title
                    ) {
                        $highlightedCell.removeClass('clash');
                        var $projectDiv = isFirstCourseJComp
                            ? $firstCellDiv
                            : $secondCellDiv;
                        $projectDiv.addClass('hidden');
                        isClashing = false;
                    }
                }
            }

            if (isClashing) {
                // clash
                // remove, add clash in timetable
                $(this).addClass('clash');
                // show clash in course list table
                $(this)
                    .children('div[data-course]')
                    .each(function() {
                        var dataCourse = $(this).attr('data-course');
                        // Add table-danger class to tr of clashing course list table.
                        $(
                            `#course-list tbody tr[data-course="${dataCourse}"]`,
                        ).addClass('table-danger');
                    });
            }
        } else if ($highlightedCellDivs.length === 1) {
            // no clash
            $(this)
                .removeClass('clash')
                .addClass('highlight');
        } else {
            // no course present
            $(this).removeClass('clash highlight');
            $('.quick-buttons .' + this.classList[1] + '-tile').removeClass(
                'highlight',
            );
        }
    });
}

/*
    Function to initialize quick visualization
 */
function initializeQuickVisualization() {
    /*
        Click event for the quick visualization buttons
     */
    $('.quick-buttons *[class*="-tile"]').on('click', function() {
        if (
            !$(`#timetable .${this.classList[0].split('-')[0]}`).hasClass(
                'clash',
            ) &&
            $(`#timetable .${this.classList[0].split('-')[0]}`).children('div')
                .length == 0
        ) {
            if ($(this).hasClass('highlight')) {
                $(`#timetable .${this.classList[0].split('-')[0]}`).removeClass(
                    'highlight',
                );
                // remove slots from highlighted
                var index = highlighted[activeTable.id].indexOf(
                    this.classList[0].split('-')[0],
                );
                highlighted[activeTable.id].splice(index, 1);
            } else {
                $(`#timetable .${this.classList[0].split('-')[0]}`).addClass(
                    'highlight',
                );
                // add slots to highlighted
                highlighted[activeTable.id].push(
                    this.classList[0].split('-')[0],
                );
            }
            $(this).toggleClass('highlight');
        }
    });

    /*
        Click event for the periods when quick visualization is enabled
     */
    $('#timetable .period:not([disabled])').on('click', function() {
        if (
            $('#quick-toggle').attr('data-state') == 'enabled' &&
            !$(this).hasClass('clash') &&
            $(this).children('div').length === 0
        ) {
            $(this).toggleClass('highlight');
            if (!$(this).hasClass('highlight')) {
                $(`.quick-buttons .${this.classList[1]}-tile`).removeClass(
                    'highlight',
                );
                // remove slots from highlighted
                var index = highlighted[activeTable.id].indexOf(
                    this.classList[2],
                );
                highlighted[activeTable.id].splice(index, 1);
                return;
            } else {
                // add slots to highlighted
                if (this.classList.length === 3) {
                    // some course may only have lab slot
                    highlighted[activeTable.id].push(this.classList[1]);
                } else {
                    highlighted[activeTable.id].push(this.classList[2]);
                }
            }
            if (
                $(`#timetable .${this.classList[1]}`).not('.highlight')
                    .length === 0
            ) {
                $(`.quick-buttons .${this.classList[1]}-tile`).addClass(
                    'highlight',
                );
            }
        }
    });
}

/*
    Function to initialize the timetable
 */
window.initializeTimetable = () => {
    var timetable;
    $('#timetable tr')
        .slice(2)
        .hide();
    $('#timetable tr td:not(:first-child)').remove();
    $('.quick-buttons table').html('<tr></tr><tr></tr><tr></tr>');

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
        }

        if (labSlots && labSlots.start && labSlots.end) {
            $labHour.html(`${labSlots.start}<br />to<br />${labSlots.end}`);
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
                    $quickButtons
                        .find('tr')
                        .eq(slot.replace(/[^A-Z]/gi, '').length - 1)
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

    initializeQuickVisualization();
};

/*
    Function to add a course to the timetable
 */
window.addCourseToTimetable = (courseData) => {
    courseData.slots.forEach(function(slot) {
        var $divElement = $(
            `<div 
                data-course="course${courseData.courseId}"
                data-is-lab="${courseData.slots[0][0] == 'L'}"
                data-is-project="${courseData.isProject}"
                >${courseData.courseCode +
                    (courseData.venue != '' ? '-' + courseData.venue : '')}</div
            >`,
        );

        $(`#timetable tr .${slot}`)
            .addClass('highlight')
            .append($divElement);

        if ($(`.quick-buttons .${slot}-tile`)) {
            $(`.quick-buttons .${slot}-tile`).addClass('highlight');
        }
    });

    checkSlotClash();
    updateLocalForage();
};

/*
    Function to remove a course from the timetable
 */
window.removeCourseFromTimetable = (course) => {
    $(`#timetable tr td div[data-course="${course}"]`).remove();
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
};
