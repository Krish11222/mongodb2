import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- In-memory "database" ----------------
let students = [
  { _id: "1", name: "Alice Johnson", age: 20, course: "Computer Science" },
  { _id: "2", name: "Bob Smith", age: 22, course: "Mechanical Engineering" },
  { _id: "3", name: "Charlie Lee", age: 19, course: "Business Administration" },
];

// ---------------- CRUD API Routes ----------------

// ✅ READ all students
app.get("/students", (req, res) => {
  res.status(200).json(students);
});

// ✅ CREATE new student
app.post("/students", (req, res) => {
  const { name, age, course } = req.body;
  const newStudent = {
    _id: Date.now().toString(),
    name,
    age,
    course,
  };
  students.push(newStudent);
  res.status(201).json({ message: "Student added", student: newStudent });
});

// ✅ UPDATE a student by ID
app.put("/students/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, course } = req.body;
  const student = students.find((s) => s._id === id);
  if (!student) return res.status(404).json({ message: "Student not found" });

  student.name = name || student.name;
  student.age = age || student.age;
  student.course = course || student.course;

  res.json({ message: "Student updated", student });
});

// ✅ DELETE a student by ID
app.delete("/students/:id", (req, res) => {
  const { id } = req.params;
  const student = students.find((s) => s._id === id);
  if (!student) return res.status(404).json({ message: "Student not found" });

  students = students.filter((s) => s._id !== id);
  res.json({ message: "Student deleted", student });
});

// ---------------- Frontend (HTML + CSS + JS) ----------------
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Student Management System</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f5f6fa; margin: 0; padding: 20px; text-align: center; }
      h1 { color: #2c3e50; }
      table { width: 80%; margin: 20px auto; border-collapse: collapse; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
      th, td { padding: 12px; border: 1px solid #ddd; }
      th { background-color: #2980b9; color: white; }
      tr:nth-child(even) { background-color: #f2f2f2; }
      input { padding: 8px; margin: 5px; }
      button { padding: 8px 12px; margin: 5px; border: none; cursor: pointer; border-radius: 4px; }
      button.add { background-color: #27ae60; color: white; }
      button.delete { background-color: #c0392b; color: white; }
    </style>
  </head>
  <body>
    <h1>Student Management System</h1>

    <div>
      <input id="name" placeholder="Name" />
      <input id="age" placeholder="Age" type="number" />
      <input id="course" placeholder="Course" />
      <button class="add" onclick="addStudent()">Add Student</button>
    </div>

    <table id="studentTable">
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Age</th><th>Course</th><th>Action</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>

    <script>
      const baseUrl = window.location.origin;

      async function fetchStudents() {
        const res = await fetch(baseUrl + '/students');
        const data = await res.json();
        const tbody = document.querySelector('#studentTable tbody');
        tbody.innerHTML = '';
        data.forEach(s => {
          tbody.innerHTML += \`
            <tr>
              <td>\${s._id}</td>
              <td>\${s.name}</td>
              <td>\${s.age}</td>
              <td>\${s.course}</td>
              <td><button class="delete" onclick="deleteStudent('\${s._id}')">Delete</button></td>
            </tr>\`;
        });
      }

      async function addStudent() {
        const name = document.getElementById('name').value;
        const age = parseInt(document.getElementById('age').value);
        const course = document.getElementById('course').value;
        if(!name || !age || !course) return alert('Please fill all fields');
        await fetch(baseUrl + '/students', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ name, age, course })
        });
        fetchStudents();
      }

      async function deleteStudent(id) {
        await fetch(baseUrl + '/students/' + id, { method: 'DELETE' });
        fetchStudents();
      }

      fetchStudents();
    </script>
  </body>
  </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
