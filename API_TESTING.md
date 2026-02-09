# API Testing Examples

## Using cURL (Command Line)

Open Command Prompt and run these commands to test the API:

### Get All Employees
```
curl http://localhost:3000/api/employees
```

### Create an Employee
```
curl -X POST http://localhost:3000/api/employees ^
  -H "Content-Type: application/json" ^
  -d "{\"barcode\":\"SCPH20250120\",\"name\":\"John Doe\",\"phone\":\"09123456789\",\"address\":\"Manila\",\"position\":\"Developer\",\"department\":\"Engineering\",\"employed_date\":\"2025-01-20\"}"
```

### Get Single Employee
```
curl http://localhost:3000/api/employees/1
```

### Update Employee
```
curl -X PUT http://localhost:3000/api/employees/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Jane Doe\",\"position\":\"Senior Developer\"}"
```

### Delete Employee
```
curl -X DELETE http://localhost:3000/api/employees/1
```

### Get Attendance Records
```
curl http://localhost:3000/api/attendance
```

### Record Time In
```
curl -X POST http://localhost:3000/api/attendance ^
  -H "Content-Type: application/json" ^
  -d "{\"employee_id\":1,\"date\":\"2025-01-20\",\"time_in\":\"08:00:00\"}"
```

### Get Leave Requests
```
curl http://localhost:3000/api/leave-requests
```

### Create Leave Request
```
curl -X POST http://localhost:3000/api/leave-requests ^
  -H "Content-Type: application/json" ^
  -d "{\"employee_id\":1,\"start_date\":\"2025-02-01\",\"end_date\":\"2025-02-05\",\"leave_type\":\"Vacation\",\"reason\":\"Family trip\"}"
```

### Update Leave Status
```
curl -X PUT http://localhost:3000/api/leave-requests/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"Approved\"}"
```

### Get Tap Logs
```
curl http://localhost:3000/api/tap-logs
```

### Record Tap
```
curl -X POST http://localhost:3000/api/tap-logs ^
  -H "Content-Type: application/json" ^
  -d "{\"barcode\":\"SCPH20250120\"}"
```

## Using Postman (GUI)

1. Download Postman from https://www.postman.com/downloads/
2. Open Postman
3. Create a new Request
4. Set method (GET, POST, PUT, DELETE)
5. Enter URL: `http://localhost:3000/api/employees`
6. For POST/PUT, go to Body tab, select JSON, and paste your data
7. Click Send

## JavaScript in Browser Console

```javascript
// Get all employees
fetch('http://localhost:3000/api/employees')
  .then(r => r.json())
  .then(data => console.log(data))

// Create employee
fetch('http://localhost:3000/api/employees', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    barcode: 'SCPH20250120',
    name: 'John Doe',
    phone: '09123456789',
    position: 'Developer',
    department: 'Engineering',
    employed_date: '2025-01-20'
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

## Notes

- Make sure backend is running: `npm start`
- Server is on `http://localhost:3000`
- All dates should be: `YYYY-MM-DD`
- All times should be: `HH:MM:SS`
- Worked hours as decimal: `8.5` not `8:30`
