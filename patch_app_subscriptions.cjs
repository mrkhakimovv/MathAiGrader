const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const unsubscribeHistory = subscribeToHistory\(\(newHistory\) => \{[\s\S]*?\}, \[\]\);/m, 
`  }, []);

  useEffect(() => {
    if (!currentUser) return; // Only fetch data if logged in
    const unsubscribeHistory = subscribeToHistory((newHistory) => {
      setHistory(newHistory);
    });
    const unsubscribeStudents = subscribeToCollection("students", (newStudents) => {
      setStudents(newStudents);
    });
    const unsubscribeGroups = subscribeToCollection("groups", (newGroups) => {
      setGroupDetails(newGroups);
      setGroups(newGroups.map(g => g.name));
    });
    const unsubscribeTasks = subscribeToCollection("tasks", (newTasks) => {
      setTasks(newTasks);
    });
    const unsubscribeTeachers = subscribeToCollection("teachers", (newTeachers) => {
      setTeachers(newTeachers);
    });
    return () => {
      unsubscribeHistory();
      unsubscribeStudents();
      unsubscribeGroups();
      unsubscribeTasks();
      unsubscribeTeachers();
    };
  }, [currentUser]);`);

// And modify handleLogin to query teachers
code = code.replace(/const teacher = teachers.find\(t => t.username === username\);[\s\S]*?return false;\n    }/m, 
`    try {
      const qTeacher = query(collection(db, "teachers"), where("username", "==", username), where("password", "==", pass));
      const snapshotTeacher = await getDocs(qTeacher);
      if (!snapshotTeacher.empty) {
        setCurrentUser(username);
        setRole('teacher');
        localStorage.setItem("almath_user", JSON.stringify({ username, role: 'teacher' }));
        return true;
      }
    } catch(e) { console.error(e); }`);

fs.writeFileSync('src/App.tsx', code);
