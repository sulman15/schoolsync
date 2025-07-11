// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const contentPages = document.querySelectorAll('.content-page');
const addStudentBtn = document.getElementById('add-student-btn');
const studentsTableBody = document.getElementById('students-table-body');
const studentSearchInput = document.getElementById('student-search-input');
const teacherSearchInput = document.getElementById('teacher-search-input');
const classSearchInput = document.getElementById('class-search-input');
const addTeacherBtn = document.getElementById('add-teacher-btn');
const teachersTableBody = document.getElementById('teachers-table-body');
const addClassBtn = document.getElementById('add-class-btn');
const classesTableBody = document.getElementById('classes-table-body');
const attendanceClassSelect = document.getElementById('attendance-class');
const attendanceDateInput = document.getElementById('attendance-date');
const loadAttendanceBtn = document.getElementById('load-attendance-btn');
const saveAttendanceBtn = document.getElementById('save-attendance-btn');
const attendanceContainer = document.getElementById('attendance-container');
const attendanceTableBody = document.getElementById('attendance-table-body');
const attendanceHistoryBody = document.getElementById('attendance-history-body');
const attendanceClassName = document.getElementById('attendance-class-name');
const attendanceDateDisplay = document.getElementById('attendance-date-display');
const gradesClassSelect = document.getElementById('grades-class');
const loadAssignmentsBtn = document.getElementById('load-assignments-btn');
const addAssignmentBtn = document.getElementById('add-assignment-btn');
const assignmentsContainer = document.getElementById('assignments-container');
const assignmentsTableBody = document.getElementById('assignments-table-body');
const gradesClassName = document.getElementById('grades-class-name');
const assignmentGradesContainer = document.getElementById('assignment-grades-container');
const assignmentTitle = document.getElementById('assignment-title');
const gradesTableBody = document.getElementById('grades-table-body');
const saveGradesBtn = document.getElementById('save-grades-btn');
const gradeReportStudent = document.getElementById('grade-report-student');
const loadStudentGradesBtn = document.getElementById('load-student-grades-btn');
const studentReportContainer = document.getElementById('student-report-container');
const reportStudentName = document.getElementById('report-student-name');
const reportOverallGrade = document.getElementById('report-overall-grade');
const studentGradesTableBody = document.getElementById('student-grades-table-body');
const settingsTabLinks = document.querySelectorAll('.list-group-item[data-settings-tab]');
const settingsTabs = document.querySelectorAll('.settings-tab');
const saveSchoolInfoBtn = document.getElementById('save-school-info-btn');
const saveUserAccountBtn = document.getElementById('save-user-account-btn');
const savePreferencesBtn = document.getElementById('save-preferences-btn');
const addQualificationBtn = document.getElementById('add-qualification-btn');
const qualificationsTableBody = document.getElementById('qualifications-table-body');
const createBackupBtn = document.getElementById('create-backup-btn');
const restoreBackupBtn = document.getElementById('restore-backup-btn');
const resetDataBtn = document.getElementById('reset-data-btn');
const selectLogoBtn = document.getElementById('select-logo-btn');
const schoolLogoPreview = document.getElementById('school-logo-preview');
const appLogo = document.getElementById('app-logo');

// Store the currently editing IDs
let currentEditingStudentId = null;
let currentEditingTeacherId = null;
let currentEditingClassId = null;
let currentEditingAssignmentId = null;
let currentEditingQualificationId = null;

// Store teachers list for class assignment
let teachersList = [];
// Store all teachers for search functionality
let allTeachersList = [];
// Store classes list for student assignment
let classesList = [];
// Store all classes for search functionality
let allClassesList = [];
// Store all students for search functionality
let allStudentsList = [];
// Store students list for attendance
let studentsList = [];
// Store qualifications list for teacher assignment
let qualificationsList = [];
// Store current attendance data
let currentAttendance = null;
// Store current assignments data
let currentAssignments = [];
// Store current assignment grades data
let currentAssignmentGrades = null;
// Store current user data
let currentUser = null;
// Store current settings
let currentSettings = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Set up navigation
  setupNavigation();
  
  // Load initial data
  loadDashboardData();
  
  // Set up event listeners
  setupEventListeners();
  
  // Set default date for attendance
  if (attendanceDateInput) {
    attendanceDateInput.value = new Date().toISOString().split('T')[0];
  }
});

// Load dashboard data
function loadDashboardData() {
  // Request data for dashboard
  window.api.send('getStudents');
  window.api.send('getTeachers');
  window.api.send('getClasses');
}

// Update dashboard counts
function updateDashboardCounts() {
  const studentCount = document.getElementById('student-count');
  const teacherCount = document.getElementById('teacher-count');
  const classCount = document.getElementById('class-count');
  
  if (studentCount) {
    studentCount.textContent = allStudentsList ? allStudentsList.length : 0;
  }
  
  if (teacherCount) {
    teacherCount.textContent = allTeachersList ? allTeachersList.length : 0;
  }
  
  if (classCount) {
    classCount.textContent = allClassesList ? allClassesList.length : 0;
  }
}

// Navigation setup
function setupNavigation() {
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links and add to clicked link
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Show the corresponding content page
      const targetPage = link.getAttribute('data-page');
      contentPages.forEach(page => {
        page.classList.remove('active');
        if (page.id === targetPage) {
          page.classList.add('active');
        }
      });

      // Load data for the selected page
      if (targetPage === 'students') {
        loadStudentsData();
      } else if (targetPage === 'teachers') {
        loadTeachersData();
      } else if (targetPage === 'classes') {
        loadClassesData();
      } else if (targetPage === 'attendance') {
        loadAttendanceData();
      } else if (targetPage === 'grades') {
        loadGradesData();
      } else if (targetPage === 'settings') {
        loadSettingsData();
      }
    });
  });
}

// STUDENT FUNCTIONS
// Load students data into the table
function loadStudentsData() {
  // Clear existing table data
  studentsTableBody.innerHTML = '';
  
  // Show loading indicator
  studentsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
  
  // Request data from main process
  window.api.send('getStudents');
  
  // Also load classes for dropdown
  window.api.send('getClasses');
}

// Handle received students data
window.api.receive('studentsData', (students) => {
  // Store all students for search functionality
  allStudentsList = students;
  
  // If there's an active search query, apply the filter
  const searchQuery = studentSearchInput ? studentSearchInput.value.toLowerCase().trim() : '';
  if (searchQuery) {
    const filteredStudents = students.filter(student => 
      student.id.toLowerCase().includes(searchQuery) ||
      student.name.toLowerCase().includes(searchQuery) ||
      student.grade.toLowerCase().includes(searchQuery) ||
      (student.email && student.email.toLowerCase().includes(searchQuery)) ||
      (student.phone && student.phone.toLowerCase().includes(searchQuery))
    );
    displayStudents(filteredStudents);
  } else {
    // Display all students
    displayStudents(students);
  }
  
  // Update dashboard counts
  updateDashboardCounts();
});

// Display students in the table
function displayStudents(students) {
  // Clear loading indicator
  studentsTableBody.innerHTML = '';
  
  if (students.length === 0) {
    studentsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No students found</td></tr>';
    return;
  }
  
  // Add student data to the table
  students.forEach(student => {
    // Find class name if class ID exists
    let className = 'Not assigned';
    if (student.classId) {
      const classItem = classesList.find(c => c.id === student.classId);
      if (classItem) {
        className = classItem.name;
      }
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.grade}</td>
      <td>${className}</td>
      <td>${student.email || student.phone || 'N/A'}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary edit-student" data-id="${student.id}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-student" data-id="${student.id}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    studentsTableBody.appendChild(row);
  });
}

// TEACHER FUNCTIONS
// Load teachers data into the table
function loadTeachersData() {
  // Clear existing table data
  teachersTableBody.innerHTML = '';
  
  // Show loading indicator
  teachersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
  
  // Request data from main process
  window.api.send('getTeachers');
}

// Handle received teachers data
window.api.receive('teachersData', (teachers) => {
  // Store all teachers for search functionality
  allTeachersList = teachers;
  teachersList = teachers;
  
  // If there's an active search query, apply the filter
  const searchQuery = teacherSearchInput ? teacherSearchInput.value.toLowerCase().trim() : '';
  if (searchQuery) {
    const filteredTeachers = teachers.filter(teacher => 
      teacher.id.toLowerCase().includes(searchQuery) ||
      teacher.name.toLowerCase().includes(searchQuery) ||
      (teacher.subject && teacher.subject.toLowerCase().includes(searchQuery)) ||
      (teacher.email && teacher.email.toLowerCase().includes(searchQuery)) ||
      (teacher.phone && teacher.phone.toLowerCase().includes(searchQuery))
    );
    displayTeachers(filteredTeachers);
  } else {
    // Display all teachers
    displayTeachers(teachers);
  }
  
  // Update dashboard counts
  updateDashboardCounts();
});

