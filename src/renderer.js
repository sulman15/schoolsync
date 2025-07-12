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

// STUDENT FUNCTIONS
// Load students data into the table
function loadStudentsData() {
  // Clear existing table data
  studentsTableBody.innerHTML = '';
  
  // Show loading indicator
  studentsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
  
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
    studentsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No students found</td></tr>';
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
    
    // Create photo cell
    const photoCell = document.createElement('td');
    const photoImg = document.createElement('img');
    photoImg.className = 'student-photo-small';
    photoImg.src = student.photoPath ? student.photoPath : 'assets/default-logo.png';
    photoImg.alt = student.name;
    photoCell.appendChild(photoImg);
    
    row.appendChild(photoCell);
    
    // Add other cells
    row.innerHTML += `
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
  
  // Add event listeners to edit and delete buttons
  document.querySelectorAll('.edit-student').forEach(button => {
    button.addEventListener('click', () => {
      const studentId = button.getAttribute('data-id');
      editStudent(studentId);
    });
  });
  
  document.querySelectorAll('.delete-student').forEach(button => {
    button.addEventListener('click', () => {
      const studentId = button.getAttribute('data-id');
      if (confirm(`Are you sure you want to delete student ${studentId}?`)) {
        deleteStudent(studentId);
      }
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Student search
  if (studentSearchInput) {
    studentSearchInput.addEventListener('input', () => {
      const searchQuery = studentSearchInput.value.toLowerCase().trim();
      if (allStudentsList) {
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
  
  // Add student button
  if (addStudentBtn) {
    addStudentBtn.addEventListener('click', () => {
      showStudentModal();
    });
  }
  
  // Save student button
  const saveStudentBtn = document.getElementById('save-student-btn');
  if (saveStudentBtn) {
    saveStudentBtn.addEventListener('click', () => {
      saveStudent(currentEditingStudentId);
    });
  }
  
  // Upload student photo button
  const uploadStudentPhotoBtn = document.getElementById('upload-student-photo');
  const studentPhotoInput = document.getElementById('student-photo-input');
  if (uploadStudentPhotoBtn && studentPhotoInput) {
    uploadStudentPhotoBtn.addEventListener('click', () => {
      studentPhotoInput.click();
    });
    
    studentPhotoInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
          document.getElementById('student-photo-preview').src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }
  
  // Student details buttons
  const editStudentDetailsBtn = document.getElementById('edit-student-details-btn');
  if (editStudentDetailsBtn) {
    editStudentDetailsBtn.addEventListener('click', () => {
      // Close details modal
      window.closeModal('studentDetailsModal');
      
      // Open edit modal with current student
      setTimeout(() => {
        editStudent(currentEditingStudentId);
      }, 500);
    });
  }
  
  // Export student PDF button
  const exportStudentPdfBtn = document.getElementById('export-student-pdf');
  if (exportStudentPdfBtn) {
    exportStudentPdfBtn.addEventListener('click', () => {
      // Get current student details
      const student = allStudentsList.find(s => s.id === currentEditingStudentId);
      if (student) {
        // Prepare data for PDF export
        const pdfData = {
          type: 'student',
          content: student,
          fileName: `Student_${student.id}_${student.name}.pdf`
        };
        
        // Send export request
        window.api.send('exportPDF', pdfData);
      }
    });
  }
  
  // Export students list PDF button
  const exportStudentsPdfBtn = document.getElementById('export-students-pdf');
  if (exportStudentsPdfBtn) {
    exportStudentsPdfBtn.addEventListener('click', () => {
      // Prepare data for PDF export
      const pdfData = {
        type: 'students',
        content: allStudentsList,
        fileName: 'Students_List.pdf'
      };
      
      // Send export request
      window.api.send('exportPDF', pdfData);
    });
  }
  
  // Teacher search
  if (teacherSearchInput) {
    teacherSearchInput.addEventListener('input', () => {
      const searchQuery = teacherSearchInput.value.toLowerCase().trim();
      if (allTeachersList) {
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
  
  // Add teacher button
  if (addTeacherBtn) {
    addTeacherBtn.addEventListener('click', () => {
      showTeacherModal();
    });
  }
  
  // Class search
  if (classSearchInput) {
    classSearchInput.addEventListener('input', () => {
      const searchQuery = classSearchInput.value.toLowerCase().trim();
      if (allClassesList) {
        const filteredClasses = allClassesList.filter(classItem => 
          classItem.id.toLowerCase().includes(searchQuery) ||
          classItem.name.toLowerCase().includes(searchQuery) ||
          (classItem.subject && classItem.subject.toLowerCase().includes(searchQuery))
        );
        displayClasses(filteredClasses);
      }
    });
  }
  
  // Add class button
  if (addClassBtn) {
    addClassBtn.addEventListener('click', () => {
      showClassModal();
    });
  }
  
  // Load attendance button
  if (loadAttendanceBtn) {
    loadAttendanceBtn.addEventListener('click', loadClassAttendance);
  }
  
  // Save attendance button
  if (saveAttendanceBtn) {
    saveAttendanceBtn.addEventListener('click', saveAttendance);
  }
  
  // Load assignments button
  if (loadAssignmentsBtn) {
    loadAssignmentsBtn.addEventListener('click', loadClassAssignments);
  }
  
  // Add assignment button
  if (addAssignmentBtn) {
    addAssignmentBtn.addEventListener('click', () => {
      showAssignmentModal();
    });
  }
  
  // Save grades button
  if (saveGradesBtn) {
    saveGradesBtn.addEventListener('click', saveAssignmentGrades);
  }
  
  // Load student grades button
  if (loadStudentGradesBtn) {
    loadStudentGradesBtn.addEventListener('click', loadStudentGrades);
  }
  
  // Settings tab links
  if (settingsTabLinks.length > 0) {
    settingsTabLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        settingsTabLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Show corresponding tab
        const tabId = link.getAttribute('data-settings-tab');
        setupSettingsTabs(tabId);
      });
    });
  }
  
  // Save school info button
  if (saveSchoolInfoBtn) {
    saveSchoolInfoBtn.addEventListener('click', saveSchoolInfo);
  }
  
  // Select logo button
  if (selectLogoBtn) {
    selectLogoBtn.addEventListener('click', () => {
      window.api.send('selectLogo');
    });
  }
  
  // Create backup button
  if (createBackupBtn) {
    createBackupBtn.addEventListener('click', createBackup);
  }
  
  // Restore backup button
  if (restoreBackupBtn) {
    restoreBackupBtn.addEventListener('click', restoreBackup);
  }
  
  // Reset data button
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', resetData);
  }
  
  // Collect fees button
  const collectFeesBtn = document.getElementById('collect-fees-btn');
  if (collectFeesBtn) {
    collectFeesBtn.addEventListener('click', () => {
      // Open collect fee modal
      showCollectFeeModal();
    });
  }
  
  // Save fee payment button
  const saveFeePaymentBtn = document.getElementById('save-fee-payment-btn');
  if (saveFeePaymentBtn) {
    saveFeePaymentBtn.addEventListener('click', saveFeePayment);
  }
  
  // Fee student select
  const feeStudentSelect = document.getElementById('fee-student');
  if (feeStudentSelect) {
    feeStudentSelect.addEventListener('change', () => {
      const studentId = feeStudentSelect.value;
      if (studentId) {
        // Get student fee details
        const student = allStudentsList.find(s => s.id === studentId);
        if (student && student.feeAmount) {
          document.getElementById('fee-amount-display').value = student.feeAmount;
          document.getElementById('fee-discount-display').value = student.feeDiscount || '0';
          
          // Calculate net amount
          const amount = parseFloat(student.feeAmount);
          const discount = parseFloat(student.feeDiscount || 0);
          const netAmount = amount - (amount * discount / 100);
          document.getElementById('fee-net-amount').value = netAmount.toFixed(2);
        }
      }
    });
  }
  
  // Fee filters
  const applyFeeFiltersBtn = document.getElementById('apply-fee-filters');
  if (applyFeeFiltersBtn) {
    applyFeeFiltersBtn.addEventListener('click', applyFeeFilters);
  }
  
  // Export fees PDF button
  const exportFeesPdfBtn = document.getElementById('export-fees-pdf');
  if (exportFeesPdfBtn) {
    exportFeesPdfBtn.addEventListener('click', () => {
      // Prepare data for PDF export
      const pdfData = {
        type: 'fees',
        content: {
          fees: currentFees || [],
          summary: feeSummary
        },
        fileName: 'Fee_Report.pdf'
      };
      
      // Send export request
      window.api.send('exportPDF', pdfData);
    });
  }
  
  // Export receipt PDF button
  const exportReceiptPdfBtn = document.getElementById('export-receipt-pdf');
  if (exportReceiptPdfBtn) {
    exportReceiptPdfBtn.addEventListener('click', () => {
      // Get receipt data from the modal
      const receiptData = {
        schoolName: document.getElementById('receipt-school-name').textContent,
        studentId: document.getElementById('receipt-student-id').textContent,
        studentName: document.getElementById('receipt-student-name').textContent,
        receiptNo: document.getElementById('receipt-no').textContent,
        date: document.getElementById('receipt-date').textContent,
        description: document.getElementById('receipt-description').textContent,
        amount: document.getElementById('receipt-fee-amount').textContent,
        discount: document.getElementById('receipt-discount').textContent,
        total: document.getElementById('receipt-total').textContent,
        paymentMethod: document.getElementById('receipt-payment-method').textContent
      };
      
      // Prepare data for PDF export
      const pdfData = {
        type: 'receipt',
        content: receiptData,
        fileName: `Receipt_${receiptData.receiptNo}.pdf`
      };
      
      // Send export request
      window.api.send('exportPDF', pdfData);
    });
  }
  
  // Print receipt button
  const printReceiptBtn = document.getElementById('print-receipt-btn');
  if (printReceiptBtn) {
    printReceiptBtn.addEventListener('click', () => {
      const receiptContent = document.getElementById('fee-receipt-content');
      if (receiptContent) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Fee Receipt</title>');
        printWindow.document.write('<style>body { font-family: Arial, sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } .text-end { text-align: right; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(receiptContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    });
  }
}

// ... rest of the file unchanged