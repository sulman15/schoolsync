# SchoolSync

A comprehensive School Management System built with Electron for cross-platform desktop use.

## Features

- **Student Management**: Track student information, grades, attendance, and more
- **Teacher Management**: Manage faculty information and assignments
- **Class Management**: Organize classes, schedules, and student enrollments
- **Attendance Tracking**: Record and report on student attendance
- **Grade Management**: Input, calculate, and report on student grades
- **User Authentication**: Secure login system with role-based access control

## System Requirements

- Windows 7 or later
- 4GB RAM (8GB recommended)
- 500MB free disk space

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- npm (included with Node.js)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/schoolsync.git
   cd schoolsync
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the application:
   ```
   npm start
   ```

### Building for Windows

To build the application for Windows:

```
npm run build
```

This will generate installers in the `dist` folder.

## Usage

After installation, launch SchoolSync from your applications menu or desktop shortcut.

Default login credentials:
- Username: admin
- Password: admin123

**Important:** Change the default password after first login.

## Database

SchoolSync uses SQLite for data storage. The database file is located at:

- Windows: `%APPDATA%\SchoolSync\schoolsync.db`
- macOS: `~/Library/Application Support/SchoolSync/schoolsync.db`
- Linux: `~/.config/SchoolSync/schoolsync.db`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or feature requests, please open an issue on the GitHub repository.