// Display teachers in the table
function displayTeachers(teachers) {
  // Clear existing table data
  teachersTableBody.innerHTML = '';
  
  if (teachers.length === 0) {
    teachersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No teachers found</td></tr>';
    return;
  }
  
  // Add teacher data to the table
  teachers.forEach(teacher => {
    // Find qualification name if qualification ID exists
    let qualificationName = '';
    if (teacher.qualificationId) {
      const qualification = qualificationsList.find(q => q.id === teacher.qualificationId);
      if (qualification) {
        qualificationName = qualification.name;
      }
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${teacher.id}</td>
      <td>${teacher.name}</td>
      <td>${teacher.subject || 'N/A'}</td>
      <td>${qualificationName || 'N/A'}</td>
      <td>${teacher.email || teacher.phone || 'N/A'}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary edit-teacher" data-id="${teacher.id}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-teacher" data-id="${teacher.id}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    teachersTableBody.appendChild(row);
  });
}

// CLASS FUNCTIONS
// Load classes data into the table
function loadClassesData() {
  // Clear existing table data
  classesTableBody.innerHTML = '';
  
  // Show loading indicator
  classesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
  
  // Request data from main process
  window.api.send('getClasses');
  
  // Also load teachers for dropdown
  window.api.send('getTeachers');
}

// Handle received classes data
window.api.receive('classesData', (classes) => {
  // Store all classes for search functionality
  allClassesList = classes;
  classesList = classes;
  
  // If there's an active search query, apply the filter
  const searchQuery = classSearchInput ? classSearchInput.value.toLowerCase().trim() : '';
  if (searchQuery) {
    const filteredClasses = classes.filter(classItem => 
      classItem.id.toLowerCase().includes(searchQuery) ||
      classItem.name.toLowerCase().includes(searchQuery) ||
      (classItem.subject && classItem.subject.toLowerCase().includes(searchQuery)) ||
      (classItem.schedule && classItem.schedule.toLowerCase().includes(searchQuery))
    );
    displayClasses(filteredClasses);
  } else {
    // Display all classes
    displayClasses(classes);
  }
  
  // Update dashboard counts
  updateDashboardCounts();
});

// Display classes in the table
function displayClasses(classes) {
  // Clear existing table data
  classesTableBody.innerHTML = '';
  
  if (classes.length === 0) {
    classesTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No classes found</td></tr>';
    return;
  }
  
  // Add class data to the table
  classes.forEach(classItem => {
    // Find teacher name if teacher ID exists
    let teacherName = 'Not assigned';
    if (classItem.teacherId) {
      const teacher = teachersList.find(t => t.id === classItem.teacherId);
      if (teacher) {
        teacherName = teacher.name;
      }
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${classItem.id}</td>
      <td>${classItem.name}</td>
      <td>${classItem.subject || 'N/A'}</td>
      <td>${teacherName}</td>
      <td>${classItem.schedule || 'N/A'}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary edit-class" data-id="${classItem.id}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-class" data-id="${classItem.id}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    classesTableBody.appendChild(row);
  });
  
  // Update attendance class select
  updateAttendanceClassSelect();
  
  // Update grades class select
  updateGradesClassSelect();
}

// Update attendance class select
function updateAttendanceClassSelect() {
  if (attendanceClassSelect) {
    // Keep the current selection
    const currentSelection = attendanceClassSelect.value;
    
    // Clear existing options except the first one
    while (attendanceClassSelect.options.length > 1) {
      attendanceClassSelect.remove(1);
    }
    
    // Add class options
    allClassesList.forEach(classItem => {
      const option = document.createElement('option');
      option.value = classItem.id;
      option.textContent = `${classItem.name} ${classItem.subject ? `(${classItem.subject})` : ''}`;
      attendanceClassSelect.appendChild(option);
    });
    
    // Restore the selection if it exists
    if (currentSelection) {
      attendanceClassSelect.value = currentSelection;
    }
  }
}

// Update grades class select
function updateGradesClassSelect() {
  if (gradesClassSelect) {
    // Keep the current selection
    const currentSelection = gradesClassSelect.value;
    
    // Clear existing options except the first one
    while (gradesClassSelect.options.length > 1) {
      gradesClassSelect.remove(1);
    }
    
    // Add class options
    allClassesList.forEach(classItem => {
      const option = document.createElement('option');
      option.value = classItem.id;
      option.textContent = `${classItem.name} ${classItem.subject ? `(${classItem.subject})` : ''}`;
      gradesClassSelect.appendChild(option);
    });
    
    // Restore the selection if it exists
    if (currentSelection) {
      gradesClassSelect.value = currentSelection;
    }
  }
}

// Set up event listeners for various actions
function setupEventListeners() {
  // Add student button
  if (addStudentBtn) {
    addStudentBtn.addEventListener('click', () => {
      showStudentModal();
    });
  }
  
  // Student search functionality
  if (studentSearchInput) {
    studentSearchInput.addEventListener('input', () => {
      const searchQuery = studentSearchInput.value.toLowerCase().trim();
      if (searchQuery === '') {
        // If search is empty, display all students
        displayStudents(allStudentsList);
      } else {
        // Filter students based on search query
        const filteredStudents = allStudentsList.filter(student => 
          student.id.toLowerCase().includes(searchQuery) ||
          student.name.toLowerCase().includes(searchQuery) ||
          student.grade.toLowerCase().includes(searchQuery) ||
          (student.email && student.email.toLowerCase().includes(searchQuery)) ||
          (student.phone && student.phone.toLowerCase().includes(searchQuery))
        );
        displayStudents(filteredStudents);
      }
    });
  }
  
  // Edit and delete student buttons (using event delegation)
  if (studentsTableBody) {
    studentsTableBody.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      
      const studentId = target.getAttribute('data-id');
      
      if (target.classList.contains('edit-student')) {
        editStudent(studentId);
      } else if (target.classList.contains('delete-student')) {
        deleteStudent(studentId);
      }
    });
  }

  // Add teacher button
  if (addTeacherBtn) {
    addTeacherBtn.addEventListener('click', () => {
      showTeacherModal();
    });
  }
  
  // Teacher search functionality
  if (teacherSearchInput) {
    teacherSearchInput.addEventListener('input', () => {
      const searchQuery = teacherSearchInput.value.toLowerCase().trim();
      if (searchQuery === '') {
        // If search is empty, display all teachers
        displayTeachers(allTeachersList);
      } else {
        // Filter teachers based on search query
        const filteredTeachers = allTeachersList.filter(teacher => 
          teacher.id.toLowerCase().includes(searchQuery) ||
          teacher.name.toLowerCase().includes(searchQuery) ||
          (teacher.subject && teacher.subject.toLowerCase().includes(searchQuery)) ||
          (teacher.email && teacher.email.toLowerCase().includes(searchQuery)) ||
          (teacher.phone && teacher.phone.toLowerCase().includes(searchQuery))
        );
        displayTeachers(filteredTeachers);
      }
    });
  }
  
  // Edit and delete teacher buttons (using event delegation)
  if (teachersTableBody) {
    teachersTableBody.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      
      const teacherId = target.getAttribute('data-id');
      
      if (target.classList.contains('edit-teacher')) {
        editTeacher(teacherId);
      } else if (target.classList.contains('delete-teacher')) {
        deleteTeacher(teacherId);
      }
    });
  }
  
  // Add class button
  if (addClassBtn) {
    addClassBtn.addEventListener('click', () => {
      showClassModal();
    });
  }
  
  // Class search functionality
  if (classSearchInput) {
    classSearchInput.addEventListener('input', () => {
      const searchQuery = classSearchInput.value.toLowerCase().trim();
      if (searchQuery === '') {
        // If search is empty, display all classes
        displayClasses(allClassesList);
      } else {
        // Filter classes based on search query
        const filteredClasses = allClassesList.filter(classItem => 
          classItem.id.toLowerCase().includes(searchQuery) ||
          classItem.name.toLowerCase().includes(searchQuery) ||
          (classItem.subject && classItem.subject.toLowerCase().includes(searchQuery)) ||
          (classItem.schedule && classItem.schedule.toLowerCase().includes(searchQuery))
        );
        displayClasses(filteredClasses);
      }
    });
  }
  
  // Edit and delete class buttons (using event delegation)
  if (classesTableBody) {
    classesTableBody.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      
      const classId = target.getAttribute('data-id');
      
      if (target.classList.contains('edit-class')) {
        editClass(classId);
      } else if (target.classList.contains('delete-class')) {
        deleteClass(classId);
      }
    });
  }
  
  // Load attendance button
  if (loadAttendanceBtn) {
    loadAttendanceBtn.addEventListener('click', () => {
      loadClassAttendance();
    });
  }
  
  // Save attendance button
  if (saveAttendanceBtn) {
    saveAttendanceBtn.addEventListener('click', () => {
      saveAttendance();
    });
  }
  
  // Attendance history actions (using event delegation)
  if (attendanceHistoryBody) {
    attendanceHistoryBody.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      
      const classId = target.getAttribute('data-class-id');
      const date = target.getAttribute('data-date');
      
      if (target.classList.contains('view-attendance')) {
        // Set the class and date in the form
        if (attendanceClassSelect) {
          attendanceClassSelect.value = classId;
        }
        if (attendanceDateInput) {
          attendanceDateInput.value = date;
        }
        // Load the attendance data
        loadClassAttendance();
      } else if (target.classList.contains('delete-attendance')) {
        deleteAttendance(classId, date);
      }
    });
  }
  
  // Load assignments button
  if (loadAssignmentsBtn) {
    loadAssignmentsBtn.addEventListener('click', () => {
      loadClassAssignments();
    });
  }
  
  // Add assignment button
  if (addAssignmentBtn) {
    addAssignmentBtn.addEventListener('click', () => {
      showAssignmentModal();
    });
  }
  
  // Assignment actions (using event delegation)
  if (assignmentsTableBody) {
    assignmentsTableBody.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      
      const assignmentId = target.getAttribute('data-id');
      
      if (target.classList.contains('edit-assignment')) {
        editAssignment(assignmentId);
      } else if (target.classList.contains('delete-assignment')) {
        deleteAssignment(assignmentId);
      } else if (target.classList.contains('grade-assignment')) {
        loadAssignmentGrades(assignmentId);
      }
    });
  }
  
  // Save grades button
  if (saveGradesBtn) {
    saveGradesBtn.addEventListener('click', () => {
      saveAssignmentGrades();
    });
  }
  
  // Load student grades button
  if (loadStudentGradesBtn) {
    loadStudentGradesBtn.addEventListener('click', () => {
      loadStudentGrades();
    });
  }
  
  // Settings tab navigation
  if (settingsTabLinks) {
    settingsTabLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        setupSettingsTabs(link.getAttribute('data-settings-tab'));
      });
    });
  }
  
  // Save school info button
  if (saveSchoolInfoBtn) {
    saveSchoolInfoBtn.addEventListener('click', () => {
      saveSchoolInfo();
    });
  }
  
  // Save user account button
  if (saveUserAccountBtn) {
    saveUserAccountBtn.addEventListener('click', () => {
      saveUserAccount();
    });
  }
  
  // Save preferences button
  if (savePreferencesBtn) {
    savePreferencesBtn.addEventListener('click', () => {
      saveSystemPreferences();
    });
  }
  
  // Create backup button
  if (createBackupBtn) {
    createBackupBtn.addEventListener('click', () => {
      createBackup();
    });
  }
  
  // Restore backup button
  if (restoreBackupBtn) {
    restoreBackupBtn.addEventListener('click', () => {
      restoreBackup();
    });
  }
  
  // Reset data button
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', () => {
      resetData();
    });
  }
  
  // Select logo button
  if (selectLogoBtn) {
    selectLogoBtn.addEventListener('click', () => {
      window.api.send('selectLogo');
    });
  }
  
  // Add qualification button
  if (addQualificationBtn) {
    addQualificationBtn.addEventListener('click', () => {
      showQualificationModal();
    });
  }
  
  // Edit and delete qualification buttons (using event delegation)
  if (qualificationsTableBody) {
    qualificationsTableBody.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      
      const qualificationId = target.getAttribute('data-id');
      
      if (target.classList.contains('edit-qualification')) {
        editQualification(qualificationId);
      } else if (target.classList.contains('delete-qualification')) {
        deleteQualification(qualificationId);
      }
    });
  }
}

