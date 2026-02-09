# 🎉 Complete SolarCell PH Admin Portal - Backend Setup

## ✅ What's Been Created

### Backend Files (in `backend/` folder)
1. **server.js** - Express server with all API endpoints
2. **database.js** - SQLite database initialization and schema
3. **package.json** - Dependencies (express, sqlite3, cors, body-parser)
4. **.gitignore** - Ignore node_modules and database.db

### Frontend Integration
1. **api-config.js** - Helper functions to call the backend API from your HTML
2. **add-employee.html** - UPDATED with API integration (working example!)

### Documentation
1. **BACKEND_SETUP.md** - Step-by-step setup instructions
2. **backend/README.md** - Complete API documentation
3. **API_TESTING.md** - Examples of how to test the API
4. **BACKEND_COMPLETE.md** - Overview and next steps

## 🚀 How to Get Started (5 Minutes)

### Step 1: Install Node.js
- Go to https://nodejs.org/
- Download LTS version
- Install it and restart your Command Prompt

### Step 2: Install Backend Dependencies
```bash
cd "C:\Users\interns\Downloads\IT intern Folder\backend"
npm install
```
This will create a `node_modules` folder (takes 1-2 minutes)

### Step 3: Start the Server
```bash
npm start
```

You should see:
```
🚀 Server running at http://localhost:3000
📊 Database: database.db
```

**Keep this window open!**

### Step 4: Test It
Open your browser and go to:
```
http://localhost:3000/api/employees
```

You should see: `[]` (empty array)

### Step 5: Try the Form
1. Open `add-employee.html` in your browser
2. Fill in the form
3. Click Submit
4. Check the browser console for success message
5. Go back to http://localhost:3000/api/employees
6. You should see your new employee!

## 📊 Database Tables Created

- **employees** - Employee records
- **attendance** - Time in/out logs  
- **leave_requests** - Leave applications
- **tap_logs** - Barcode scan logs
- **schedule_events** - Calendar events
- **announcements** - Admin announcements

## 🔌 API Endpoints Available

### Employees
- `GET /api/employees` - Get all
- `GET /api/employees/:id` - Get one
- `POST /api/employees` - Create
- `PUT /api/employees/:id` - Update
- `DELETE /api/employees/:id` - Delete

### Attendance
- `GET /api/attendance` - Get all
- `POST /api/attendance` - Record time in
- `PUT /api/attendance/:id` - Record time out

### Leave Requests
- `GET /api/leave-requests` - Get all
- `POST /api/leave-requests` - Create request
- `PUT /api/leave-requests/:id` - Update status

### Tap Logs
- `GET /api/tap-logs` - Get all logs
- `POST /api/tap-logs` - Record new tap

### Schedule Events
- `GET /api/schedule-events` - Get all
- `POST /api/schedule-events` - Create event
- `DELETE /api/schedule-events/:id` - Delete event

### Announcements
- `GET /api/announcements` - Get all
- `POST /api/announcements` - Create announcement

## 💡 How to Use the API in Your HTML

1. Add this to the `<head>` of your HTML files:
```html
<script src="api-config.js"></script>
```

2. Use the API in your JavaScript:
```javascript
// Get all employees
const employees = await employeeAPI.getAll();

// Create employee
await employeeAPI.create({
  barcode: 'SCPH20250120',
  name: 'John Doe',
  phone: '09123456789',
  position: 'Developer',
  department: 'Engineering',
  employed_date: '2025-01-20'
});

// Update status
await leaveAPI.updateStatus(1, 'Approved');
```

## 📁 File Structure

```
IT intern Folder/
├── add-employee.html          ✅ (Updated with API)
├── attendance.html            (Ready to integrate)
├── Dashboard.html             (Ready to integrate)
├── employee.html              (Ready to integrate)
├── id.html                    (Ready to integrate)
├── leave.html                 (Ready to integrate)
├── login.html                 (Ready to integrate)
├── manage-employee.html       (Ready to integrate)
├── no-show.html               (Ready to integrate)
├── schedule.html              (Ready to integrate)
│
├── api-config.js              ✅ NEW
├── BACKEND_SETUP.md           ✅ NEW
├── BACKEND_COMPLETE.md        ✅ NEW
├── API_TESTING.md             ✅ NEW
│
└── backend/                   ✅ NEW
    ├── server.js              ✅ NEW
    ├── database.js            ✅ NEW
    ├── package.json           ✅ NEW
    ├── .gitignore             ✅ NEW
    ├── README.md              ✅ NEW
    ├── database.db            (Auto-created)
    └── node_modules/          (Auto-created)
```

## 🎯 Next Steps to Connect All Pages

The backend is ready! You can now:

1. **Update employee.html** - Load employee list from API
2. **Update attendance.html** - Show real attendance data
3. **Update leave.html** - Use API to approve/deny leaves
4. **Update Dashboard** - Load stats from API
5. **Update Tap Login** - Save scans to database

Each page would add `api-config.js` script and use the API functions.

## ⚠️ Troubleshooting

**npm command not found?**
- Restart Command Prompt after installing Node.js

**Port 3000 already in use?**
- Edit `backend/server.js`
- Change `const PORT = 3000;` to `3001`

**Database errors?**
- Delete `backend/database.db`
- Restart server

**API not connecting?**
- Make sure backend is running (`npm start`)
- Check console for errors
- Verify `api-config.js` is in HTML
- Check port 3000 is accessible

## 📞 Support

- **BACKEND_SETUP.md** - Step-by-step setup
- **backend/README.md** - Full API documentation
- **API_TESTING.md** - How to test endpoints

You now have a fully functional backend! 🎊
