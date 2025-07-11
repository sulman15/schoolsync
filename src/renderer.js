// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const contentPages = document.querySelectorAll('.content-page');
const addStudentBtn = document.getElementById('add-student-btn');
const studentsTableBody = document.getElementById('students-table-body');
const addTeacherBtn = document.getElementById('add-teacher-btn');
const teachersTableBody = document.getElementById('teachers-table-body');

// Store the currently editing IDs
let currentEditingStudentId = null;
let currentEditingTeacherId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Set up navigation
  setupNavigation();
  
  // Load initial data
  loadStudentsData();
  
  // Set up event listeners
  setupEventListeners();
});

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
      }
      // Add similar conditions for other pages
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
}

// Handle received students data
window.api.receive('studentsData', (students) => {
  // Clear loading indicator
  studentsTableBody.innerHTML = '';
  
  if (students.length === 0) {
    studentsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No students found</td></tr>';
    return;
  }
  
  // Add student data to the table
  students.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.grade}</td>
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
});

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
  // Clear loading indicator
  teachersTableBody.innerHTML = '';
  
  if (teachers.length === 0) {
    teachersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No teachers found</td></tr>';
    return;
  }
  
  // Add teacher data to the table
  teachers.forEach(teacher => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${teacher.id}</td>
      <td>${teacher.name}</td>
      <td>${teacher.subject || 'Not assigned'}</td>
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
});

// Set up event listeners for various actions
function setupEventListeners() {
  // Add student button
  if (addStudentBtn) {
    addStudentBtn.addEventListener('click', () => {
      showStudentModal();
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
}

// STUDENT MODAL FUNCTIONS
// Show modal to add or edit a student
function showStudentModal(student = null) {
  // Determine if we're adding or editing
  const isEditing = student !== null;
  const modalTitle = isEditing ? 'Edit Student' : 'Add New Student';
  
  // Create modal HTML
  const modalHtml = `
    <div class="modal fade" id="studentModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="student-form">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="student-name" class="form-label">Full Name</label>
                  <input type="text" class="form-control" id="student-name" value="${isEditing ? student.name : ''}" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="student-grade" class="form-label">Grade</label>
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
                  <input type="tel" class="form-control" id="student-parent-contact" value="${isEditing && student.parent_contact ? student.parent_contact : ''}">
                </div>
              </div>
              
              <div class="mb-3">
                <label for="student-enrollment-date" class="form-label">Enrollment Date</label>
                <input type="date" class="form-control" id="student-enrollment-date" value="${isEditing && student.enrollment_date ? student.enrollment_date : new Date().toISOString().split('T')[0]}">
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
    enrollment_date: enrollmentDate
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
    // Reload students data
    loadStudentsData();
  } else {
    alert('Error saving student: ' + response.error);
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
    // Reload students data
    loadStudentsData();
  } else {
    alert('Error deleting student: ' + response.error);
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
                  <label for="teacher-name" class="form-label">Full Name</label>
                  <input type="text" class="form-control" id="teacher-name" value="${isEditing ? teacher.name : ''}" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="teacher-subject" class="form-label">Subject</label>
                  <input type="text" class="form-control" id="teacher-subject" value="${isEditing && teacher.subject ? teacher.subject : ''}" required>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="teacher-qualification" class="form-label">Qualification</label>
                  <input type="text" class="form-control" id="teacher-qualification" value="${isEditing && teacher.qualification ? teacher.qualification : ''}">
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
  const qualification = document.getElementById('teacher-qualification').value;
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
    qualification,
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
    // Reload teachers data
    loadTeachersData();
  } else {
    alert('Error saving teacher: ' + response.error);
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
    // Reload teachers data
    loadTeachersData();
  } else {
    alert('Error deleting teacher: ' + response.error);
  }
}); 