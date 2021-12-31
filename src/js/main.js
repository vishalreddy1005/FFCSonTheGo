/*
 *  This file contains the events and functions applied to
 *  the document body that is common to all sections or
 *  that doesn't fit into any particular section
 */

import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../../node_modules/@fortawesome/fontawesome-free/css/all.min.css';

import '../scss/main.scss';
import '../scss/course-panel.scss';
import '../scss/timetable.scss';
import '../scss/course-list.scss';

import './attacher';
import './course-panel';
import './timetable';
import './course-list';
import * as Utils from './utils';

const lastUpdate = require('../../package.json')['lastUpdate'];

$(function() {
    /*
        Event to listen to hash changes
     */
    $(window).on('hashchange', () => {
        switchCampus();
    });

    /*
        Remove focus from quick buttons once clicked
     */
    $('.quick-buttons .btn').on('click', function() {
        $(this).trigger('blur');
    });

    switchCampus();
    Utils.removeTouchHoverCSSRule();
});

/*
    Function to switch campuses
 */
function switchCampus() {
    if (window.location.hash === '#Chennai') {
        $('#campus').text('Chennai Campus');
        $('#last-update').text(lastUpdate.chennai);
        window.campus = 'Chennai';
    } else {
        $('#campus').text('Vellore Campus');
        $('#last-update').text(lastUpdate.vellore);
        window.campus = 'Vellore';
    }

    getCourses();
    initializeTimetable();
}

/*
    Redirect to the GitHub page when Ctrl + U is clicked
    instead of showing the page source code
 */
document.onkeydown = function(e) {
    if (e.ctrlKey && e.key == 'u') {
        window.open('https://github.com/vatz88/FFCSonTheGo');
        return false;
    } else {
        return true;
    }
};

/*
    Function to clear all sections
 */
window.resetPage = () => {
    clearPanel();
    clearTimetable();
    clearCourseList();
};

/*
    Prompt add to home screen
 */
window.addEventListener('beforeinstallprompt', (e) => {
    ga('send', {
        hitType: 'event',
        eventCategory: 'A2H',
        eventAction: 'Seen',
        eventLabel: `A2H Shown`,
    });

    e.userChoice.then((choiceResult) => {
        ga('send', {
            hitType: 'event',
            eventCategory: 'A2H',
            eventAction: 'click',
            eventLabel: `A2H ${choiceResult.outcome}`,
        });
    });
});
