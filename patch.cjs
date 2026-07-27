const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'import { saveResult, subscribeToHistory } from "./lib/db";',
  'import { saveResult, subscribeToHistory, subscribeToCollection, saveToCollection } from "./lib/db";\nimport { doc, deleteDoc } from "firebase/firestore";\nimport { db } from "./lib/firebase";'
);

code = code.replace(
  '  useEffect(() => {\n    const unsubscribe = subscribeToHistory((newHistory) => {\n      setHistory(newHistory);\n    });\n    return () => unsubscribe();\n  }, []);',
  '  useEffect(() => {\n    const unsubscribeHistory = subscribeToHistory((newHistory) => {\n      setHistory(newHistory);\n    });\n    const unsubscribeStudents = subscribeToCollection("students", (newStudents) => {\n      setStudents(newStudents);\n    });\n    const unsubscribeGroups = subscribeToCollection("groups", (newGroups) => {\n      setGroupDetails(newGroups);\n      setGroups(newGroups.map(g => g.name));\n    });\n    return () => {\n      unsubscribeHistory();\n      unsubscribeStudents();\n      unsubscribeGroups();\n    };\n  }, []);'
);

code = code.replace(
  '        onAddStudent={(student) => {\n          setStudents(prev => [...prev, student]);\n          alert(`${student.firstName} muvaffaqiyatli qo\'shildi!`);\n        }}',
  '        onAddStudent={async (student) => {\n          await saveToCollection("students", student);\n          alert(`${student.firstName} muvaffaqiyatli qo\'shildi!`);\n        }}'
);

code = code.replace(
  '        onAddGroup={(group) => {\n          setGroups(prev => [...prev, group.name]);\n          setGroupDetails(prev => [...prev, group]);\n          alert(`"${group.name}" guruhi muvaffaqiyatli yaratildi!`);\n        }}',
  '        onAddGroup={async (group) => {\n          await saveToCollection("groups", group);\n          alert(`"${group.name}" guruhi muvaffaqiyatli yaratildi!`);\n        }}'
);

code = code.replace(
  '             onDeleteStudent={(index) => {\n              const updatedStudents = [...students];\n              updatedStudents.splice(index, 1);\n              setStudents(updatedStudents);\n            }}',
  '             onDeleteStudent={async (index) => {\n              const student = students[index];\n              if (student && student.id) {\n                await deleteDoc(doc(db, "students", student.id));\n              } else {\n                const updatedStudents = [...students];\n                updatedStudents.splice(index, 1);\n                setStudents(updatedStudents);\n              }\n            }}'
);

code = code.replace(
  '             onDeleteGroup={(index) => {\n              const updatedGroups = [...groupDetails];\n              const groupName = updatedGroups[index].name;\n              updatedGroups.splice(index, 1);\n              setGroupDetails(updatedGroups);\n              setGroups(groups.filter(g => g !== groupName));\n            }}',
  '             onDeleteGroup={async (index) => {\n              const group = groupDetails[index];\n              if (group && group.id) {\n                await deleteDoc(doc(db, "groups", group.id));\n              } else {\n                const updatedGroups = [...groupDetails];\n                const groupName = updatedGroups[index].name;\n                updatedGroups.splice(index, 1);\n                setGroupDetails(updatedGroups);\n                setGroups(groups.filter(g => g !== groupName));\n              }\n            }}'
);


fs.writeFileSync('src/App.tsx', code);
