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
  users: usersDb,
  
  // Close function (no-op for file-based storage)
  close: () => {
    console.log('Database connections closed.');
    return true;
  }
}; 