// STUDENT MODAL FUNCTIONS
// Show modal to add or edit a student
function showStudentModal(student = null) {
  // Determine if we're adding or editing
  const isEditing = student !== null;
  const modalTitle = isEditing ? 'Edit Student' : 'Add New Student';
  
  // Create modal HTML
  const modalHtml = `
    <div class="modal fade" id="studentModal" tabindex="-1" aria-labelledby="studentModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="studentModalLabel">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="student-form">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="student-name" class="form-label">Full Name *</label>
                  <input type="text" class="form-control" id="student-name" value="${isEditing ? student.name : ''}" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="student-grade" class="form-label">Grade *</label>
                  <select class="form-control" id="student-grade" required>
                    <option value="">Select Grade</option>
                    <option value="1st" ${isEditing && student.grade === '1st' ? 'selected' : ''}>1st Grade</option>
                    <option value="2nd" ${isEditing && student.grade === '2nd' ? 'selected' : ''}>2nd Grade</option>
                    <option value="3rd" ${isEditing && student.grade === '3rd' ? 'selected' : ''}>3rd Grade</option>
                    <option value="4th" ${isEditing && student.grade === '4th' ? 'selected' : ''}>4th Grade</option>
                    <option value="5th" ${isEditing && student.grade === '5th' ? 'selected' : ''}>5th Grade</option>
                    <option value="6th" ${isEditing && student.grade === '6th' ? 'selected' : ''}>6th Grade</option>
                    <option value="7th" ${isEditing && student.grade === '7th' ? 'selected' : ''}>7th Grade</option>
                    <option value="8th" ${isEditing && student.grade === '8th' ? 'selected' : ''}>8th Grade</option>
                    <option value="9th" ${isEditing && student.grade === '9th' ? 'selected' : ''}>9th Grade</option>
                    <option value="10th" ${isEditing && student.grade === '10th' ? 'selected' : ''}>10th Grade</option>
                    <option value="11th" ${isEditing && student.grade === '11th' ? 'selected' : ''}>11th Grade</option>
                    <option value="12th" ${isEditing && student.grade === '12th' ? 'selected' : ''}>12th Grade</option>
                  </select>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="student-gender" class="form-label">Gender</label>
                  <select class="form-control" id="student-gender">
                    <option value="">Select Gender</option>
                    <option value="Male" ${isEditing && student.gender === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${isEditing && student.gender === 'Female' ? 'selected' : ''}>Female</option>
                    <option value="Other" ${isEditing && student.gender === 'Other' ? 'selected' : ''}>Other</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="student-dob" class="form-label">Date of Birth</label>
                  <input type="date" class="form-control" id="student-dob" value="${isEditing && student.dob ? student.dob : ''}">
                </div>
              </div>
              
              <div class="mb-3">
                <label for="student-address" class="form-label">Address</label>
                <textarea class="form-control" id="student-address" rows="2">${isEditing && student.address ? student.address : ''}</textarea>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="student-phone" class="form-label">Phone</label>
                  <input type="tel" class="form-control" id="student-phone" value="${isEditing && student.phone ? student.phone : ''}">
                </div>
                <div class="col-md-6 mb-3">
                  <label for="student-email" class="form-label">Email</label>
                  <input type="email" class="form-control" id="student-email" value="${isEditing && student.email ? student.email : ''}">
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="student-parent-name" class="form-label">Parent/Guardian Name</label>
                  <input type="text" class="form-control" id="student-parent-name" value="${isEditing && student.parent_name ? student.parent_name : ''}">
                </div>
                <div class="col-md-6 mb-3">
                  <label for="student-parent-contact" class="form-label">Parent/Guardian Contact</label>
                  <input type="text" class="form-control" id="student-parent-contact" value="${isEditing && student.parent_contact ? student.parent_contact : ''}">
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="student-enrollment-date" class="form-label">Enrollment Date</label>
                  <input type="date" class="form-control" id="student-enrollment-date" value="${isEditing && student.enrollment_date ? student.enrollment_date : new Date().toISOString().split('T')[0]}">
                </div>
                <div class="col-md-6 mb-3">
                  <label for="student-class" class="form-label">Assigned Class</label>
                  <select class="form-control" id="student-class">
                    <option value="">Select Class</option>
                    ${classesList.map(classItem => `
                      <option value="${classItem.id}" ${isEditing && student.classId === classItem.id ? 'selected' : ''}>
                        ${classItem.name} ${classItem.subject ? `(${classItem.subject})` : ''}
                      </option>
                    `).join('')}
                  </select>
                </div>
              </div>
              <div class="mt-3">
                <small class="text-muted">Fields marked with * are required.</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="save-student-btn">Save Student</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to the document
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHtml;
  document.body.appendChild(modalContainer);
  
  // Initialize the modal
  const modal = new bootstrap.Modal(document.getElementById('studentModal'));
  modal.show();
  
  // Add event listener to the save button
  document.getElementById('save-student-btn').addEventListener('click', () => {
    saveStudent(isEditing ? student.id : null);
  });
  
  // Clean up when modal is hidden
  document.getElementById('studentModal').addEventListener('hidden.bs.modal', function () {
    document.body.removeChild(modalContainer);
    currentEditingStudentId = null;
  });
}

// Save student data
function saveStudent(studentId = null) {
  // Get form values
  const name = document.getElementById('student-name').value;
  const grade = document.getElementById('student-grade').value;
  const gender = document.getElementById('student-gender').value;
  const dob = document.getElementById('student-dob').value;
  const address = document.getElementById('student-address').value;
  const phone = document.getElementById('student-phone').value;
  const email = document.getElementById('student-email').value;
  const parentName = document.getElementById('student-parent-name').value;
  const parentContact = document.getElementById('student-parent-contact').value;
  const enrollmentDate = document.getElementById('student-enrollment-date').value;
  const classId = document.getElementById('student-class').value;
  
  // Validate required fields
  if (!name || !grade) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Create student object
  const student = {
    isNew: studentId === null,
    id: studentId,
    name,
    grade,
    gender,
    dob,
    address,
    phone,
    email,
    parent_name: parentName,
    parent_contact: parentContact,
    enrollment_date: enrollmentDate,
    classId: classId || null
  };
  
  // Send to main process
  window.api.send('saveStudent', student);
  
  // Hide the modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('studentModal'));
  modal.hide();
}

// Handle save student response
window.api.receive('saveStudentResponse', (response) => {
  if (response.success) {
    // Refresh the students list
    window.api.send('getStudents');
    
    // Reset the current editing ID
    currentEditingStudentId = null;
  } else {
    alert(`Error saving student: ${response.error || 'Unknown error'}`);
  }
});

// Edit student function
function editStudent(studentId) {
  // Request the student data from main process
  window.api.send('getStudent', studentId);
  currentEditingStudentId = studentId;
}

// Handle get student response
window.api.receive('getStudentResponse', (student) => {
  if (student) {
    showStudentModal(student);
  } else {
    alert('Error: Student not found');
  }
});

// Delete student function
function deleteStudent(studentId) {
  // Show confirmation dialog
  if (confirm('Are you sure you want to delete this student?')) {
    window.api.send('deleteStudent', studentId);
  }
}

// Handle delete student response
window.api.receive('deleteStudentResponse', (response) => {
  if (response.success) {
    // Refresh the students list
    window.api.send('getStudents');
  } else {
    alert(`Error deleting student: ${response.error || 'Unknown error'}`);
  }
});

// TEACHER MODAL FUNCTIONS
// Show modal to add or edit a teacher
function showTeacherModal(teacher = null) {
  // Determine if we're adding or editing
  const isEditing = teacher !== null;
  const modalTitle = isEditing ? 'Edit Teacher' : 'Add New Teacher';
  
  // Create modal HTML
  const modalHtml = `
    <div class="modal fade" id="teacherModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="teacher-form">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="teacher-name" class="form-label">Full Name *</label>
                  <input type="text" class="form-control" id="teacher-name" value="${isEditing ? teacher.name : ''}" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="teacher-subject" class="form-label">Subject *</label>
                  <input type="text" class="form-control" id="teacher-subject" value="${isEditing && teacher.subject ? teacher.subject : ''}" required>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="teacher-qualification" class="form-label">Qualification</label>
                  <select class="form-control" id="teacher-qualification">
                    <option value="">Select Qualification</option>
                    ${qualificationsList.map(qualification => `
                      <option value="${qualification.id}" ${isEditing && teacher.qualificationId === qualification.id ? 'selected' : ''}>
                        ${qualification.name}
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="teacher-gender" class="form-label">Gender</label>
                  <select class="form-control" id="teacher-gender">
                    <option value="">Select Gender</option>
                    <option value="Male" ${isEditing && teacher.gender === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${isEditing && teacher.gender === 'Female' ? 'selected' : ''}>Female</option>
                    <option value="Other" ${isEditing && teacher.gender === 'Other' ? 'selected' : ''}>Other</option>
                  </select>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="teacher-dob" class="form-label">Date of Birth</label>
                  <input type="date" class="form-control" id="teacher-dob" value="${isEditing && teacher.dob ? teacher.dob : ''}">
                </div>
                <div class="col-md-6 mb-3">
                  <label for="teacher-hire-date" class="form-label">Hire Date</label>
                  <input type="date" class="form-control" id="teacher-hire-date" value="${isEditing && teacher.hire_date ? teacher.hire_date : new Date().toISOString().split('T')[0]}">
                </div>
              </div>
              
              <div class="mb-3">
                <label for="teacher-address" class="form-label">Address</label>
                <textarea class="form-control" id="teacher-address" rows="2">${isEditing && teacher.address ? teacher.address : ''}</textarea>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="teacher-phone" class="form-label">Phone</label>
                  <input type="tel" class="form-control" id="teacher-phone" value="${isEditing && teacher.phone ? teacher.phone : ''}">
                </div>
                <div class="col-md-6 mb-3">
                  <label for="teacher-email" class="form-label">Email</label>
                  <input type="email" class="form-control" id="teacher-email" value="${isEditing && teacher.email ? teacher.email : ''}">
                </div>
              </div>
              <div class="mt-3">
                <small class="text-muted">Fields marked with * are required.</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="save-teacher-btn">Save Teacher</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to the document
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHtml;
  document.body.appendChild(modalContainer);
  
  // Initialize the modal
  const modal = new bootstrap.Modal(document.getElementById('teacherModal'));
  modal.show();
  
  // Add event listener to the save button
  document.getElementById('save-teacher-btn').addEventListener('click', () => {
    saveTeacher(isEditing ? teacher.id : null);
  });
  
  // Clean up when modal is hidden
  document.getElementById('teacherModal').addEventListener('hidden.bs.modal', function () {
    document.body.removeChild(modalContainer);
    currentEditingTeacherId = null;
  });
}

// Save teacher data
function saveTeacher(teacherId = null) {
  // Get form values
  const name = document.getElementById('teacher-name').value;
  const subject = document.getElementById('teacher-subject').value;
  const qualificationId = document.getElementById('teacher-qualification').value;
  const gender = document.getElementById('teacher-gender').value;
  const dob = document.getElementById('teacher-dob').value;
  const hireDate = document.getElementById('teacher-hire-date').value;
  const address = document.getElementById('teacher-address').value;
  const phone = document.getElementById('teacher-phone').value;
  const email = document.getElementById('teacher-email').value;
  
  // Validate required fields
  if (!name || !subject) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Create teacher object
  const teacher = {
    isNew: teacherId === null,
    id: teacherId,
    name,
    subject,
    qualificationId: qualificationId || null,
    gender,
    dob,
    hire_date: hireDate,
    address,
    phone,
    email
  };
  
  // Send to main process
  window.api.send('saveTeacher', teacher);
  
  // Hide the modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('teacherModal'));
  modal.hide();
}

// Handle save teacher response
window.api.receive('saveTeacherResponse', (response) => {
  if (response.success) {
    // Refresh the teachers list
    window.api.send('getTeachers');
    
    // Reset the current editing ID
    currentEditingTeacherId = null;
  } else {
    alert(`Error saving teacher: ${response.error || 'Unknown error'}`);
  }
});

// Edit teacher function
function editTeacher(teacherId) {
  // Request the teacher data from main process
  window.api.send('getTeacher', teacherId);
  currentEditingTeacherId = teacherId;
}

// Handle get teacher response
window.api.receive('getTeacherResponse', (teacher) => {
  if (teacher) {
    showTeacherModal(teacher);
  } else {
    alert('Error: Teacher not found');
  }
});

// Delete teacher function
function deleteTeacher(teacherId) {
  // Show confirmation dialog
  if (confirm('Are you sure you want to delete this teacher?')) {
    window.api.send('deleteTeacher', teacherId);
  }
}

// Handle delete teacher response
window.api.receive('deleteTeacherResponse', (response) => {
  if (response.success) {
    // Refresh the teachers list
    window.api.send('getTeachers');
  } else {
    alert(`Error deleting teacher: ${response.error || 'Unknown error'}`);
  }
}); 

// CLASS MODAL FUNCTIONS
// Show modal to add or edit a class
function showClassModal(classItem = null) {
  // Determine if we're adding or editing
  const isEditing = classItem !== null;
  const modalTitle = isEditing ? 'Edit Class' : 'Add New Class';
  
  // Create modal HTML
  const modalHtml = `
    <div class="modal fade" id="classModal" tabindex="-1" aria-labelledby="classModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="classModalLabel">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="classForm">
              <div class="mb-3">
                <label for="className" class="form-label">Class Name *</label>
                <input type="text" class="form-control" id="className" value="${isEditing ? classItem.name : ''}" required>
              </div>
              <div class="mb-3">
                <label for="classSubject" class="form-label">Subject *</label>
                <input type="text" class="form-control" id="classSubject" value="${isEditing && classItem.subject ? classItem.subject : ''}">
              </div>
              <div class="mb-3">
                <label for="classTeacher" class="form-label">Teacher</label>
                <select class="form-select" id="classTeacher">
                  <option value="">Select Teacher</option>
                  ${teachersList.map(teacher => `
                    <option value="${teacher.id}" ${isEditing && classItem.teacherId === teacher.id ? 'selected' : ''}>
                      ${teacher.name} ${teacher.subject ? `(${teacher.subject})` : ''}
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="mb-3">
                <label for="classSchedule" class="form-label">Schedule</label>
                <input type="text" class="form-control" id="classSchedule" 
                  placeholder="e.g. Monday 9:00-10:30" 
                  value="${isEditing && classItem.schedule ? classItem.schedule : ''}">
              </div>
              <div class="mb-3">
                <label for="classRoom" class="form-label">Room</label>
                <input type="text" class="form-control" id="classRoom" 
                  value="${isEditing && classItem.room ? classItem.room : ''}">
              </div>
              <div class="mb-3">
                <label for="classCapacity" class="form-label">Capacity</label>
                <input type="number" class="form-control" id="classCapacity" min="1" 
                  value="${isEditing && classItem.capacity ? classItem.capacity : '30'}">
              </div>
              <div class="mb-3">
                <label for="classDescription" class="form-label">Description</label>
                <textarea class="form-control" id="classDescription" rows="3">${isEditing && classItem.description ? classItem.description : ''}</textarea>
              </div>
              <div class="mt-3">
                <small class="text-muted">Fields marked with * are required.</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="saveClassBtn">Save</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to the DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Create Bootstrap modal instance
  const modalElement = document.getElementById('classModal');
  const modal = new bootstrap.Modal(modalElement);
  
  // Show the modal
  modal.show();
  
  // Add event listener to save button
  document.getElementById('saveClassBtn').addEventListener('click', () => {
    saveClass(isEditing ? classItem.id : null);
  });
  
  // Remove modal from DOM after it's hidden
  modalElement.addEventListener('hidden.bs.modal', () => {
    modalElement.remove();
  });
}

// Save class data
function saveClass(classId = null) {
  // Get form values
  const name = document.getElementById('className').value.trim();
  const subject = document.getElementById('classSubject').value.trim();
  const teacherId = document.getElementById('classTeacher').value;
  const schedule = document.getElementById('classSchedule').value.trim();
  const room = document.getElementById('classRoom').value.trim();
  const capacity = document.getElementById('classCapacity').value;
  const description = document.getElementById('classDescription').value.trim();
  
  // Validate form
  if (!name) {
    alert('Please enter a class name');
    return;
  }
  
  // Prepare class data
  const classData = {
    name,
    subject,
    teacherId: teacherId || null,
    schedule,
    room,
    capacity: parseInt(capacity) || 30,
    description,
    isNew: !classId
  };
  
  // If editing, add the ID
  if (classId) {
    classData.id = classId;
  }
  
  // Send data to main process
  window.api.send('saveClass', classData);
  
  // Hide the modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('classModal'));
  modal.hide();
}

// Handle save class response
window.api.receive('saveClassResponse', (response) => {
  if (response.success) {
    // Refresh the classes list
    window.api.send('getClasses');
    
    // Reset the current editing ID
    currentEditingClassId = null;
  } else {
    alert(`Error saving class: ${response.error || 'Unknown error'}`);
  }
});

// Edit class
function editClass(classId) {
  // Set current editing class ID
  currentEditingClassId = classId;
  
  // Request class data from main process
  window.api.send('getClass', classId);
}

// Handle get class response
window.api.receive('getClassResponse', (classItem) => {
  if (classItem) {
    showClassModal(classItem);
  } else {
    alert('Class not found');
  }
});

// Delete class
function deleteClass(classId) {
  // Confirm deletion
  if (confirm('Are you sure you want to delete this class?')) {
    // Send delete request to main process
    window.api.send('deleteClass', classId);
  }
}

// Handle delete class response
window.api.receive('deleteClassResponse', (response) => {
  if (response.success) {
    // Refresh the classes list
    window.api.send('getClasses');
  } else {
    alert(`Error deleting class: ${response.error || 'Unknown error'}`);
  }
});

// Handle students in class response
window.api.receive('studentsInClassResponse', (response) => {
  const { classId, students } = response;
  
  // Display students in a modal or other UI element
  if (students.length > 0) {
    // Implementation for displaying students in class
    console.log(`Students in class ${classId}:`, students);
  } else {
    alert(`No students enrolled in this class.`);
  }
}); 

// ATTENDANCE FUNCTIONS
// Load attendance data
function loadAttendanceData() {
  // Load classes for the dropdown
  window.api.send('getClasses');
  
  // Load recent attendance history
  window.api.send('getAttendance');
  
  // Hide attendance container until a class is selected
  if (attendanceContainer) {
    attendanceContainer.classList.add('d-none');
  }
}

// Load class attendance for a specific date
function loadClassAttendance() {
  const classId = attendanceClassSelect.value;
  const date = attendanceDateInput.value;
  
  if (!classId) {
    alert('Please select a class');
    return;
  }
  
  if (!date) {
    alert('Please select a date');
    return;
  }
  
  // Show loading indicator
  attendanceTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading...</td></tr>';
  
  // Get students in the selected class
  window.api.send('getStudentsInClass', classId);
  
  // Get attendance record for this class and date if it exists
  window.api.send('getAttendanceByClassAndDate', { classId, date });
  
  // Show the attendance container
  attendanceContainer.classList.remove('d-none');
  
  // Update the title
  const selectedClass = classesList.find(c => c.id === classId);
  if (selectedClass) {
    attendanceClassName.textContent = selectedClass.name;
  }
  
  // Format date for display
  const displayDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  attendanceDateDisplay.textContent = displayDate;
}

// Handle students in class response
window.api.receive('studentsInClassResponse', (response) => {
  const { classId, students } = response;
  
  // Store students list
  studentsList = students;
  
  // If we have attendance data already, use it to populate the table
  if (currentAttendance && currentAttendance.length > 0) {
    populateAttendanceTable(currentAttendance[0]);
  } else {
    // Otherwise create a new attendance record
    createNewAttendanceRecord(classId, attendanceDateInput.value, students);
  }
});

// Handle attendance by class and date response
window.api.receive('attendanceByClassAndDateData', (response) => {
  const { classId, date, attendance } = response;
  
  // Store current attendance
  currentAttendance = attendance;
  
  // If attendance record exists, populate the table
  if (attendance && attendance.length > 0) {
    populateAttendanceTable(attendance[0]);
  } else {
    // If no attendance record exists and we have students, create a new one
    if (studentsList.length > 0) {
      createNewAttendanceRecord(classId, date, studentsList);
    }
  }
});

// Populate attendance table with data
function populateAttendanceTable(attendanceRecord) {
  // Clear the table
  attendanceTableBody.innerHTML = '';
  
  if (!attendanceRecord.students || attendanceRecord.students.length === 0) {
    attendanceTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No students in this class</td></tr>';
    return;
  }
  
  // Add each student to the table
  attendanceRecord.students.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.studentId}</td>
      <td>${student.name}</td>
      <td>
        <select class="form-select attendance-status" data-student-id="${student.studentId}">
          <option value="present" ${student.status === 'present' ? 'selected' : ''}>Present</option>
          <option value="absent" ${student.status === 'absent' ? 'selected' : ''}>Absent</option>
          <option value="late" ${student.status === 'late' ? 'selected' : ''}>Late</option>
          <option value="excused" ${student.status === 'excused' ? 'selected' : ''}>Excused</option>
        </select>
      </td>
      <td>
        <input type="text" class="form-control attendance-notes" data-student-id="${student.studentId}" value="${student.notes || ''}">
      </td>
    `;
    attendanceTableBody.appendChild(row);
  });
}

// Create a new attendance record
function createNewAttendanceRecord(classId, date, students) {
  // Create a new attendance record with all students marked as present by default
  const studentAttendance = students.map(student => ({
    studentId: student.id,
    name: student.name,
    status: 'present',
    notes: ''
  }));
  
  // Create the attendance object
  currentAttendance = [{
    classId,
    date,
    students: studentAttendance
  }];
  
  // Populate the table
  populateAttendanceTable(currentAttendance[0]);
}

// Save attendance
function saveAttendance() {
  if (!currentAttendance || currentAttendance.length === 0) {
    alert('No attendance data to save');
    return;
  }
  
  const classId = attendanceClassSelect.value;
  const date = attendanceDateInput.value;
  
  // Get all attendance statuses and notes
  const statusSelects = document.querySelectorAll('.attendance-status');
  const notesInputs = document.querySelectorAll('.attendance-notes');
  
  // Update the attendance object with current values
  statusSelects.forEach(select => {
    const studentId = select.getAttribute('data-student-id');
    const studentIndex = currentAttendance[0].students.findIndex(s => s.studentId === studentId);
    
    if (studentIndex !== -1) {
      currentAttendance[0].students[studentIndex].status = select.value;
    }
  });
  
  notesInputs.forEach(input => {
    const studentId = input.getAttribute('data-student-id');
    const studentIndex = currentAttendance[0].students.findIndex(s => s.studentId === studentId);
    
    if (studentIndex !== -1) {
      currentAttendance[0].students[studentIndex].notes = input.value;
    }
  });
  
  // Send the attendance data to the main process
  window.api.send('saveAttendance', currentAttendance[0]);
}

// Handle save attendance response
window.api.receive('saveAttendanceResponse', (response) => {
  if (response.success) {
    alert('Attendance saved successfully');
    // Reload attendance history
    window.api.send('getAttendance');
  } else {
    alert(`Error saving attendance: ${response.error || 'Unknown error'}`);
  }
});

// Handle all attendance data response
window.api.receive('attendanceData', (attendance) => {
  // Clear the history table
  attendanceHistoryBody.innerHTML = '';
  
  if (attendance.length === 0) {
    attendanceHistoryBody.innerHTML = '<tr><td colspan="5" class="text-center">No attendance records found</td></tr>';
    return;
  }
  
  // Sort attendance by date (newest first)
  attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Show only the 10 most recent records
  const recentAttendance = attendance.slice(0, 10);
  
  // Add each record to the history table
  recentAttendance.forEach(record => {
    // Find class name
    let className = 'Unknown Class';
    const classItem = classesList.find(c => c.id === record.classId);
    if (classItem) {
      className = classItem.name;
    }
    
    // Count present and absent students
    const presentCount = record.students.filter(s => s.status === 'present').length;
    const absentCount = record.students.filter(s => s.status === 'absent').length;
    
    // Format date for display
    const displayDate = new Date(record.date).toLocaleDateString();
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${displayDate}</td>
      <td>${className}</td>
      <td>${presentCount}</td>
      <td>${absentCount}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary view-attendance" data-class-id="${record.classId}" data-date="${record.date}">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-attendance" data-class-id="${record.classId}" data-date="${record.date}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    attendanceHistoryBody.appendChild(row);
  });
});

// Delete attendance record
function deleteAttendance(classId, date) {
  if (confirm('Are you sure you want to delete this attendance record?')) {
    window.api.send('deleteAttendance', { classId, date });
  }
}

// Handle delete attendance response
window.api.receive('deleteAttendanceResponse', (response) => {
  if (response.success) {
    alert('Attendance record deleted successfully');
    // Reload attendance history
    window.api.send('getAttendance');
  } else {
    alert(`Error deleting attendance record: ${response.error || 'Unknown error'}`);
  }
}); 

// GRADES FUNCTIONS
// Load grades data
function loadGradesData() {
  // Load classes for the dropdown
  window.api.send('getClasses');
  
  // Load students for the dropdown
  window.api.send('getStudents');
  
  // Hide containers until a class is selected
  if (assignmentsContainer) {
    assignmentsContainer.classList.add('d-none');
  }
  
  if (assignmentGradesContainer) {
    assignmentGradesContainer.classList.add('d-none');
  }
  
  if (studentReportContainer) {
    studentReportContainer.classList.add('d-none');
  }
}

// Load class assignments
function loadClassAssignments() {
  const classId = gradesClassSelect.value;
  
  if (!classId) {
    alert('Please select a class');
    return;
  }
  
  // Show loading indicator
  assignmentsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
  
  // Get assignments for the selected class
  window.api.send('getGradesByClass', classId);
  
  // Show the assignments container
  assignmentsContainer.classList.remove('d-none');
  
  // Update the title
  const selectedClass = classesList.find(c => c.id === classId);
  if (selectedClass) {
    gradesClassName.textContent = selectedClass.name;
  }
}

// Handle grades by class response
window.api.receive('gradesByClassData', (response) => {
  const { classId, grades } = response;
  
  // Store current assignments
  currentAssignments = grades;
  
  // Clear the table
  assignmentsTableBody.innerHTML = '';
  
  if (grades.length === 0) {
    assignmentsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No assignments found for this class</td></tr>';
    return;
  }
  
  // Add each assignment to the table
  grades.forEach(assignment => {
    // Format due date for display
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'Not set';
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${assignment.assignmentId}</td>
      <td>${assignment.title}</td>
      <td>${assignment.type || 'Not specified'}</td>
      <td>${assignment.maxScore}</td>
      <td>${dueDate}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary edit-assignment" data-id="${assignment.assignmentId}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-success grade-assignment" data-id="${assignment.assignmentId}">
          <i class="bi bi-check2-square"></i> Grade
        </button>
        <button class="btn btn-sm btn-outline-danger delete-assignment" data-id="${assignment.assignmentId}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    assignmentsTableBody.appendChild(row);
  });
});

// Show modal to add or edit an assignment
function showAssignmentModal(assignment = null) {
  // Determine if we're adding or editing
  const isEditing = assignment !== null;
  const modalTitle = isEditing ? 'Edit Assignment' : 'Add New Assignment';
  
  // Create modal HTML
  const modalHtml = `
    <div class="modal fade" id="assignmentModal" tabindex="-1" aria-labelledby="assignmentModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="assignmentModalLabel">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="assignment-form">
              <div class="mb-3">
                <label for="assignment-title" class="form-label">Title *</label>
                <input type="text" class="form-control" id="assignment-title" value="${isEditing ? assignment.title : ''}" required>
              </div>
              <div class="mb-3">
                <label for="assignment-description" class="form-label">Description</label>
                <textarea class="form-control" id="assignment-description" rows="3">${isEditing && assignment.description ? assignment.description : ''}</textarea>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="assignment-type" class="form-label">Type</label>
                  <select class="form-control" id="assignment-type">
                    <option value="homework" ${isEditing && assignment.type === 'homework' ? 'selected' : ''}>Homework</option>
                    <option value="quiz" ${isEditing && assignment.type === 'quiz' ? 'selected' : ''}>Quiz</option>
                    <option value="test" ${isEditing && assignment.type === 'test' ? 'selected' : ''}>Test</option>
                    <option value="project" ${isEditing && assignment.type === 'project' ? 'selected' : ''}>Project</option>
                    <option value="other" ${isEditing && assignment.type === 'other' ? 'selected' : ''}>Other</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="assignment-max-score" class="form-label">Maximum Score *</label>
                  <input type="number" class="form-control" id="assignment-max-score" min="0" value="${isEditing ? assignment.maxScore : '100'}" required>
                </div>
              </div>
              <div class="mb-3">
                <label for="assignment-due-date" class="form-label">Due Date</label>
                <input type="date" class="form-control" id="assignment-due-date" value="${isEditing && assignment.dueDate ? assignment.dueDate : ''}">
              </div>
              <div class="mt-3">
                <small class="text-muted">Fields marked with * are required.</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="save-assignment-btn">Save</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to the DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Create Bootstrap modal instance
  const modalElement = document.getElementById('assignmentModal');
  const modal = new bootstrap.Modal(modalElement);
  
  // Show the modal
  modal.show();
  
  // Add event listener to save button
  document.getElementById('save-assignment-btn').addEventListener('click', () => {
    saveAssignment(isEditing ? assignment.assignmentId : null);
  });
  
  // Remove modal from DOM after it's hidden
  modalElement.addEventListener('hidden.bs.modal', () => {
    modalElement.remove();
  });
}

// Save assignment
function saveAssignment(assignmentId = null) {
  const classId = gradesClassSelect.value;
  
  // Get the modal element to scope our selectors
  const modalElement = document.getElementById('assignmentModal');
  
  // Get form values from within the modal
  const title = modalElement.querySelector('#assignment-title').value.trim();
  const description = modalElement.querySelector('#assignment-description').value.trim();
  const type = modalElement.querySelector('#assignment-type').value;
  const maxScore = modalElement.querySelector('#assignment-max-score').value;
  const dueDate = modalElement.querySelector('#assignment-due-date').value;
  
  // Validate form
  if (!title) {
    alert('Please enter an assignment title');
    return;
  }
  
  if (!maxScore || isNaN(maxScore) || maxScore <= 0) {
    alert('Please enter a valid maximum score');
    return;
  }
  
  // Prepare assignment data
  const assignment = {
    id: assignmentId,
    title,
    description,
    type,
    maxScore: parseFloat(maxScore),
    dueDate
  };
  
  // If editing, find the existing students array
  if (assignmentId) {
    const existingAssignment = currentAssignments.find(a => a.assignmentId === assignmentId);
    if (existingAssignment) {
      assignment.students = existingAssignment.students;
    }
  }
  
  // Send data to main process
  window.api.send('createAssignment', { classId, assignment });
  
  // Hide the modal
  const modal = bootstrap.Modal.getInstance(modalElement);
  modal.hide();
}

// Handle create assignment response
window.api.receive('createAssignmentResponse', (response) => {
  if (response.success) {
    // Reload assignments
    loadClassAssignments();
  } else {
    alert(`Error creating assignment: ${response.error || 'Unknown error'}`);
  }
});

// Edit assignment
function editAssignment(assignmentId) {
  // Find the assignment in the current assignments
  const assignment = currentAssignments.find(a => a.assignmentId === assignmentId);
  
  if (assignment) {
    showAssignmentModal(assignment);
  } else {
    alert('Assignment not found');
  }
}

// Delete assignment
function deleteAssignment(assignmentId) {
  if (confirm('Are you sure you want to delete this assignment?')) {
    window.api.send('deleteAssignment', assignmentId);
  }
}

// Handle delete assignment response
window.api.receive('deleteAssignmentResponse', (response) => {
  if (response.success) {
    // Reload assignments
    loadClassAssignments();
  } else {
    alert(`Error deleting assignment: ${response.error || 'Unknown error'}`);
  }
});

// Load assignment grades
function loadAssignmentGrades(assignmentId) {
  const classId = gradesClassSelect.value;
  
  // Find the assignment in the current assignments
  const assignment = currentAssignments.find(a => a.assignmentId === assignmentId);
  
  if (!assignment) {
    alert('Assignment not found');
    return;
  }
  
  // Store current editing assignment ID
  currentEditingAssignmentId = assignmentId;
  
  // Show loading indicator
  gradesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading...</td></tr>';
  
  // Get students in the selected class
  window.api.send('getStudentsInClass', classId);
  
  // Show the grades container
  assignmentGradesContainer.classList.remove('d-none');
  
  // Update the title
  assignmentTitle.textContent = assignment.title;
  
  // Store the current assignment grades
  currentAssignmentGrades = assignment;
}

// Handle students in class response for grades
window.api.receive('studentsInClassResponse', (response) => {
  const { classId, students } = response;
  
  // Store students list
  studentsList = students;
  
  // If we have an assignment selected, populate the grades table
  if (currentEditingAssignmentId) {
    populateGradesTable();
  }
  
  // Update student dropdown for grade reports
  if (gradeReportStudent) {
    // Keep the current selection
    const currentSelection = gradeReportStudent.value;
    
    // Clear existing options except the first one
    while (gradeReportStudent.options.length > 1) {
      gradeReportStudent.remove(1);
    }
    
    // Add student options
    students.forEach(student => {
      const option = document.createElement('option');
      option.value = student.id;
      option.textContent = student.name;
      gradeReportStudent.appendChild(option);
    });
    
    // Restore the selection if it exists
    if (currentSelection) {
      gradeReportStudent.value = currentSelection;
    }
  }
});

// Populate grades table
function populateGradesTable() {
  // Clear the table
  gradesTableBody.innerHTML = '';
  
  if (!studentsList || studentsList.length === 0) {
    gradesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No students in this class</td></tr>';
    return;
  }
  
  // Add each student to the table
  studentsList.forEach(student => {
    // Find the student's grade if it exists
    let studentGrade = null;
    let feedback = '';
    
    if (currentAssignmentGrades && currentAssignmentGrades.students) {
      const gradeRecord = currentAssignmentGrades.students.find(s => s.studentId === student.id);
      if (gradeRecord) {
        studentGrade = gradeRecord.grade;
        feedback = gradeRecord.feedback || '';
      }
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>
        <input type="number" class="form-control grade-input" data-student-id="${student.id}" min="0" max="${currentAssignmentGrades.maxScore}" value="${studentGrade !== null ? studentGrade : ''}">
      </td>
      <td>
        <input type="text" class="form-control feedback-input" data-student-id="${student.id}" value="${feedback}">
      </td>
    `;
    gradesTableBody.appendChild(row);
  });
}

