const fs = require('fs');

let teacherViews = fs.readFileSync('src/components/TeacherViews.tsx', 'utf8');

teacherViews = teacherViews.replace(
  "onDeleteStudent: (index: number) => void;",
  "onDeleteStudent: (student: any) => void;"
);

teacherViews = teacherViews.replace(
  "const handleDelete = (e: React.MouseEvent, index: number, studentName: string) => {\n    e.stopPropagation();\n    if (window.confirm(`Rostdan ham \"${studentName}\" o'quvchini o'chirmoqchimisiz?`)) {\n      onDeleteStudent(index);\n    }\n  };",
  "const handleDelete = (e: React.MouseEvent, student: any) => {\n    e.stopPropagation();\n    if (window.confirm(`Rostdan ham \"${student.firstName} ${student.lastName}\" o'quvchini o'chirmoqchimisiz?`)) {\n      onDeleteStudent(student);\n    }\n  };"
);

teacherViews = teacherViews.replace(
  "onClick={(e) => handleDelete(e, index, `${student.firstName} ${student.lastName}`)}",
  "onClick={(e) => handleDelete(e, student)}"
);

fs.writeFileSync('src/components/TeacherViews.tsx', teacherViews);

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(
  "onDeleteStudent={(index) => {\n              const updatedStudents = [...students];\n              updatedStudents.splice(index, 1);\n              setStudents(updatedStudents);\n            }}",
  "onDeleteStudent={async (student) => {\n              try {\n                if (student.id) {\n                  await deleteDoc(doc(db, \"students\", student.id));\n                  setStudents(students.filter(s => s.id !== student.id));\n                }\n              } catch (err) {\n                console.error(\"Error deleting student:\", err);\n                alert(\"O'quvchini o'chirishda xatolik yuz berdi.\");\n              }\n            }}"
);

fs.writeFileSync('src/App.tsx', appCode);

