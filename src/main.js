const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const database = require('./database');
const fs = require('fs');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;
let loginWindow;

// Authentication state
let isAuthenticated = false;
let currentUser = null;

function createLoginWindow() {
  // Create the login window
  loginWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    resizable: false,
    frame: true,
    show: false
  });

  // Load the login.html file
  loginWindow.loadFile(path.join(__dirname, 'login.html'));

  // Show window when ready
  loginWindow.once('ready-to-show', () => {
    loginWindow.show();
  });

  // Handle window close
  loginWindow.on('closed', () => {
    loginWindow = null;
    if (!isAuthenticated && !mainWindow) {
      app.quit();
    }
  });
}

function createMainWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (loginWindow) {
      loginWindow.close();
    }
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  // Create login window first
  createLoginWindow();
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, recreate window when dock icon is clicked and no windows are open
  if (loginWindow === null && mainWindow === null) {
    createLoginWindow();
  }
});

// Handle login request
ipcMain.on('login', (event, data) => {
  console.log('Login request received:', data);
  const { username, password } = data;
  
  try {
    // Authenticate user
    const user = database.users.authenticate(username, password);
    console.log('Authentication result:', user ? 'Success' : 'Failed');
    
    if (user) {
      // Authentication successful
      isAuthenticated = true;
      currentUser = user;
      
      // Update last login timestamp
      database.users.updateLastLogin(user.id);
      
      // Send success response
      event.sender.send('loginResponse', { success: true });
      
      // Create the main application window
      createMainWindow();
    } else {
      // Authentication failed
      event.sender.send('loginResponse', { success: false });
    }
  } catch (error) {
    console.error('Login error:', error);
    event.sender.send('loginResponse', { success: false });
  }
});

// STUDENT OPERATIONS
// Handle student data requests
ipcMain.on('getStudents', (event) => {
  try {
    const students = database.students.getAll();
    event.sender.send('studentsData', students);
  } catch (error) {
    console.error('Error fetching students:', error);
    event.sender.send('studentsData', []);
  }
});

// Handle get single student request
ipcMain.on('getStudent', (event, studentId) => {
  try {
    const student = database.students.getById(studentId);
    event.sender.send('getStudentResponse', student);
  } catch (error) {
    console.error('Error fetching student:', error);
    event.sender.send('getStudentResponse', null);
  }
});

// Handle student creation/update
ipcMain.on('saveStudent', (event, student) => {
  try {
    let result;
    
    if (student.isNew) {
      // Generate a new ID for the student (format: S001, S002, etc.)
      const students = database.students.getAll();
      const lastId = students.length > 0 
        ? Math.max(...students.map(s => parseInt(s.id.substring(1) || '0'))) 
        : 0;
      const newId = `S${String(lastId + 1).padStart(3, '0')}`;
      
      // Add timestamp
      student.id = newId;
      student.created_at = new Date().toISOString();
      student.updated_at = new Date().toISOString();
      
      result = database.students.create(student);
    } else {
      // Update timestamp
      student.updated_at = new Date().toISOString();
      result = database.students.update(student.id, student);
    }
    
    event.sender.send('saveStudentResponse', { success: true, student: result });
  } catch (error) {
    console.error('Error saving student:', error);
    event.sender.send('saveStudentResponse', { success: false, error: error.message });
  }
});

