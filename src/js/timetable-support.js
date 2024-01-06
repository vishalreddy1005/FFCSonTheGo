// ********************* Assigning Global Variables *********************

var editSub = false; // edit subject (course edit toggle)
var editTeacher = false; // edit teacher (course edit false, edit clicked, then true)
var sortableIsActive = false; // sortable is activated or not
var attackData = []; // attack data for the temp usage
var attackQuick = [];

// This data structure is used to store the timetable slots
// to convert them into one format(Lecture To Theory)
// for proceesing in rearrangement
var ttDataStructureInLFormat = {
    L1: 'A1',
    L2: 'F1',
    L3: 'D1',
    L4: 'TB1',
    L5: 'TG1',
    L6: 'L6',
    L31: 'A2',
    L32: 'F2',
    L33: 'D2',
    L34: 'TB2',
    L35: 'TG2',
    L36: 'L36',
    V3: 'V3',
    L7: 'B1',
    L8: 'G1',
    L9: 'E1',
    L10: 'TC1',
    L11: 'TAA1',
    L12: 'L12',
    L37: 'B2',
    L38: 'G2',
    L39: 'E2',
    L40: 'TC2',
    L41: 'TAA2',
    L42: 'L42',
    V4: 'V4',
    L13: 'C1',
    L14: 'A1',
    L15: 'F1',
    L16: 'V1',
    L17: 'V2',
    L18: 'L18',
    L43: 'C2',
    L44: 'A2',
    L45: 'F2',
    L46: 'TD2',
    L47: 'TBB2',
    L48: 'L48',
    V5: 'V5',
    L19: 'D1',
    L20: 'B1',
    L21: 'G1',
    L22: 'TE1',
    L23: 'TCC1',
    L24: 'L24',
    L49: 'D2',
    L50: 'B2',
    L51: 'G2',
    L52: 'TE2',
    L53: 'TCC2',
    L54: 'L54',
    V6: 'V6',
    L25: 'E1',
    L26: 'C1',
    L27: 'TA1',
    L28: 'TF1',
    L29: 'TD1',
    L30: 'L30',
    L55: 'E2',
    L56: 'C2',
    L57: 'TA2',
    L58: 'TF2',
    L59: 'TDD2',
    L60: 'L60',
    V7: 'V7',
};
var slotsExistInNonLectureFormat = new Set([
    ...Object.keys(ttDataStructureInLFormat),
    ...Object.values(ttDataStructureInLFormat),
]);
// ##################### Exporting Global Variables #####################
export var globalVars = {
    editSub: editSub,
    editTeacher: editTeacher,
    sortableIsActive: sortableIsActive,
    attackData: attackData,
    ttDataStructureInLFormat: ttDataStructureInLFormat,
    slotsExistInNonLectureFormat: slotsExistInNonLectureFormat,
    attackQuick: attackQuick,
};

// Tried to do so and failed
// ************************* Exporting Function *************************

// export {
//     // ================== Basic ==================
//     toggleDropdown,
//     removeInputFieldsInSection,
//     closeAllDropdowns,
//     openAllDropdowns,
//     editPrefCollapse,
//     // ------------------ Basic Ends Here ------------------

//     // ================== Get From Something ==================
//     getCourseListFromSubjectArea,
//     getCourseDivInSubjectArea,
//     getUlInSubjectArea,
//     getTeacherLiInSubjectArea,
//     getCreditsFromCourseName,
//     getCourseCodeAndCourseTitle,
//     getCourseNameFromCourseData,
//     getCourseTrInCourseList,
//     getCourseNameAndFacultyFromTr,
//     processRawCourseName,
//     // ------------------ Get From Something Ends Here ------------------

//     // ================== Sortables ==================
//     activateSortable,
//     deactivateSortable,
//     activateSortableForCourseList,
//     // ------------------ Sortables Ends Here ------------------

//     // ------------------ Slots ------------------
//     updateSlots,
//     slotsProcessingForCourseList,
//     getSlotsOfCourse,
//     getSlots,
//     subtractArray,
//     isCommonSlot,
//     // ------------------ Slots Ends Here -----------------

//     // ------------------ Build / Update ------------------
//     makeRadioTrueOnPageLoad,
//     makeRadioFalseOnNeed,
//     fillLeftBoxInCoursePanel,
//     createSubjectDropdown,
//     createTeacherLI,
//     constructTeacherLi,
//     createSubjectJsonFromHtml,
//     updateDataJsonFromCourseList,
//     updateTeacherInCourseList,
//     addSubDiv,
//     // ------------------ Build / Update Ends Here ------------------

//     // ------------------ Add / Remove ------------------
//     doubleClickOnTrOfCourseList,
//     addEventListnerToCourseList,
//     addEventListeners,
//     addOnRadioTrue,
//     removeEventListeners,
//     removeCourseFromSubject,
//     courseRemove,
//     removeRadioFalse,
//     selectBackgroundRemovalOfPreviousH2s,
//     selectBackgroundRemovalOfPreviousLi,
//     // ------------------ Add / Remove Ends Here ------------------

//     // ------------------ Click ------------------
//     editPrefAddOn,
//     editPref,
//     closeEditPref1,
//     closeEditPref,
//     liClick,
//     // ------------------ Click Ends Here ------------------

//     // ------------------ Arrange ------------------
//     rearrangeTeacherLiInSubjectArea,
//     rearrangeTeacherRefresh,
//     revertRerrange,
//     // ------------------ Arrange Ends Here ------------------

//     // ------------------ Attack Mode Function ------------------
//     rearrangeTeacherRefreshAttack,
//     rearrangeTeacherLiInSubjectAreaAttack,
//     makeRadioTrueAttack,
//     revertRerrangeAttack,
//     slotsForAttack,
//     getcourseSlotsAttack,
//     removeRadioFalseAttack,
//     addOnRadioAttack,
//     removeEventListenersAttack,
//     attackLiClick,
//     // ------------------ Attack Mode Function Ends Here ------------------

//     // ------------------ File Processing ------------------
//     processFile,
//     // ------------------ File Processing Ends Here ------------------

//     // ------------------ Misslenious ------------------
//     showAddTeacherDiv,
//     onPageLoad,
//     // ------------------ Misslenious Ends Here ------------------
// };
