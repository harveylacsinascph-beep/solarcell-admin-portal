# Quick Start Guide - Backend Setup

## Step 1: Install Node.js
1. Go to https://nodejs.org/
2. Download LTS version
3. Run installer and follow steps
4. Verify installation:
   ```
   node --version
   npm --version
   ```

## Step 2: Install Dependencies
Open Command Prompt in the backend folder:
```
cd "C:\Users\interns\Downloads\IT intern Folder\backend"
npm install
```

Wait for it to finish (it will create a `node_modules` folder)

## Step 3: Start the Server
```
npm start
```

You should see:
```
🚀 Server running at http://localhost:3000
📊 Database: database.db
```

**Don't close this window!** Keep it running while you use the app.

## Step 4: Connect Frontend

Add this line to the top of your HTML files (before other scripts):
```html
<script src="api-config.js"></script>
```

Now you can use the API functions in your JavaScript:
```javascript
// Example: Get all employees
employeeAPI.getAll().then(employees => {
  console.log(employees);
});

// Example: Create employee
employeeAPI.create({
  barcode: 'SCPH20250120',
  name: 'John Doe',
  phone: '09123456789',
  address: 'Manila',
  position: 'Developer',
  department: 'Engineering',
  employed_date: '2025-01-20'
}).then(result => {
  console.log(result);
});
```

## Testing

Open browser and go to:
- http://localhost:3000/api/employees
- http://localhost:3000/api/attendance
- http://localhost:3000/api/leave-requests

You should see JSON data (empty arrays initially).

## Troubleshooting

**Port already in use?**
- Edit `backend/server.js`
- Change `const PORT = 3000;` to `3001` or another number
- Restart server

**npm command not found?**
- Restart Command Prompt after installing Node.js
- Or restart your computer

**Database errors?**
- Delete `backend/database.db`
- Restart server

## Next Steps

1. Update your HTML forms to use the API functions
2. Add success/error messages to forms
3. Load tables dynamically from the API
4. Test on your local machine first