// Handle student deletion
ipcMain.on('deleteStudent', (event, studentId) => {
  try {
    const result = database.students.delete(studentId);
    event.sender.send('deleteStudentResponse', { 
      success: result.changes > 0,
      id: studentId
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    event.sender.send('deleteStudentResponse', { 
      success: false, 
      error: error.message,
      id: studentId
    });
  }
});

// TEACHER OPERATIONS
// Handle teacher data requests
ipcMain.on('getTeachers', (event) => {
  try {
    const teachers = database.teachers.getAll();
    event.sender.send('teachersData', teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    event.sender.send('teachersData', []);
  }
});

// Handle get single teacher request
ipcMain.on('getTeacher', (event, teacherId) => {
  try {
    const teacher = database.teachers.getById(teacherId);
    event.sender.send('getTeacherResponse', teacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    event.sender.send('getTeacherResponse', null);
  }
});

// Handle teacher creation/update
ipcMain.on('saveTeacher', (event, teacher) => {
  try {
    let result;
    
    if (teacher.isNew) {
      // Generate a new ID for the teacher (format: T001, T002, etc.)
      const teachers = database.teachers.getAll();
      const lastId = teachers.length > 0 
        ? Math.max(...teachers.map(t => parseInt(t.id.substring(1) || '0'))) 
        : 0;
      const newId = `T${String(lastId + 1).padStart(3, '0')}`;
      
      // Add timestamp
      teacher.id = newId;
      teacher.created_at = new Date().toISOString();
      teacher.updated_at = new Date().toISOString();
      
      result = database.teachers.create(teacher);
    } else {
      // Update timestamp
      teacher.updated_at = new Date().toISOString();
      result = database.teachers.update(teacher.id, teacher);
    }
    
    event.sender.send('saveTeacherResponse', { success: true, teacher: result });
  } catch (error) {
    console.error('Error saving teacher:', error);
    event.sender.send('saveTeacherResponse', { success: false, error: error.message });
  }
});

// Handle teacher deletion
ipcMain.on('deleteTeacher', (event, teacherId) => {
  try {
    const result = database.teachers.delete(teacherId);
    event.sender.send('deleteTeacherResponse', { 
      success: result.changes > 0,
      id: teacherId
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    event.sender.send('deleteTeacherResponse', { 
      success: false, 
      error: error.message,
      id: teacherId
    });
  }
});

// CLASS OPERATIONS
// Handle class data requests
ipcMain.on('getClasses', (event) => {
  try {
    const classes = database.classes.getAll();
    event.sender.send('classesData', classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    event.sender.send('classesData', []);
  }
});

// Handle get single class request
ipcMain.on('getClass', (event, classId) => {
  try {
    const classItem = database.classes.getById(classId);
    event.sender.send('getClassResponse', classItem);
  } catch (error) {
    console.error('Error fetching class:', error);
    event.sender.send('getClassResponse', null);
  }
});

// Handle class creation/update
ipcMain.on('saveClass', (event, classData) => {
  try {
    let result;
    
    if (classData.isNew) {
      // Generate a new ID for the class (format: C001, C002, etc.)
      const classes = database.classes.getAll();
      const lastId = classes.length > 0 
        ? Math.max(...classes.map(c => parseInt(c.id.substring(1) || '0'))) 
        : 0;
      const newId = `C${String(lastId + 1).padStart(3, '0')}`;
      
      // Add timestamp
      classData.id = newId;
      classData.created_at = new Date().toISOString();
      classData.updated_at = new Date().toISOString();
      
      result = database.classes.create(classData);
    } else {
      // Update timestamp
      classData.updated_at = new Date().toISOString();
      result = database.classes.update(classData.id, classData);
    }
    
    event.sender.send('saveClassResponse', { success: true, class: result });
  } catch (error) {
    console.error('Error saving class:', error);
    event.sender.send('saveClassResponse', { success: false, error: error.message });
  }
});

// Handle class deletion
ipcMain.on('deleteClass', (event, classId) => {
  try {
    const result = database.classes.delete(classId);
    event.sender.send('deleteClassResponse', { 
      success: result.changes > 0,
      id: classId
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    event.sender.send('deleteClassResponse', { 
      success: false, 
      error: error.message,
      id: classId
    });
  }
});

// Handle get students in class request
ipcMain.on('getStudentsInClass', (event, classId) => {
  try {
    const students = database.classes.getStudentsInClass(classId);
    event.sender.send('studentsInClassResponse', { 
      classId,
      students
    });
  } catch (error) {
    console.error('Error fetching students in class:', error);
    event.sender.send('studentsInClassResponse', { 
      classId,
      students: []
    });
  }
});

// ATTENDANCE OPERATIONS
// Handle get all attendance records
ipcMain.on('getAttendance', (event) => {
  try {
    const attendance = database.attendance.getAll();
    event.sender.send('attendanceData', attendance);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    event.sender.send('attendanceData', []);
  }
});

// Handle get attendance by class
ipcMain.on('getAttendanceByClass', (event, classId) => {
  try {
    const attendance = database.attendance.getByClass(classId);
    event.sender.send('attendanceByClassData', {
      classId,
      attendance
    });
  } catch (error) {
    console.error('Error fetching attendance by class:', error);
    event.sender.send('attendanceByClassData', {
      classId,
      attendance: []
    });
  }
});

// Handle get attendance by date
ipcMain.on('getAttendanceByDate', (event, date) => {
  try {
    const attendance = database.attendance.getByDate(date);
    event.sender.send('attendanceByDateData', {
      date,
      attendance
    });
  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    event.sender.send('attendanceByDateData', {
      date,
      attendance: []
    });
  }
});

// Handle get attendance by class and date
ipcMain.on('getAttendanceByClassAndDate', (event, { classId, date }) => {
  try {
    const attendance = database.attendance.getByClassAndDate(classId, date);
    event.sender.send('attendanceByClassAndDateData', {
      classId,
      date,
      attendance
    });
  } catch (error) {
    console.error('Error fetching attendance by class and date:', error);
    event.sender.send('attendanceByClassAndDateData', {
      classId,
      date,
      attendance: []
    });
  }
});

// Handle save attendance
ipcMain.on('saveAttendance', (event, attendanceData) => {
  try {
    const result = database.attendance.createClassAttendance(attendanceData);
    event.sender.send('saveAttendanceResponse', { 
      success: result.success,
      classId: attendanceData.classId,
      date: attendanceData.date
    });
  } catch (error) {
    console.error('Error saving attendance:', error);
    event.sender.send('saveAttendanceResponse', { 
      success: false, 
      error: error.message,
      classId: attendanceData.classId,
      date: attendanceData.date
    });
  }
});

// Handle update student attendance
ipcMain.on('updateStudentAttendance', (event, { classId, date, studentId, status }) => {
  try {
    const result = database.attendance.updateStudentAttendance(classId, date, studentId, status);
    event.sender.send('updateStudentAttendanceResponse', { 
      success: result.success,
      classId,
      date,
      studentId
    });
  } catch (error) {
    console.error('Error updating student attendance:', error);
    event.sender.send('updateStudentAttendanceResponse', { 
      success: false, 
      error: error.message,
      classId,
      date,
      studentId
    });
  }
});

// Handle delete attendance
ipcMain.on('deleteAttendance', (event, { classId, date }) => {
  try {
    const result = database.attendance.deleteClassAttendance(classId, date);
    event.sender.send('deleteAttendanceResponse', { 
      success: result.success,
      classId,
      date
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    event.sender.send('deleteAttendanceResponse', { 
      success: false, 
      error: error.message,
      classId,
      date
    });
  }
});

// GRADES OPERATIONS
// Handle get all grades
ipcMain.on('getGrades', (event) => {
  try {
    const grades = database.grades.getAll();
    event.sender.send('gradesData', grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    event.sender.send('gradesData', []);
  }
});

// Handle get grades by class
ipcMain.on('getGradesByClass', (event, classId) => {
  try {
    const grades = database.grades.getByClass(classId);
    event.sender.send('gradesByClassData', {
      classId,
      grades
    });
  } catch (error) {
    console.error('Error fetching grades by class:', error);
    event.sender.send('gradesByClassData', {
      classId,
      grades: []
    });
  }
});

// Handle get grades by student
ipcMain.on('getGradesByStudent', (event, studentId) => {
  try {
    const grades = database.grades.getByStudent(studentId);
    event.sender.send('gradesByStudentData', {
      studentId,
      grades
    });
  } catch (error) {
    console.error('Error fetching grades by student:', error);
    event.sender.send('gradesByStudentData', {
      studentId,
      grades: []
    });
  }
});

// Handle get grades by assignment
ipcMain.on('getGradesByAssignment', (event, assignmentId) => {
  try {
    const grades = database.grades.getByAssignment(assignmentId);
    event.sender.send('gradesByAssignmentData', {
      assignmentId,
      grades
    });
  } catch (error) {
    console.error('Error fetching grades by assignment:', error);
    event.sender.send('gradesByAssignmentData', {
      assignmentId,
      grades: []
    });
  }
});

// Handle get grades by class and assignment
ipcMain.on('getGradesByClassAndAssignment', (event, { classId, assignmentId }) => {
  try {
    const grades = database.grades.getByClassAndAssignment(classId, assignmentId);
    event.sender.send('gradesByClassAndAssignmentData', {
      classId,
      assignmentId,
      grades
    });
  } catch (error) {
    console.error('Error fetching grades by class and assignment:', error);
    event.sender.send('gradesByClassAndAssignmentData', {
      classId,
      assignmentId,
      grades: []
    });
  }
});

// Handle create assignment
ipcMain.on('createAssignment', (event, { classId, assignment }) => {
  try {
    const result = database.grades.createAssignment(classId, assignment);
    event.sender.send('createAssignmentResponse', { 
      success: result.success,
      assignmentId: result.assignmentId,
      classId
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    event.sender.send('createAssignmentResponse', { 
      success: false, 
      error: error.message,
      classId
    });
  }
});

// Handle save assignment grades
ipcMain.on('saveAssignmentGrades', (event, assignmentGrades) => {
  try {
    const result = database.grades.createAssignmentGrades(assignmentGrades);
    event.sender.send('saveAssignmentGradesResponse', { 
      success: result.success,
      classId: assignmentGrades.classId,
      assignmentId: assignmentGrades.assignmentId
    });
  } catch (error) {
    console.error('Error saving assignment grades:', error);
    event.sender.send('saveAssignmentGradesResponse', { 
      success: false, 
      error: error.message,
      classId: assignmentGrades.classId,
      assignmentId: assignmentGrades.assignmentId
    });
  }
});

// Handle update student grade
ipcMain.on('updateStudentGrade', (event, { classId, assignmentId, studentId, grade, feedback }) => {
  try {
    const result = database.grades.updateStudentGrade(classId, assignmentId, studentId, grade, feedback);
    event.sender.send('updateStudentGradeResponse', { 
      success: result.success,
      classId,
      assignmentId,
      studentId
    });
  } catch (error) {
    console.error('Error updating student grade:', error);
    event.sender.send('updateStudentGradeResponse', { 
      success: false, 
      error: error.message,
      classId,
      assignmentId,
      studentId
    });
  }
});

// Handle delete assignment
ipcMain.on('deleteAssignment', (event, assignmentId) => {
  try {
    const result = database.grades.deleteAssignment(assignmentId);
    event.sender.send('deleteAssignmentResponse', { 
      success: result.success,
      assignmentId
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    event.sender.send('deleteAssignmentResponse', { 
      success: false, 
      error: error.message,
      assignmentId
    });
  }
});

// Handle get student class grade
ipcMain.on('getStudentClassGrade', (event, { classId, studentId }) => {
  try {
    const gradeData = database.grades.getStudentClassGrade(classId, studentId);
    event.sender.send('studentClassGradeData', {
      classId,
      studentId,
      ...gradeData
    });
  } catch (error) {
    console.error('Error fetching student class grade:', error);
    event.sender.send('studentClassGradeData', {
      classId,
      studentId,
      average: 0,
      assignments: []
    });
  }
});

// SETTINGS OPERATIONS
// Handle get settings request
ipcMain.on('getSettings', (event) => {
  try {
    const settings = database.settings.getAll();
    event.sender.send('settingsData', settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    event.sender.send('settingsData', null);
  }
});

// Handle save settings request
ipcMain.on('saveSettings', (event, settings) => {
  try {
    const result = database.settings.save(settings);
    event.sender.send('saveSettingsResponse', { 
      success: result.success
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    event.sender.send('saveSettingsResponse', { 
      success: false, 
      error: error.message
    });
  }
});

// Handle get current user request
ipcMain.on('getCurrentUser', (event) => {
  try {
    // Return the current authenticated user (without password)
    if (currentUser) {
      const userCopy = { ...currentUser };
      delete userCopy.password;
      event.sender.send('currentUserData', userCopy);
    } else {
      event.sender.send('currentUserData', null);
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
    event.sender.send('currentUserData', null);
  }
});

// Handle update user request
ipcMain.on('updateUser', (event, userData) => {
  try {
    // Check if changing password
    if (userData.currentPassword && userData.newPassword) {
      // Verify current password
      const user = database.users.authenticate(currentUser.username, userData.currentPassword);
      
      if (!user) {
        event.sender.send('updateUserResponse', { 
          success: false, 
          error: 'Current password is incorrect'
        });
        return;
      }
      
      // Update user with new password
      const updatedUser = {
        ...currentUser,
        name: userData.name,
        email: userData.email,
        password: userData.newPassword,
        updated_at: new Date().toISOString()
      };
      
      const result = database.users.update(updatedUser.id, updatedUser);
      
      if (result.success) {
        // Update current user in memory
        currentUser = updatedUser;
        
        event.sender.send('updateUserResponse', { 
          success: true
        });
      } else {
        event.sender.send('updateUserResponse', { 
          success: false, 
          error: 'Failed to update user'
        });
      }
    } else {
      // Update user without changing password
      const updatedUser = {
        ...currentUser,
        name: userData.name,
        email: userData.email,
        updated_at: new Date().toISOString()
      };
      
      const result = database.users.update(updatedUser.id, updatedUser);
      
      if (result.success) {
        // Update current user in memory
        currentUser = updatedUser;
        
        event.sender.send('updateUserResponse', { 
          success: true
        });
      } else {
        event.sender.send('updateUserResponse', { 
          success: false, 
          error: 'Failed to update user'
        });
      }
    }
  } catch (error) {
    console.error('Error updating user:', error);
    event.sender.send('updateUserResponse', { 
      success: false, 
      error: error.message
    });
  }
});

// Handle create backup request
ipcMain.on('createBackup', (event, filePath) => {
  try {
    // Create backup data
    const backup = database.backup.create();
    
    if (backup.success) {
      // Write the backup data to the specified file path
      fs.writeFileSync(filePath, JSON.stringify(backup.data, null, 2));
      
      event.sender.send('backupResponse', { 
        success: true,
        path: filePath
      });
    } else {
      event.sender.send('backupResponse', { 
        success: false,
        error: 'Failed to create backup data'
      });
    }
  } catch (error) {
    console.error('Error creating backup:', error);
    event.sender.send('backupResponse', { 
      success: false, 
      error: error.message
    });
  }
});

// Handle show save dialog request
ipcMain.on('showSaveDialog', async (event, options) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, options);
    
    if (!canceled && filePath) {
      // User selected a file path, create backup at that location
      event.sender.send('createBackup', filePath);
    }
  } catch (error) {
    console.error('Error showing save dialog:', error);
    event.sender.send('backupResponse', { 
      success: false, 
      error: error.message
    });
  }
});

// Handle restore backup request
ipcMain.on('restoreBackup', (event, backupFile) => {
  try {
    const result = database.backup.restore(backupFile);
    event.sender.send('restoreResponse', result);
    
    // Restart the app if successful
    if (result.success) {
      setTimeout(() => {
        app.relaunch();
        app.exit();
      }, 2000);
    }
  } catch (error) {
    console.error('Error restoring backup:', error);
    event.sender.send('restoreResponse', { 
      success: false, 
      error: error.message
    });
  }
});

// Handle reset data request
ipcMain.on('resetData', (event) => {
  try {
    const result = database.backup.reset();
    event.sender.send('resetResponse', result);
    
    // Restart the app if successful
    if (result.success) {
      setTimeout(() => {
        app.relaunch();
        app.exit();
      }, 2000);
    }
  } catch (error) {
    console.error('Error resetting data:', error);
    event.sender.send('resetResponse', { 
      success: false, 
      error: error.message
    });
  }
});

// Clean up resources when app is about to quit
app.on('before-quit', () => {
  // Close the database connection (no-op for JSON files)
  database.close();
});
