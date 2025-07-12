const fs = require('fs');
const path = require('path');

// Determine the user data directory based on the platform
const getUserDataPath = () => {
  const appName = 'SchoolSync';
  
  switch (process.platform) {
    case 'win32':
      return path.join(process.env.APPDATA, appName);
    case 'darwin':
      return path.join(process.env.HOME, 'Library', 'Application Support', appName);
    case 'linux':
      return path.join(process.env.HOME, '.config', appName);
    default:
      return path.join(process.env.HOME, appName);
  }
};

// Ensure the user data directory exists
const userDataPath = getUserDataPath();
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// Database file paths
const dbFiles = {
  students: path.join(userDataPath, 'students.json'),
  teachers: path.join(userDataPath, 'teachers.json'),
  classes: path.join(userDataPath, 'classes.json'),
  users: path.join(userDataPath, 'users.json'),
  attendance: path.join(userDataPath, 'attendance.json'),
  grades: path.join(userDataPath, 'grades.json'),
  settings: path.join(userDataPath, 'settings.json'),
  qualifications: path.join(userDataPath, 'qualifications.json'),
  fees: path.join(userDataPath, 'fees.json')
};

// Initialize database files if they don't exist
function initializeDatabase() {
  console.log('Initializing database files...');
  
  // Initialize students.json
  if (!fs.existsSync(dbFiles.students)) {
    fs.writeFileSync(dbFiles.students, JSON.stringify([], null, 2));
  }
  
  // Initialize teachers.json
  if (!fs.existsSync(dbFiles.teachers)) {
    fs.writeFileSync(dbFiles.teachers, JSON.stringify([], null, 2));
  }
  
  // Initialize classes.json
  if (!fs.existsSync(dbFiles.classes)) {
    fs.writeFileSync(dbFiles.classes, JSON.stringify([], null, 2));
  }
  
  // Initialize users.json with default admin user
  if (!fs.existsSync(dbFiles.users)) {
    const defaultUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        role: 'administrator',
        name: 'System Administrator',
        email: 'admin@schoolsync.com',
        created_at: new Date().toISOString(),
        last_login: null
      }
    ];
    fs.writeFileSync(dbFiles.users, JSON.stringify(defaultUsers, null, 2));
    console.log('Default admin user created');
  }
  
  // Initialize attendance.json
  if (!fs.existsSync(dbFiles.attendance)) {
    fs.writeFileSync(dbFiles.attendance, JSON.stringify([], null, 2));
  }
  
  // Initialize grades.json
  if (!fs.existsSync(dbFiles.grades)) {
    fs.writeFileSync(dbFiles.grades, JSON.stringify([], null, 2));
  }
  
  // Initialize qualifications.json
  if (!fs.existsSync(dbFiles.qualifications)) {
    const defaultQualifications = [
      { id: 'q001', name: 'Bachelor of Education' },
      { id: 'q002', name: 'Master of Education' },
      { id: 'q003', name: 'PhD in Education' },
      { id: 'q004', name: 'Teaching Certificate' }
    ];
    fs.writeFileSync(dbFiles.qualifications, JSON.stringify(defaultQualifications, null, 2));
    console.log('Default qualifications created');
  }
  
  // Initialize settings.json
  if (!fs.existsSync(dbFiles.settings)) {
    const defaultSettings = {
      schoolInfo: {
        name: 'SchoolSync Academy',
        address: '',
        phone: '',
        email: '',
        website: '',
        principal: '',
        logo: 'assets/default-logo.png'
      },
      preferences: {
        theme: 'light',
        dateFormat: 'MM/DD/YYYY',
        language: 'en',
        autoBackup: false
      }
    };
    fs.writeFileSync(dbFiles.settings, JSON.stringify(defaultSettings, null, 2));
    console.log('Default settings created');
  }
  
  // Initialize fees.json
  if (!fs.existsSync(dbFiles.fees)) {
    fs.writeFileSync(dbFiles.fees, JSON.stringify([], null, 2));
    console.log('Fees database initialized');
  }
  
  // Create photos directory if it doesn't exist
  const photosDir = path.join(userDataPath, 'photos');
  if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
    console.log('Photos directory created');
  }
}

// Initialize the database
initializeDatabase();

