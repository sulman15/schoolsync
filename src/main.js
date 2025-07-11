const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const database = require('./database');

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
      result = database.students.update(student.id, student);
    }
    
    event.sender.send('saveStudentResponse', { success: true, student: result });
  } catch (error) {
    console.error('Error saving student:', error);
    event.sender.send('saveStudentResponse', { success: false, error: error.message });
  }
});

// Clean up resources when app is about to quit
app.on('before-quit', () => {
  // Close the database connection (no-op for JSON files)
  database.close();
});