// Save assignment grades
function saveAssignmentGrades() {
  if (!currentEditingAssignmentId || !currentAssignmentGrades) {
    alert('No assignment selected');
    return;
  }
  
  const classId = gradesClassSelect.value;
  
  // Get all grade inputs and feedback inputs
  const gradeInputs = document.querySelectorAll('.grade-input');
  const feedbackInputs = document.querySelectorAll('.feedback-input');
  
  // Create students array with grades
  const students = [];
  
  gradeInputs.forEach(input => {
    const studentId = input.getAttribute('data-student-id');
    const grade = input.value.trim() ? parseFloat(input.value) : null;
    
    // Find corresponding feedback
    const feedbackInput = document.querySelector(`.feedback-input[data-student-id="${studentId}"]`);
    const feedback = feedbackInput ? feedbackInput.value.trim() : '';
    
    // Only add students with grades
    if (grade !== null) {
      students.push({
        studentId,
        grade,
        feedback
      });
    }
  });
  
  // Prepare assignment grades data
  const assignmentGrades = {
    classId,
    assignmentId: currentEditingAssignmentId,
    title: currentAssignmentGrades.title,
    description: currentAssignmentGrades.description,
    type: currentAssignmentGrades.type,
    maxScore: currentAssignmentGrades.maxScore,
    dueDate: currentAssignmentGrades.dueDate,
    students
  };
  
  // Send data to main process
  window.api.send('saveAssignmentGrades', assignmentGrades);
}