// Helper function to read a database file
function readDbFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading database file ${filePath}:`, error);
    return [];
  }
}

// Helper function to write to a database file
function writeDbFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to database file ${filePath}:`, error);
    return false;
  }
}

// Database CRUD operations for Students
const studentsDb = {
  // Get all students
  getAll: () => {
    return readDbFile(dbFiles.students);
  },
  
  // Get a student by ID
  getById: (id) => {
    const students = readDbFile(dbFiles.students);
    return students.find(student => student.id === id);
  },
  
  // Create a new student
  create: (student) => {
    const students = readDbFile(dbFiles.students);
    students.push(student);
    if (writeDbFile(dbFiles.students, students)) {
      return { id: student.id, changes: 1 };
    }
    return { id: student.id, changes: 0 };
  },
  
  // Update a student
  update: (id, studentData) => {
    const students = readDbFile(dbFiles.students);
    const index = students.findIndex(student => student.id === id);
    
    if (index !== -1) {
      students[index] = { ...students[index], ...studentData, updated_at: new Date().toISOString() };
      if (writeDbFile(dbFiles.students, students)) {
        return { id, changes: 1 };
      }
    }
    
    return { id, changes: 0 };
  },
  
  // Delete a student
  delete: (id) => {
    const students = readDbFile(dbFiles.students);
    const initialLength = students.length;
    const filteredStudents = students.filter(student => student.id !== id);
    
    if (filteredStudents.length < initialLength) {
      if (writeDbFile(dbFiles.students, filteredStudents)) {
        return { id, changes: 1 };
      }
    }
    
    return { id, changes: 0 };
  },
  
  // Save student photo
  savePhoto: (studentId, photoData, extension) => {
    try {
      const photosDir = path.join(userDataPath, 'photos');
      if (!fs.existsSync(photosDir)) {
        fs.mkdirSync(photosDir, { recursive: true });
      }
      
      const photoFileName = `student_${studentId}.${extension}`;
      const photoPath = path.join(photosDir, photoFileName);
      
      // Convert base64 data to buffer and save
      const base64Data = photoData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(photoPath, buffer);
      
      // Update student record with photo path
      const students = readDbFile(dbFiles.students);
      const index = students.findIndex(student => student.id === studentId);
      
      if (index !== -1) {
        students[index].photo = `photos/${photoFileName}`;
        writeDbFile(dbFiles.students, students);
      }
      
      return { success: true, photoPath: `photos/${photoFileName}` };
    } catch (error) {
      console.error('Error saving student photo:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get student photo
  getPhoto: (photoPath) => {
    try {
      const fullPath = path.join(userDataPath, photoPath);
      if (fs.existsSync(fullPath)) {
        const data = fs.readFileSync(fullPath);
        return { success: true, data };
      } else {
        return { success: false, error: 'Photo not found' };
      }
    } catch (error) {
      console.error('Error getting student photo:', error);
      return { success: false, error: error.message };
    }
  }
};

// Database CRUD operations for Teachers
const teachersDb = {
  // Get all teachers
  getAll: () => {
    return readDbFile(dbFiles.teachers);
  },
  
  // Get a teacher by ID
  getById: (id) => {
    const teachers = readDbFile(dbFiles.teachers);
    return teachers.find(teacher => teacher.id === id);
  },
  
  // Create a new teacher
  create: (teacher) => {
    const teachers = readDbFile(dbFiles.teachers);
    teachers.push(teacher);
    if (writeDbFile(dbFiles.teachers, teachers)) {
      return { id: teacher.id, changes: 1 };
    }
    return { id: teacher.id, changes: 0 };
  },
  
  // Update a teacher
  update: (id, teacherData) => {
    const teachers = readDbFile(dbFiles.teachers);
    const index = teachers.findIndex(teacher => teacher.id === id);
    
    if (index !== -1) {
      teachers[index] = { ...teachers[index], ...teacherData, updated_at: new Date().toISOString() };
      if (writeDbFile(dbFiles.teachers, teachers)) {
        return { id, changes: 1 };
      }
    }
    
    return { id, changes: 0 };
  },
  
  // Delete a teacher
  delete: (id) => {
    const teachers = readDbFile(dbFiles.teachers);
    const initialLength = teachers.length;
    const filteredTeachers = teachers.filter(teacher => teacher.id !== id);
    
    if (filteredTeachers.length < initialLength) {
      if (writeDbFile(dbFiles.teachers, filteredTeachers)) {
        return { id, changes: 1 };
      }
    }
    
    return { id, changes: 0 };
  }
};

// Database CRUD operations for Classes
const classesDb = {
  // Get all classes
  getAll: () => {
    return readDbFile(dbFiles.classes);
  },
  
  // Get a class by ID
  getById: (id) => {
    const classes = readDbFile(dbFiles.classes);
    return classes.find(classItem => classItem.id === id);
  },
  
  // Create a new class
  create: (classData) => {
    const classes = readDbFile(dbFiles.classes);
    classes.push(classData);
    if (writeDbFile(dbFiles.classes, classes)) {
      return { id: classData.id, changes: 1 };
    }
    return { id: classData.id, changes: 0 };
  },
  
  // Update a class
  update: (id, classData) => {
    const classes = readDbFile(dbFiles.classes);
    const index = classes.findIndex(classItem => classItem.id === id);
    
    if (index !== -1) {
      classes[index] = { ...classes[index], ...classData, updated_at: new Date().toISOString() };
      if (writeDbFile(dbFiles.classes, classes)) {
        return { id, changes: 1 };
      }
    }
    
    return { id, changes: 0 };
  },
  
  // Delete a class
  delete: (id) => {
    const classes = readDbFile(dbFiles.classes);
    const initialLength = classes.length;
    const filteredClasses = classes.filter(classItem => classItem.id !== id);
    
    if (filteredClasses.length < initialLength) {
      if (writeDbFile(dbFiles.classes, filteredClasses)) {
        return { id, changes: 1 };
      }
    }
    
    return { id, changes: 0 };
  },
  
  // Get students in a class
  getStudentsInClass: (classId) => {
    const students = readDbFile(dbFiles.students);
    return students.filter(student => student.classId === classId);
  }
};

// Database CRUD operations for Attendance
const attendanceDb = {
  // Get all attendance records
  getAll: () => {
    return readDbFile(dbFiles.attendance);
  },
  
  // Get attendance records by date
  getByDate: (date) => {
    const attendance = readDbFile(dbFiles.attendance);
    return attendance.filter(record => record.date === date);
  },
  
  // Get attendance records by class
  getByClass: (classId) => {
    const attendance = readDbFile(dbFiles.attendance);
    return attendance.filter(record => record.classId === classId);
  },
  
  // Get attendance records by student
  getByStudent: (studentId) => {
    const attendance = readDbFile(dbFiles.attendance);
    return attendance.filter(record => record.studentId === studentId);
  },
  
  // Get attendance records by class and date
  getByClassAndDate: (classId, date) => {
    const attendance = readDbFile(dbFiles.attendance);
    return attendance.filter(record => record.classId === classId && record.date === date);
  },
  
  // Create attendance records for a class on a specific date
  createClassAttendance: (classAttendance) => {
    const attendance = readDbFile(dbFiles.attendance);
    
    // Check if attendance record for this class and date already exists
    const existingIndex = attendance.findIndex(
      record => record.classId === classAttendance.classId && record.date === classAttendance.date
    );
    
    if (existingIndex !== -1) {
      // Update existing record
      attendance[existingIndex] = {
        ...attendance[existingIndex],
        ...classAttendance,
        updated_at: new Date().toISOString()
      };
    } else {
      // Add new record
      attendance.push({
        ...classAttendance,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    if (writeDbFile(dbFiles.attendance, attendance)) {
      return { success: true, changes: 1 };
    }
    return { success: false, changes: 0 };
  },
  
  // Update student attendance status
  updateStudentAttendance: (classId, date, studentId, status) => {
    const attendance = readDbFile(dbFiles.attendance);
    
    // Find the attendance record for this class and date
    const recordIndex = attendance.findIndex(
      record => record.classId === classId && record.date === date
    );
    
    if (recordIndex === -1) {
      return { success: false, message: 'Attendance record not found' };
    }
    
    // Find the student in the attendance record
    const studentIndex = attendance[recordIndex].students.findIndex(
      student => student.studentId === studentId
    );
    
    if (studentIndex === -1) {
      return { success: false, message: 'Student not found in attendance record' };
    }
    
    // Update the student's attendance status
    attendance[recordIndex].students[studentIndex].status = status;
    attendance[recordIndex].updated_at = new Date().toISOString();
    
    if (writeDbFile(dbFiles.attendance, attendance)) {
      return { success: true, changes: 1 };
    }
    return { success: false, changes: 0 };
  },
  
  // Delete attendance record for a class on a specific date
  deleteClassAttendance: (classId, date) => {
    const attendance = readDbFile(dbFiles.attendance);
    const initialLength = attendance.length;
    const filteredAttendance = attendance.filter(
      record => !(record.classId === classId && record.date === date)
    );
    
    if (filteredAttendance.length < initialLength) {
      if (writeDbFile(dbFiles.attendance, filteredAttendance)) {
        return { success: true, changes: 1 };
      }
    }
    
    return { success: false, changes: 0 };
  }
};

// Database CRUD operations for Grades
const gradesDb = {
  // Get all grade records
  getAll: () => {
    return readDbFile(dbFiles.grades);
  },
  
  // Get grade records by class
  getByClass: (classId) => {
    const grades = readDbFile(dbFiles.grades);
    return grades.filter(record => record.classId === classId);
  },
  
  // Get grade records by student
  getByStudent: (studentId) => {
    const grades = readDbFile(dbFiles.grades);
    return grades.filter(record => record.studentId === studentId);
  },
  
  // Get grade records by assignment
  getByAssignment: (assignmentId) => {
    const grades = readDbFile(dbFiles.grades);
    return grades.filter(record => record.assignmentId === assignmentId);
  },
  
  // Get grade records by class and assignment
  getByClassAndAssignment: (classId, assignmentId) => {
    const grades = readDbFile(dbFiles.grades);
    return grades.filter(record => record.classId === classId && record.assignmentId === assignmentId);
  },
  
  // Create or update assignment grades for a class
  createAssignmentGrades: (assignmentGrades) => {
    const grades = readDbFile(dbFiles.grades);
    
    // Check if assignment record already exists
    const existingIndex = grades.findIndex(
      record => record.classId === assignmentGrades.classId && 
                record.assignmentId === assignmentGrades.assignmentId
    );
    
    if (existingIndex !== -1) {
      // Update existing record
      grades[existingIndex] = {
        ...grades[existingIndex],
        ...assignmentGrades,
        updated_at: new Date().toISOString()
      };
    } else {
      // Add new record
      grades.push({
        ...assignmentGrades,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    if (writeDbFile(dbFiles.grades, grades)) {
      return { success: true, changes: 1 };
    }
    return { success: false, changes: 0 };
  },
  
  // Update student grade for an assignment
  updateStudentGrade: (classId, assignmentId, studentId, grade, feedback) => {
    const grades = readDbFile(dbFiles.grades);
    
    // Find the assignment record
    const recordIndex = grades.findIndex(
      record => record.classId === classId && record.assignmentId === assignmentId
    );
    
    if (recordIndex === -1) {
      return { success: false, message: 'Assignment record not found' };
    }
    
    // Find the student in the grades record
    const studentIndex = grades[recordIndex].students.findIndex(
      student => student.studentId === studentId
    );
    
    if (studentIndex === -1) {
      return { success: false, message: 'Student not found in assignment record' };
    }
    
    // Update the student's grade
    grades[recordIndex].students[studentIndex].grade = grade;
    grades[recordIndex].students[studentIndex].feedback = feedback;
    grades[recordIndex].updated_at = new Date().toISOString();
    
    if (writeDbFile(dbFiles.grades, grades)) {
      return { success: true, changes: 1 };
    }
    return { success: false, changes: 0 };
  },
  
  // Create a new assignment
  createAssignment: (classId, assignment) => {
    const grades = readDbFile(dbFiles.grades);
    
    // Generate a unique assignment ID if not provided
    if (!assignment.id) {
      // Find the highest assignment ID for this class
      const classAssignments = grades.filter(record => record.classId === classId);
      let maxId = 0;
      
      classAssignments.forEach(record => {
        const idNum = parseInt(record.assignmentId.replace(`${classId}-A`, ''));
        if (!isNaN(idNum) && idNum > maxId) {
          maxId = idNum;
        }
      });
      
      // Create new ID
      assignment.id = `${classId}-A${String(maxId + 1).padStart(3, '0')}`;
    }
    
    // Create new assignment record with empty student grades
    const newAssignment = {
      classId,
      assignmentId: assignment.id,
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      maxScore: assignment.maxScore,
      dueDate: assignment.dueDate,
      students: assignment.students || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    grades.push(newAssignment);
    
    if (writeDbFile(dbFiles.grades, grades)) {
      return { success: true, assignmentId: assignment.id, changes: 1 };
    }
    return { success: false, changes: 0 };
  },
  
  // Delete an assignment
  deleteAssignment: (assignmentId) => {
    const grades = readDbFile(dbFiles.grades);
    const initialLength = grades.length;
    const filteredGrades = grades.filter(record => record.assignmentId !== assignmentId);
    
    if (filteredGrades.length < initialLength) {
      if (writeDbFile(dbFiles.grades, filteredGrades)) {
        return { success: true, changes: 1 };
      }
    }
    
    return { success: false, changes: 0 };
  },
  
  // Get student's overall grade for a class
  getStudentClassGrade: (classId, studentId) => {
    const grades = readDbFile(dbFiles.grades);
    const classAssignments = grades.filter(record => record.classId === classId);
    
    if (classAssignments.length === 0) {
      return { average: 0, assignments: [] };
    }
    
    let totalPoints = 0;
    let totalMaxPoints = 0;
    const assignmentGrades = [];
    
    classAssignments.forEach(assignment => {
      const studentGrade = assignment.students.find(s => s.studentId === studentId);
      
      if (studentGrade && studentGrade.grade !== undefined) {
        totalPoints += parseFloat(studentGrade.grade);
        totalMaxPoints += parseFloat(assignment.maxScore);
        
        assignmentGrades.push({
          assignmentId: assignment.assignmentId,
          title: assignment.title,
          grade: studentGrade.grade,
          maxScore: assignment.maxScore,
          percentage: (studentGrade.grade / assignment.maxScore) * 100
        });
      }
    });
    
    const average = totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0;
    
    return {
      average: parseFloat(average.toFixed(2)),
      assignments: assignmentGrades
    };
  }
};

// User authentication operations
const usersDb = {
  // Find user by username and password
  authenticate: (username, password) => {
    const users = readDbFile(dbFiles.users);
    return users.find(user => user.username === username && user.password === password);
  },
  
  // Update user's last login time
  updateLastLogin: (id) => {
    const users = readDbFile(dbFiles.users);
    const index = users.findIndex(user => user.id === id);
    
    if (index !== -1) {
      users[index].last_login = new Date().toISOString();
      writeDbFile(dbFiles.users, users);
    }
  },
  
  // Update user information
  update: (id, userData) => {
    const users = readDbFile(dbFiles.users);
    const index = users.findIndex(user => user.id === id);
    
    if (index !== -1) {
      // Update user data
      users[index] = {
        ...users[index],
        ...userData,
        updated_at: new Date().toISOString()
      };
      
      if (writeDbFile(dbFiles.users, users)) {
        return { success: true, changes: 1 };
      }
    }
    
    return { success: false, changes: 0 };
  }
};

// Settings CRUD operations
const settingsDb = {
  // Get all settings
  getAll: () => {
    return readDbFile(dbFiles.settings);
  },
  
  // Get a specific setting
  get: (key) => {
    const settings = readDbFile(dbFiles.settings);
    return settings[key];
  },
  
  // Update a setting
  update: (key, value) => {
    const settings = readDbFile(dbFiles.settings);
    settings[key] = value;
    if (writeDbFile(dbFiles.settings, settings)) {
      return { success: true, changes: 1 };
    }
    return { success: false, changes: 0 };
  },
  
  // Save all settings
  save: (settings) => {
    if (writeDbFile(dbFiles.settings, settings)) {
      return { success: true, changes: 1 };
    }
    return { success: false, changes: 0 };
  }
};

// Qualifications CRUD operations
const qualificationsDb = {
  // Get all qualifications
  getAll: () => {
    return readDbFile(dbFiles.qualifications);
  },
  
  // Get qualification by ID
  getById: (id) => {
    const qualifications = readDbFile(dbFiles.qualifications);
    return qualifications.find(qualification => qualification.id === id);
  },
  
  // Create a new qualification
  create: (qualification) => {
    const qualifications = readDbFile(dbFiles.qualifications);
    
    // Generate a new ID if not provided
    if (!qualification.id) {
      const lastId = qualifications.length > 0 
        ? Math.max(...qualifications.map(q => parseInt(q.id.substring(1)) || 0)) 
        : 0;
      qualification.id = `q${String(lastId + 1).padStart(3, '0')}`;
    }
    
    qualifications.push(qualification);
    if (writeDbFile(dbFiles.qualifications, qualifications)) {
      return { id: qualification.id, changes: 1 };
    }
    return { id: qualification.id, changes: 0 };
  },
  
  // Update a qualification
  update: (id, qualificationData) => {
    const qualifications = readDbFile(dbFiles.qualifications);
    const index = qualifications.findIndex(qualification => qualification.id === id);
    
    if (index !== -1) {
      qualifications[index] = { ...qualifications[index], ...qualificationData };
      if (writeDbFile(dbFiles.qualifications, qualifications)) {
        return { id, changes: 1 };
      }
    }
    
    return { id, changes: 0 };
  },
  
  // Delete a qualification
  delete: (id) => {
    const qualifications = readDbFile(dbFiles.qualifications);
    const initialLength = qualifications.length;
    const filteredQualifications = qualifications.filter(qualification => qualification.id !== id);
    
    if (filteredQualifications.length < initialLength) {
      if (writeDbFile(dbFiles.qualifications, filteredQualifications)) {
        return { id, changes: 1 };
      }
    }
    
    return { id, changes: 0 };
  }
};

// Database CRUD operations for Fees
const feesDb = {
  // Get all fees
  getAll: () => {
    return readDbFile(dbFiles.fees);
  },
  
  // Get fees by student ID
  getByStudentId: (studentId) => {
    const fees = readDbFile(dbFiles.fees);
    return fees.filter(fee => fee.studentId === studentId);
  },
  
  // Get fees by month and year
  getByMonthYear: (month, year) => {
    const fees = readDbFile(dbFiles.fees);
    return fees.filter(fee => fee.month === month && fee.year === year);
  },
  
  // Get fees by status
  getByStatus: (status) => {
    const fees = readDbFile(dbFiles.fees);
    return fees.filter(fee => fee.status === status);
  },
  
  // Create a new fee record
  create: (feeData) => {
    const fees = readDbFile(dbFiles.fees);
    
    // Generate a unique ID for the fee record
    const lastId = fees.length > 0 
      ? Math.max(...fees.map(f => parseInt(f.id.substring(1)) || 0)) 
      : 0;
    const newId = `F${String(lastId + 1).padStart(4, '0')}`;
    
    // Add metadata
    feeData.id = newId;
    feeData.created_at = new Date().toISOString();
    feeData.updated_at = new Date().toISOString();
    
    fees.push(feeData);
    
    if (writeDbFile(dbFiles.fees, fees)) {
      return { id: newId, changes: 1 };
    }
    return { id: newId, changes: 0 };
  },
  
  // Update a fee record
  update: (id, feeData) => {
    const fees = readDbFile(dbFiles.fees);
    const index = fees.findIndex(fee => fee.id === id);
    
    if (index !== -1) {
      fees[index] = { ...fees[index], ...feeData, updated_at: new Date().toISOString() };
      if (writeDbFile(dbFiles.fees, fees)) {
        return { id, changes: 1 };
      }
    }
    
    return { id, changes: 0 };
  },
  
  // Delete a fee record
  delete: (id) => {
    const fees = readDbFile(dbFiles.fees);
    const initialLength = fees.length;
    const filteredFees = fees.filter(fee => fee.id !== id);
    
    if (filteredFees.length < initialLength) {
      if (writeDbFile(dbFiles.fees, filteredFees)) {
        return { id, changes: 1 };
      }
    }
    
    return { id, changes: 0 };
  },
  
  // Get fee summary statistics
  getSummary: () => {
    const fees = readDbFile(dbFiles.fees);
    
    let totalAmount = 0;
    let collectedAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;
    
    fees.forEach(fee => {
      const netAmount = fee.amount - (fee.amount * fee.discount / 100);
      
      totalAmount += netAmount;
      
      if (fee.status === 'Paid') {
        collectedAmount += netAmount;
      } else if (fee.status === 'Pending') {
        pendingAmount += netAmount;
      } else if (fee.status === 'Overdue') {
        overdueAmount += netAmount;
      }
    });
    
    return {
      totalAmount,
      collectedAmount,
      pendingAmount,
      overdueAmount
    };
  }
};

// Backup and restore operations
const backupDb = {
  // Create a backup of all data
  create: () => {
    try {
      // Collect all data
      const backup = {
        students: readDbFile(dbFiles.students),
        teachers: readDbFile(dbFiles.teachers),
        classes: readDbFile(dbFiles.classes),
        attendance: readDbFile(dbFiles.attendance),
        grades: readDbFile(dbFiles.grades),
        settings: readDbFile(dbFiles.settings),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      return { success: true, data: backup };
    } catch (error) {
      console.error('Error creating backup:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Restore data from a backup file
  restore: (backupFile) => {
    try {
      // Check if backup file exists
      if (!fs.existsSync(backupFile)) {
        return { success: false, error: 'Backup file not found' };
      }
      
      // Read backup file
      const backupData = fs.readFileSync(backupFile, 'utf8');
      const backup = JSON.parse(backupData);
      
      // Validate backup data
      if (!backup.students || !backup.teachers || !backup.classes || 
          !backup.attendance || !backup.grades || !backup.settings) {
        return { success: false, error: 'Invalid backup file format' };
      }
      
      // Restore each data file
      writeDbFile(dbFiles.students, backup.students);
      writeDbFile(dbFiles.teachers, backup.teachers);
      writeDbFile(dbFiles.classes, backup.classes);
      writeDbFile(dbFiles.attendance, backup.attendance);
      writeDbFile(dbFiles.grades, backup.grades);
      writeDbFile(dbFiles.settings, backup.settings);
      
      return { success: true };
    } catch (error) {
      console.error('Error restoring backup:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Reset all data to default
  reset: () => {
    try {
      // Reset students
      writeDbFile(dbFiles.students, []);
      
      // Reset teachers
      writeDbFile(dbFiles.teachers, []);
      
      // Reset classes
      writeDbFile(dbFiles.classes, []);
      
      // Reset attendance
      writeDbFile(dbFiles.attendance, []);
      
      // Reset grades
      writeDbFile(dbFiles.grades, []);
      
      // Reset settings to default
      const defaultSettings = {
        schoolInfo: {
          name: 'SchoolSync Academy',
          address: '',
          phone: '',
          email: '',
          website: '',
          principal: '',
          logo: 'assets/default-logo.png'
        },
        preferences: {
          theme: 'light',
          dateFormat: 'MM/DD/YYYY',
          language: 'en',
          autoBackup: false
        }
      };
      writeDbFile(dbFiles.settings, defaultSettings);
      
      // Reset users except admin
      const users = readDbFile(dbFiles.users);
      const adminUser = users.find(user => user.username === 'admin');
      if (adminUser) {
        writeDbFile(dbFiles.users, [adminUser]);
      } else {
        // If admin user is not found, create a new one
        const defaultUsers = [
          {
            id: 1,
            username: 'admin',
            password: 'admin123',
            role: 'administrator',
            name: 'System Administrator',
            email: 'admin@schoolsync.com',
            created_at: new Date().toISOString(),
            last_login: null
          }
        ];
        writeDbFile(dbFiles.users, defaultUsers);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting data:', error);
      return { success: false, error: error.message };
    }
  }
};

// Export the database operations
module.exports = {
  students: studentsDb,
  teachers: teachersDb,
  classes: classesDb,
  attendance: attendanceDb,
  grades: gradesDb,
  users: usersDb,
  settings: settingsDb,
  qualifications: qualificationsDb,
  fees: feesDb,
  backup: backupDb,
  
  // Close function (no-op for file-based storage)
  close: () => {
    console.log('Database connections closed.');
    return true;
  }
}; 