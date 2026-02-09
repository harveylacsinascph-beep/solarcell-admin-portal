# SolarCell PH Admin Backend

A simple Node.js + Express + SQLite backend for the SolarCell PH admin portal.

## Setup Instructions

### 1. Install Node.js (if you haven't already)
Download from https://nodejs.org/ (LTS version recommended)

### 2. Navigate to backend folder
```bash
cd "C:\Users\interns\Downloads\IT intern Folder\backend"
```

### 3. Install dependencies
```bash
npm install
```

This will install:
- **express** (web framework)
- **sqlite3** (database)
- **cors** (allow frontend to connect)
- **body-parser** (parse JSON requests)

### 4. Start the server
```bash
npm start
```

You should see:
```
🚀 Server running at http://localhost:3000
📊 Database: database.db
```

## API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance
- `GET /api/attendance` - Get all attendance records
- `POST /api/attendance` - Record time in
- `PUT /api/attendance/:id` - Record time out

### Leave Requests
- `GET /api/leave-requests` - Get all leave requests
- `POST /api/leave-requests` - Create leave request
- `PUT /api/leave-requests/:id` - Update status (Approve/Deny)

### Tap Logs
- `GET /api/tap-logs` - Get tap login logs
- `POST /api/tap-logs` - Record new tap

### Schedule Events
- `GET /api/schedule-events` - Get all events
- `POST /api/schedule-events` - Create event
- `DELETE /api/schedule-events/:id` - Delete event

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement

## Testing the API

You can test endpoints using:
1. **Postman** - GUI tool (download from postman.com)
2. **cURL** - Command line
3. **Your HTML forms** - Frontend integration

Example with cURL:
```bash
curl http://localhost:3000/api/employees
```

## Database

The database (`database.db`) is automatically created when you start the server.

Tables:
- `employees` - Employee records
- `attendance` - Time in/out logs
- `leave_requests` - Leave applications
- `tap_logs` - Barcode scan logs
- `schedule_events` - Calendar events
- `announcements` - Admin announcements

## Troubleshooting

**Port 3000 already in use?**
Edit `server.js` and change `const PORT = 3000;` to another number like `3001`

**Missing dependencies?**
Run `npm install` again

**Database errors?**
Delete `database.db` and restart the server to recreate it fresh
