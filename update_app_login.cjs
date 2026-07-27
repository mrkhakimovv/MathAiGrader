const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newImports = `import { doc, deleteDoc, getDocs, query, where, collection } from "firebase/firestore";`;
code = code.replace(`import { doc, deleteDoc } from "firebase/firestore";`, newImports);

const newLoginLogic = `  const handleLogin = async (username: string, pass: string) => {
    if (username === 'admin') {
      if (pass === '7788') {
        setCurrentUser('admin');
        setRole('admin');
        return true;
      }
      return false;
    }
    
    const teacher = teachers.find(t => t.username === username);
    if (teacher) {
      if (teacher.password === pass) {
        setCurrentUser(username);
        setRole('teacher');
        return true;
      }
      return false;
    }

    // Check if it's a student
    try {
      const q = query(collection(db, "students"), where("username", "==", username), where("password", "==", pass));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const studentDoc = snapshot.docs[0];
        const studentData = studentDoc.data();
        const userToStore = {
          id: studentDoc.id,
          username: studentData.username,
          role: 'student',
          ...studentData
        };
        localStorage.setItem("math_grader_user", JSON.stringify(userToStore));
        setCurrentUser(studentData.username);
        setRole('student');
        return true;
      }
    } catch (err) {
      console.error("Login error:", err);
    }

    return false;
  };`;

code = code.replace(
  /const handleLogin = \(username: string, pass: string\) => {[\s\S]*?return true;\s*};/,
  newLoginLogic
);

fs.writeFileSync('src/App.tsx', code);