// Handle save assignment grades response
window.api.receive('saveAssignmentGradesResponse', (response) => {
  if (response.success) {
    alert('Grades saved successfully');
    // Reload assignments
    loadClassAssignments();
  } else {
    alert(`Error saving grades: ${response.error || 'Unknown error'}`);
  }
});

// Load student grades
function loadStudentGrades() {
  const classId = gradesClassSelect.value;
  const studentId = gradeReportStudent.value;
  
  if (!classId) {
    alert('Please select a class');
    return;
  }
  
  if (!studentId) {
    alert('Please select a student');
    return;
  }
  
  // Show loading indicator
  studentGradesTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
  
  // Get student's grade data
  window.api.send('getStudentClassGrade', { classId, studentId });
  
  // Show the student report container
  studentReportContainer.classList.remove('d-none');
  
  // Update the student name
  const selectedStudent = studentsList.find(s => s.id === studentId);
  if (selectedStudent) {
    reportStudentName.textContent = selectedStudent.name;
  }
}

// Handle student class grade data
window.api.receive('studentClassGradeData', (response) => {
  const { average, assignments } = response;
  
  // Update overall grade
  reportOverallGrade.textContent = `${average}%`;
  
  // Clear the table
  studentGradesTableBody.innerHTML = '';
  
  if (!assignments || assignments.length === 0) {
    studentGradesTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No grades found for this student</td></tr>';
    return;
  }
  
  // Add each assignment to the table
  assignments.forEach(assignment => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${assignment.title}</td>
      <td>${assignment.type || 'Not specified'}</td>
      <td>${assignment.grade}</td>
      <td>${assignment.maxScore}</td>
      <td>${assignment.percentage.toFixed(2)}%</td>
    `;
    studentGradesTableBody.appendChild(row);
  });
}); 

// SETTINGS FUNCTIONS
// Load settings data
function loadSettingsData() {
  // Request settings data from main process
  window.api.send('getSettings');
  
  // Request current user data
  window.api.send('getCurrentUser');
  
  // Request qualifications data
  window.api.send('getQualifications');
}

// Handle received settings data
window.api.receive('settingsData', (settings) => {
  // Store current settings
  currentSettings = settings || {};
  
  // Populate school info form
  if (settings && settings.schoolInfo) {
    document.getElementById('school-name').value = settings.schoolInfo.name || '';
    document.getElementById('school-address').value = settings.schoolInfo.address || '';
    document.getElementById('school-phone').value = settings.schoolInfo.phone || '';
    document.getElementById('school-email').value = settings.schoolInfo.email || '';
    document.getElementById('school-website').value = settings.schoolInfo.website || '';
    document.getElementById('school-principal').value = settings.schoolInfo.principal || '';
    
    // Update logo preview
    if (settings.schoolInfo.logo && schoolLogoPreview) {
      schoolLogoPreview.src = settings.schoolInfo.logo;
    }
    
    // Update app logo
    if (settings.schoolInfo.logo && appLogo) {
      appLogo.src = settings.schoolInfo.logo;
    }
  }
  
  // Populate system preferences
  if (settings && settings.preferences) {
    // Set theme
    if (settings.preferences.theme === 'dark') {
      document.getElementById('theme-dark').checked = true;
      document.body.classList.add('dark-mode');
    } else {
      document.getElementById('theme-light').checked = true;
      document.body.classList.remove('dark-mode');
    }
    
    // Set date format
    if (settings.preferences.dateFormat) {
      document.getElementById('date-format').value = settings.preferences.dateFormat;
    }
    
    // Set language
    if (settings.preferences.language) {
      document.getElementById('language').value = settings.preferences.language;
    }
    
    // Set auto backup
    document.getElementById('auto-backup').checked = settings.preferences.autoBackup || false;
  }
});

// Handle logo selection response
window.api.receive('logoSelected', (response) => {
  if (response.success && response.path) {
    // Update the logo preview
    if (schoolLogoPreview) {
      schoolLogoPreview.src = response.path;
    }
    
    // Update the app logo
    if (appLogo) {
      appLogo.src = response.path;
    }
    
    // Update the settings object
    if (currentSettings && currentSettings.schoolInfo) {
      currentSettings.schoolInfo.logo = response.path;
    }
  } else if (response.error) {
    alert(`Error selecting logo: ${response.error}`);
  }
});

// Handle received current user data
window.api.receive('currentUserData', (user) => {
  // Store current user
  currentUser = user;
  
  // Populate user account form
  if (user) {
    document.getElementById('user-name').value = user.name || '';
    document.getElementById('user-email').value = user.email || '';
    document.getElementById('user-username').value = user.username || '';
  }
});

// Setup settings tabs
function setupSettingsTabs(tabId) {
  // Remove active class from all tab links
  settingsTabLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to the clicked tab link
  const activeTabLink = document.querySelector(`.list-group-item[data-settings-tab="${tabId}"]`);
  if (activeTabLink) {
    activeTabLink.classList.add('active');
  }
  
  // Hide all tab content
  settingsTabs.forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show the selected tab content
  const activeTab = document.getElementById(`${tabId}-settings`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
}

// Save school information
function saveSchoolInfo() {
  // Get form values
  const name = document.getElementById('school-name').value;
  const address = document.getElementById('school-address').value;
  const phone = document.getElementById('school-phone').value;
  const email = document.getElementById('school-email').value;
  const website = document.getElementById('school-website').value;
  const principal = document.getElementById('school-principal').value;
  
  // Get logo path from current settings
  const logo = currentSettings && currentSettings.schoolInfo ? currentSettings.schoolInfo.logo : 'assets/default-logo.png';
  
  // Update settings object
  if (!currentSettings) {
    currentSettings = {
      schoolInfo: {},
      preferences: {}
    };
  }
  
  currentSettings.schoolInfo = {
    name,
    address,
    phone,
    email,
    website,
    principal,
    logo
  };
  
  // Send to main process
  window.api.send('saveSettings', currentSettings);
}

// Save user account
function saveUserAccount() {
  const name = document.getElementById('user-name').value;
  const email = document.getElementById('user-email').value;
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  // Validate form
  if (!name) {
    alert('Please enter your name');
    return;
  }
  
  // Check if changing password
  if (currentPassword || newPassword || confirmPassword) {
    if (!currentPassword) {
      alert('Please enter your current password');
      return;
    }
    
    if (!newPassword) {
      alert('Please enter a new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
  }
  
  // Prepare user data
  const userData = {
    id: currentUser.id,
    name,
    email,
    currentPassword,
    newPassword
  };
  
  // Send to main process
  window.api.send('updateUser', userData);
}

// Save system preferences
function saveSystemPreferences() {
  const theme = document.querySelector('input[name="theme"]:checked').value;
  const dateFormat = document.getElementById('date-format').value;
  const language = document.getElementById('language').value;
  const autoBackup = document.getElementById('auto-backup').checked;
  
  // Update settings object
  if (!currentSettings) {
    currentSettings = {};
  }
  
  currentSettings.preferences = {
    theme,
    dateFormat,
    language,
    autoBackup
  };
  
  // Apply theme immediately
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  
  // Send to main process
  window.api.send('saveSettings', currentSettings);
}

// Create backup
function createBackup() {
  // Request a save location from the user
  window.api.send('showSaveDialog', {
    title: 'Save Backup',
    defaultPath: `schoolsync_backup_${new Date().toISOString().replace(/[:.-]/g, '_').replace(/T/g, '-').split('Z')[0]}.json`,
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
}

// Handle createBackup response from main process
window.api.receive('createBackup', (filePath) => {
  // Send request to create backup at the specified path
  window.api.send('createBackup', filePath);
});

// Restore backup
function restoreBackup() {
  const fileInput = document.getElementById('restore-file');
  
  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Please select a backup file');
    return;
  }
  
  if (confirm('Are you sure you want to restore data from backup? This will overwrite your current data.')) {
    const filePath = fileInput.files[0].path;
    window.api.send('restoreBackup', filePath);
  }
}

// Reset data
function resetData() {
  if (confirm('WARNING: This will delete ALL data and reset the application to default settings. This action cannot be undone. Are you sure you want to continue?')) {
    if (confirm('Are you REALLY sure? All your data will be permanently deleted.')) {
      window.api.send('resetData');
    }
  }
}

// Handle settings response
window.api.receive('saveSettingsResponse', (response) => {
  if (response.success) {
    alert('Settings saved successfully');
  } else {
    alert(`Error saving settings: ${response.error || 'Unknown error'}`);
  }
});

// Handle update user response
window.api.receive('updateUserResponse', (response) => {
  if (response.success) {
    alert('User account updated successfully');
    // Clear password fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
  } else {
    alert(`Error updating user account: ${response.error || 'Unknown error'}`);
  }
});

// Handle backup response
window.api.receive('backupResponse', (response) => {
  if (response.success) {
    alert(`Backup created successfully at: ${response.path}`);
  } else {
    alert(`Error creating backup: ${response.error || 'Unknown error'}`);
  }
});

// Handle restore response
window.api.receive('restoreResponse', (response) => {
  if (response.success) {
    alert('Data restored successfully. The application will now restart.');
  } else {
    alert(`Error restoring data: ${response.error || 'Unknown error'}`);
  }
});

// Handle reset response
window.api.receive('resetResponse', (response) => {
  if (response.success) {
    alert('All data has been reset. The application will now restart.');
  } else {
    alert(`Error resetting data: ${response.error || 'Unknown error'}`);
  }
});

// Handle received qualifications data
window.api.receive('qualificationsData', (qualifications) => {
  // Store qualifications for teacher assignment
  qualificationsList = qualifications || [];
  
  // Populate qualifications table
  if (qualificationsTableBody) {
    // Clear existing data
    qualificationsTableBody.innerHTML = '';
    
    if (qualifications.length === 0) {
      qualificationsTableBody.innerHTML = '<tr><td colspan="3" class="text-center">No qualifications found</td></tr>';
      return;
    }
    
    // Add qualifications to the table
    qualifications.forEach(qualification => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${qualification.id}</td>
        <td>${qualification.name}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary edit-qualification" data-id="${qualification.id}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-qualification" data-id="${qualification.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      qualificationsTableBody.appendChild(row);
    });
  }
}); 

// QUALIFICATION FUNCTIONS
// Show modal to add or edit a qualification
function showQualificationModal(qualification = null) {
  // Determine if we're adding or editing
  const isEditing = qualification !== null;
  const modalTitle = isEditing ? 'Edit Qualification' : 'Add New Qualification';
  
  // Create modal HTML
  const modalHtml = `
    <div class="modal fade" id="qualificationModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="qualification-form">
              <div class="mb-3">
                <label for="qualification-name" class="form-label">Qualification Name *</label>
                <input type="text" class="form-control" id="qualification-name" value="${isEditing ? qualification.name : ''}" required>
              </div>
              <div class="mt-3">
                <small class="text-muted">Fields marked with * are required.</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="save-qualification-btn">Save</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to the document
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHtml;
  document.body.appendChild(modalContainer);
  
  // Initialize the modal
  const modal = new bootstrap.Modal(document.getElementById('qualificationModal'));
  modal.show();
  
  // Add event listener to the save button
  document.getElementById('save-qualification-btn').addEventListener('click', () => {
    saveQualification(isEditing ? qualification.id : null);
  });
  
  // Clean up when modal is hidden
  document.getElementById('qualificationModal').addEventListener('hidden.bs.modal', function () {
    document.body.removeChild(modalContainer);
    currentEditingQualificationId = null;
  });
}

// Save qualification data
function saveQualification(qualificationId = null) {
  // Get form values
  const name = document.getElementById('qualification-name').value;
  
  // Validate required fields
  if (!name) {
    alert('Please enter a qualification name');
    return;
  }
  
  // Create qualification object
  const qualification = {
    isNew: qualificationId === null,
    id: qualificationId,
    name
  };
  
  // Send to main process
  window.api.send('saveQualification', qualification);
  
  // Hide the modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('qualificationModal'));
  modal.hide();
}

// Edit qualification function
function editQualification(qualificationId) {
  // Find qualification in the list
  const qualification = qualificationsList.find(q => q.id === qualificationId);
  if (qualification) {
    currentEditingQualificationId = qualificationId;
    showQualificationModal(qualification);
  } else {
    alert('Error: Qualification not found');
  }
}

// Delete qualification function
function deleteQualification(qualificationId) {
  // Show confirmation dialog
  if (confirm('Are you sure you want to delete this qualification?')) {
    window.api.send('deleteQualification', qualificationId);
  }
}

// Handle save qualification response
window.api.receive('saveQualificationResponse', (response) => {
  if (response.success) {
    // Refresh qualifications list
    window.api.send('getQualifications');
  } else {
    alert(`Error saving qualification: ${response.error || 'Unknown error'}`);
  }
});

// Handle delete qualification response
window.api.receive('deleteQualificationResponse', (response) => {
  if (response.success) {
    // Refresh qualifications list
    window.api.send('getQualifications');
  } else {
    alert(`Error deleting qualification: ${response.error || 'Unknown error'}`);
  }
});