import { Routes, Route, useNavigate } from "react-router-dom";
import { StudentRegistration } from "./components/StudentRegistration";
import React, { useState, useEffect } from "react";
import { Uploader } from "./components/Uploader";
import { ResultCard } from "./components/ResultCard";
import { ProfileModal } from "./components/ProfileModal";
import { LoginScreen } from "./components/LoginScreen";
import { AdminPanel } from "./components/AdminPanel";
import { Sidebar, ViewType } from "./components/Sidebar";
import { AllStudentsView, CreateGroupView, CreateTaskView, AllGroupsView } from "./components/TeacherViews";
import { StudentTasksView, StudentStatsView } from "./components/StudentViews";
import { AddStudentModal } from "./components/AddStudentModal";
import { AddGroupModal } from "./components/AddGroupModal";
import { GradingResult } from "./types";
import { Calculator, Loader2, Moon, Sun, UserPlus, Users, FilePlus } from "lucide-react";
import { saveResult, subscribeToHistory, subscribeToCollection, saveToCollection } from "./lib/db";
import { doc, deleteDoc, getDocs, query, where, collection } from "firebase/firestore";
import { db, storage } from "./lib/firebase";
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { WelcomeScreen } from "./components/WelcomeScreen";

function MainApp() {
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'teacher' | 'student' | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [teachers, setTeachers] = useState<{username: string, password: string, id: string}[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [history, setHistory] = useState<GradingResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);
  const [taskUploadProgress, setTaskUploadProgress] = useState(0);
  const [groups, setGroups] = useState<string[]>([]);
  const [groupDetails, setGroupDetails] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskForGrading, setSelectedTaskForGrading] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const storedUser = localStorage.getItem("almath_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.username && user.role) {
          setCurrentUser(user.username);
          setRole(user.role);
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
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
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const userHistory = role === 'student' ? history.filter(h => h.studentUsername === currentUser) : history;
  
  const teacherGroupDetails = role === 'teacher' ? groupDetails.filter(g => g.teacherUsername === currentUser) : groupDetails;
  const teacherGroups = teacherGroupDetails.map(g => g.name);
  const teacherStudents = role === 'teacher' ? students.filter(s => s.teacherUsername === currentUser) : students;
  const teacherTasks = role === 'teacher' ? tasks.filter(t => t.teacherUsername === currentUser) : tasks;

    const handleLogin = async (username: string, pass: string) => {
    if (username === 'admin') {
      if (pass === '7788') {
        setCurrentUser('admin');
        setRole('admin');
        localStorage.setItem("almath_user", JSON.stringify({ username: 'admin', role: 'admin' }));
        return true;
      }
      return false;
    }
    
    if (username === 'teacher' && pass === '7744') {
      setCurrentUser('teacher');
      setRole('teacher');
      localStorage.setItem("almath_user", JSON.stringify({ username: 'teacher', role: 'teacher' }));
      return true;
    }
    
    const teacher = teachers.find(t => t.username === username);
    if (teacher) {
      if (teacher.password === pass) {
        setCurrentUser(username);
        setRole('teacher');
        localStorage.setItem("almath_user", JSON.stringify({ username, role: 'teacher' }));
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
        localStorage.setItem("almath_user", JSON.stringify(userToStore));
        setCurrentUser(studentData.username);
        setRole('student');
        return true;
      }
    } catch (err) {
      console.error("Login error:", err);
    }

    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRole(null);
    setActiveView('home');
    localStorage.removeItem("almath_user");
  };

  const handleFilesSelect = (files: File[]) => {
    setSelectedFiles(files);
    setError(null);
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert files to Base64
      const images = await Promise.all(
        selectedFiles.map(async (file) => {
          const base64String = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
          });
          return {
            imageBase64: base64String.split(",")[1] || base64String, // Extract just the base64 part here
            mimeType: file.type,
          };
        })
      );

      // We'll also check total size here before sending
      let totalSize = 0;
      for (const file of selectedFiles) {
        totalSize += file.size;
      }
      if (totalSize > 15 * 1024 * 1024) {
         throw new Error("Fayllar umumiy hajmi juda katta. Iltimos, jami 15MB dan kichik fayllar yuklang.");
      }

      const response = await fetch("/api/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ images, taskReference: selectedTaskForGrading }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to evaluate homework. Please try again.");
      }

      const data: GradingResult = await response.json();
      setResult(data);
      saveResult({ ...data, studentUsername: currentUser || 'unknown', taskId: selectedTaskForGrading?.id || 'unknown' });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    if (showLogin) {
      return (
        <LoginScreen
          onLogin={handleLogin}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onBack={() => setShowLogin(false)}
        />
      );
    }
    return (
      <WelcomeScreen
        onLoginClick={() => setShowLogin(true)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  if (role === 'admin') {
    return (
      <AdminPanel
        teachers={teachers}
        onCreateTeacher={async (u, p) => {
          try {
            await saveToCollection("teachers", { username: u, password: p });
            alert("O'qituvchi muvaffaqiyatli qo'shildi!");
          } catch(err) {
            console.error(err);
            alert("Xatolik yuz berdi");
          }
        }}
        onDeleteTeacher={async (id) => {
          try {
            await deleteDoc(doc(db, "teachers", id));
          } catch(err) {
            console.error(err);
            alert("Xatolik yuz berdi");
          }
        }}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors flex flex-col md:flex-row pb-16 md:pb-0">
      <Sidebar 
        onProfileClick={() => setIsProfileModalOpen(true)}
        activeView={activeView}
        onChangeView={setActiveView}
        role={role}
      />
      
      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-full md:h-screen">
        <div className="mx-auto max-w-3xl relative pt-14">
          <div className="absolute right-0 top-0 flex items-center gap-3 z-10">
            {role === 'teacher' && activeView === 'all-students' && (
              <button
                onClick={() => setIsAddStudentModalOpen(true)}
                className="flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 px-3 text-sm font-semibold text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
                aria-label="Add Student"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">O'quvchi qo'shish</span>
              </button>
            )}
            {role === 'teacher' && activeView === 'all-groups' && (
              <button
                onClick={() => setIsAddGroupModalOpen(true)}
                className="flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 px-3 text-sm font-semibold text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
                aria-label="Add Group"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Guruh yaratish</span>
              </button>
            )}
            {role === 'teacher' && activeView === 'create-task' && (
              <button
                type="submit"
                form="create-task-form"
                disabled={isTaskSubmitting}
                className={`flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-white transition-colors shadow-sm ${isTaskSubmitting ? 'bg-indigo-400 dark:bg-indigo-600 cursor-not-allowed' : 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600'}`}
                aria-label="Create Task"
              >
                {isTaskSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <FilePlus className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isTaskSubmitting ? 'Yaratilmoqda...' : 'Vazifa yaratish'}
                </span>
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

        {((activeView === 'home' && role !== 'student') || activeView === 'grade-task') && (
          <>
            {/* Header */}
            <header className="mb-6 md:mb-10 text-center">
              <div className="mx-auto mb-3 md:mb-4 flex h-16 w-16 justify-center">
                <img src="/logo.png" alt="ALMATH Logo" className="h-full w-full rounded-full object-cover" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-4xl">
                {selectedTaskForGrading ? "Vazifani topshirish" : "ALMATH"}
              </h1>
              <p className="mt-2 md:mt-3 text-sm md:text-lg text-slate-600 dark:text-slate-400">
                {selectedTaskForGrading ? `Siz hozir ushbu vazifani bajaryapsiz: ${selectedTaskForGrading.title}` : "O'quvchilar uy vazifalarini avtomatik tekshirish tizimi."}
              </p>
            </header>

            <main className="flex flex-col gap-8">
              {!result ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:p-8 transition-colors">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {selectedTaskForGrading ? "Yechim faylini yuklang" : "Student Homework Image"}
                      </label>
                      <Uploader
                        selectedFiles={selectedFiles}
                        onFilesSelect={handleFilesSelect}
                        onClear={handleClear}
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 p-4 text-sm text-rose-800 dark:text-rose-300">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={selectedFiles.length === 0 || isLoading}
                      className="mt-4 flex w-full items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 px-6 py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:shadow-none dark:focus:ring-offset-slate-950"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Tekshirilmoqda...
                        </>
                      ) : (
                        selectedTaskForGrading ? "Vazifani yuborish" : "Grade Homework"
                      )}
                    </button>
                    {selectedTaskForGrading && (
                       <button
                         type="button"
                         onClick={() => {
                           setSelectedTaskForGrading(null);
                           setActiveView('student-tasks');
                         }}
                         className="mt-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                       >
                         Boshqa vazifa tanlash
                       </button>
                    )}
                  </form>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ResultCard result={result} onReset={handleReset} />
                </div>
              )}
            </main>
          </>
        )}

        {activeView === 'all-students' && (
          <AllStudentsView 
            students={teacherStudents}
            history={userHistory} 
            onDeleteStudent={async (student) => {
              try {
                if (student.id) {
                  await deleteDoc(doc(db, "students", student.id));
                  setStudents(students.filter(s => s.id !== student.id));
                }
              } catch (err) {
                console.error("Error deleting student:", err);
                alert("O'quvchini o'chirishda xatolik yuz berdi.");
              }
            }} 
          />
        )}
        {activeView === 'create-group' && <CreateGroupView />}
        {activeView === 'create-task' && <CreateTaskView groups={teacherGroups} isSubmitting={isTaskSubmitting} uploadProgress={taskUploadProgress} onCreateTask={async (task) => {
          try {
            setIsTaskSubmitting(true);
            setTaskUploadProgress(0);
            
            const taskToSave: any = { ...task, teacherUsername: currentUser };
            const uploadedFiles = [];
            
            const totalFiles = (task.files?.length || 0) + (task.examples?.length || 0);
            let uploadedCount = 0;
            let currentFileProgress = 0;
            
            const calculateOverallProgress = (fileProgress: number) => {
              if (totalFiles === 0) return 0;
              const baseProgress = (uploadedCount / totalFiles) * 100;
              const currentProgress = (fileProgress / totalFiles);
              return Math.round(baseProgress + currentProgress);
            };

            const uploadFileWithProgress = (file: File, path: string): Promise<string> => {
              return new Promise((resolve, reject) => {
                if (file.size > 800 * 1024) {
                  reject(new Error(`Fayl hajmi 800KB dan oshmasligi kerak: ${file.name}`));
                  return;
                }
                const reader = new FileReader();
                reader.onprogress = (e) => {
                  if (e.lengthComputable) {
                    const progress = (e.loaded / e.total) * 100;
                    currentFileProgress = progress;
                    setTaskUploadProgress(calculateOverallProgress(progress));
                  }
                };
                reader.onload = () => {
                  uploadedCount++;
                  currentFileProgress = 0;
                  setTaskUploadProgress(calculateOverallProgress(0));
                  resolve(reader.result as string);
                };
                reader.onerror = () => reject(new Error("Faylni o'qishda xatolik yuz berdi"));
                reader.readAsDataURL(file);
              });
            };
            
            // Upload source files if any
            if (task.files && task.files.length > 0) {
              for (const file of task.files) {
                const url = await uploadFileWithProgress(file, `tasks/${Date.now()}_${file.name}`);
                uploadedFiles.push({ name: file.name, url, type: file.type });
              }
            }
            
            const uploadedExamples = [];
            if (task.examples && task.examples.length > 0) {
              for (const file of task.examples) {
                const url = await uploadFileWithProgress(file, `examples/${Date.now()}_${file.name}`);
                uploadedExamples.push({ name: file.name, url, type: file.type });
              }
            }
            
            taskToSave.fileUrls = uploadedFiles;
            taskToSave.exampleUrls = uploadedExamples;
            delete taskToSave.files;
            delete taskToSave.examples;
            
            await saveToCollection('tasks', taskToSave);
            setIsTaskSubmitting(false);
            setTaskUploadProgress(100);
            alert("Vazifa muvaffaqiyatli yaratildi!");
            setActiveView('home');
          } catch (err: any) {
            console.error("Error creating task:", err);
            setIsTaskSubmitting(false);
            alert(`Vazifa yaratishda xatolik yuz berdi: ${err.message || ""}`);
          }
        }} />}
        {activeView === 'all-groups' && (
          <AllGroupsView 
            groups={teacherGroupDetails} 
            students={teacherStudents}
            history={userHistory}
            tasks={teacherTasks}
            onDeleteTask={async (task) => {
              try {
                if (task.id) {
                  await deleteDoc(doc(db, "tasks", task.id));
                  setTasks(tasks.filter(t => t.id !== task.id));
                }
              } catch (err) {
                console.error("Error deleting task:", err);
                alert("Vazifani o'chirishda xatolik yuz berdi.");
              }
            }}
            onDeleteGroup={async (index) => {
              const updatedGroups = [...groupDetails];
              const groupName = updatedGroups[index].name;
              
              // Also delete from firebase
              try {
                const groupToDelete = groupDetails[index];
                if (groupToDelete && groupToDelete.id) {
                   await deleteDoc(doc(db, "groups", groupToDelete.id));
                }
              } catch(e) {
                 console.log(e);
              }
              
              updatedGroups.splice(index, 1);
              setGroupDetails(updatedGroups);
              setGroups(groups.filter(g => g !== groupName));
            }}
          />
        )}
        {activeView === 'student-tasks' && (
          <StudentTasksView 
            tasks={tasks} 
            studentInfo={students.find(s => s.username === currentUser)} 
            onSolveTask={(task) => {
              setSelectedTaskForGrading(task);
              setActiveView('grade-task');
            }}
          />
        )}
        {activeView === 'home' && role === 'student' && <StudentStatsView tasks={tasks} history={userHistory} studentInfo={students.find(s => s.username === currentUser)} />}
      </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        history={userHistory}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        username={currentUser || ''}
        onLogout={handleLogout}
        userRole={role}
        studentInfo={students.find(s => s.username === currentUser)}
        tasks={tasks}
      />

      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        groups={teacherGroups}
        onAddStudent={async (student) => {
          await saveToCollection("students", { ...student, teacherUsername: currentUser });
          alert(`${student.firstName} muvaffaqiyatli qo'shildi!`);
        }}
      />

      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => setIsAddGroupModalOpen(false)}
        onAddGroup={async (group) => {
          await saveToCollection("groups", { ...group, teacherUsername: currentUser });
          alert(`"${group.name}" guruhi muvaffaqiyatli yaratildi!`);
        }}
      />
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  
  const handleRegisterSuccess = (user: any) => {
    // Just force a reload to trigger the auth logic in MainApp
    // Or we could pass down the user state, but it reads from localStorage on mount.
    window.location.href = '/';
  };

  return (
    <Routes>
      <Route path="/register/:groupId" element={<StudentRegistration onRegisterSuccess={handleRegisterSuccess} />} />
      <Route path="/*" element={<MainApp />} />
    </Routes>
  );
}
