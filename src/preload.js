const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    send: (channel, data) => {
      // whitelist channels
      let validChannels = [
        'login', 
        'getStudents', 
        'getStudent', 
        'saveStudent', 
        'deleteStudent', 
        'getTeachers', 
        'getTeacher',
        'saveTeacher', 
        'deleteTeacher',
        'getClasses', 
        'getClass',
        'saveClass',
        'deleteClass',
        'getStudentsInClass'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = [
        'loginResponse', 
        'studentsData', 
        'getStudentResponse', 
        'saveStudentResponse', 
        'deleteStudentResponse', 
        'teachersData',
        'getTeacherResponse',
        'saveTeacherResponse',
        'deleteTeacherResponse',
        'classesData',
        'getClassResponse',
        'saveClassResponse',
        'deleteClassResponse',
        'studentsInClassResponse'
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
); 