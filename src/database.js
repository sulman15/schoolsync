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
  grades: path.join(userDataPath, 'grades.json')
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
  }
};

// Export the database operations
module.exports = {
  students: studentsDb,
  teachers: teachersDb,
  classes: classesDb,
  attendance: attendanceDb,
  users: usersDb,
  
  // Close function (no-op for file-based storage)
  close: () => {
    console.log('Database connections closed.');
    return true;
  }
}; 