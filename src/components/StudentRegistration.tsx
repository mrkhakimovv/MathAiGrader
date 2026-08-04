import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, GraduationCap, CheckCircle2, XCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export function StudentRegistration({ onRegisterSuccess }: { onRegisterSuccess: (user: any) => void }) {
  const { groupId, teacherId } = useParams();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [teacherUsername, setTeacherUsername] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [existingUser, setExistingUser] = useState<any>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("almath_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === 'student') {
          setExistingUser(user);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (teacherId) {
      setTeacherUsername(teacherId);
    }
  }, [teacherId]);

  useEffect(() => {
    // Fetch group details to display the group name
    const fetchGroup = async () => {
      try {
        if (!groupId) return;
        // Search for the group by ID (assuming document ID or an id field)
        const groupsRef = collection(db, 'groups');
        const q = query(groupsRef, where('id', '==', groupId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const groupData = snapshot.docs[0].data();
          setGroupName(groupData.name);
          if (groupData.teacherUsername) {
            setTeacherUsername(groupData.teacherUsername);
          }
        } else {
          // Fallback to checking document ID if id field doesn't exist
          const docRef = doc(db, 'groups', groupId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const groupData = docSnap.data();
            setGroupName(groupData.name);
            if (groupData.teacherUsername) {
              setTeacherUsername(groupData.teacherUsername);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching group:", err);
      }
    };
    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus('idle');
      setSuggestedUsernames([]);
      return;
    }

    const checkUsername = async () => {
      setUsernameStatus('checking');
      try {
        const trimmedUsername = username.trim();
        const studentsQuery = query(collection(db, "students"), where("username", "==", trimmedUsername));
        const teachersQuery = query(collection(db, "teachers"), where("username", "==", trimmedUsername));
        
        const [studentsSnapshot, teachersSnapshot] = await Promise.all([
          getDocs(studentsQuery),
          getDocs(teachersQuery)
        ]);
        
        if (!studentsSnapshot.empty || !teachersSnapshot.empty || trimmedUsername === 'admin' || trimmedUsername === 'teacher') {
          setUsernameStatus('taken');
          const suggestions = [
            `${trimmedUsername}123`,
            `${trimmedUsername}_2026`,
            `${trimmedUsername}${Math.floor(Math.random() * 1000)}`
          ];
          setSuggestedUsernames(suggestions);
        } else {
          setUsernameStatus('available');
          setSuggestedUsernames([]);
        }
      } catch (err) {
        console.error("Error checking username", err);
        setUsernameStatus('idle');
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleJoinExisting = async () => {
    if (!existingUser || !existingUser.id) return;
    setIsLoading(true);
    setError('');
    
    try {
      const studentRef = doc(db, "students", existingUser.id);
      const targetGroup = groupName || groupId || '';
      
      const updates: any = {};
      if (targetGroup) {
        updates.groups = arrayUnion(targetGroup);
      }
      if (teacherUsername) {
        updates.teacherUsername = teacherUsername;
      }
      
      // Update in Firestore
      if (Object.keys(updates).length > 0) {
        await updateDoc(studentRef, updates);
      }
      
      // Update local storage
      const updatedUser = {
        ...existingUser,
        groups: targetGroup ? [...(existingUser.groups || []), targetGroup] : existingUser.groups,
        teacherUsername: teacherUsername || existingUser.teacherUsername
      };
      
      localStorage.setItem("almath_user", JSON.stringify(updatedUser));
      onRegisterSuccess(updatedUser);
      navigate('/');
    } catch (err: any) {
      setError("Xatolik yuz berdi: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !username.trim() || !password.trim()) {
      setError("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    setIsLoading(true);
    setError('');

    if (usernameStatus === 'taken') {
      try {
        const q = query(collection(db, "students"), where("username", "==", username.trim()), where("password", "==", password.trim()));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const studentDoc = snapshot.docs[0];
          const studentData = studentDoc.data();
          const studentRef = doc(db, "students", studentDoc.id);
          
          const targetGroup = groupName || groupId || '';
          const updates: any = {};
          if (targetGroup && (!studentData.groups || !studentData.groups.includes(targetGroup))) {
            updates.groups = arrayUnion(targetGroup);
          }
          if (teacherUsername && studentData.teacherUsername !== teacherUsername) {
            updates.teacherUsername = teacherUsername;
          }
          
          if (Object.keys(updates).length > 0) {
            await updateDoc(studentRef, updates);
          }
          
          const userToStore = {
            id: studentDoc.id,
            username: studentData.username,
            role: 'student',
            ...studentData,
            groups: targetGroup ? [...(studentData.groups || []), targetGroup] : studentData.groups,
            teacherUsername: teacherUsername || studentData.teacherUsername
          };
          
          localStorage.setItem("almath_user", JSON.stringify(userToStore));
          onRegisterSuccess(userToStore);
          navigate('/');
          return;
        } else {
          setError("Ushbu username band yoki parol noto'g'ri. Agar bu sizning akkauntingiz bo'lsa, to'g'ri parolni kiritib kiring.");
          setIsLoading(false);
          return;
        }
      } catch (err: any) {
        setError("Kirishda xatolik yuz berdi: " + err.message);
        setIsLoading(false);
        return;
      }
    }

    try {
      const studentData: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        username: username.trim(),
        password: password.trim(),
        role: 'student',
        createdAt: new Date().toISOString()
      };
      
      if (groupName || groupId) {
        studentData.group = groupName || groupId;
      }
      
      if (teacherUsername) {
        studentData.teacherUsername = teacherUsername;
      }
      
      const docRef = await addDoc(collection(db, "students"), studentData);
      
      // Keep track of the user locally
      const userToStore = {
        id: docRef.id,
        username: `${firstName} ${lastName}`,
        role: 'student',
        ...studentData
      };
      
      localStorage.setItem("almath_user", JSON.stringify(userToStore));
      onRegisterSuccess(userToStore);
      navigate('/'); // Go to main app
    } catch (err: any) {
      setError("Xatolik yuz berdi: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ro'yxatdan o'tish</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {groupName ? <><span className="font-semibold text-indigo-600 dark:text-indigo-400">{groupName}</span> guruhiga qo'shilmoqdasiz</> : teacherId ? "O'qituvchi bilan bog'lanish uchun ro'yxatdan o'ting" : "Platformaga kirish uchun ma'lumotlaringizni kiriting"}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 p-4 text-sm text-rose-800 dark:text-rose-300">
            {error}
          </div>
        )}

        {existingUser ? (
          <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-6 dark:border-indigo-500/20 dark:bg-indigo-500/10 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Sizda allaqachon akkaunt mavjud:</p>
            <p className="font-bold text-lg text-slate-900 dark:text-white mb-4">{existingUser.firstName} {existingUser.lastName}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-6">
              Siz ushbu guruhga (<span className="font-semibold">{groupName || groupId || "ushbu o'qituvchiga"}</span>) ham qo'shilishni xohlaysizmi?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleJoinExisting}
                disabled={isLoading}
                className="w-full flex items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Ha, qo'shilish
              </button>
              <button
                onClick={() => setExistingUser(null)}
                disabled={isLoading}
                className="w-full rounded-xl bg-white dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Boshqa akkaunt yaratish
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
            <label htmlFor="firstName" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Ism
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Ismingizni kiriting"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="lastName" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Familiya
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Familiyangizni kiriting"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Telefon raqam
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="+998 90 123 45 67"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Foydalanuvchi nomi (Username)
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 pr-10 ${
                  usernameStatus === 'taken' 
                    ? 'border-amber-300 dark:border-amber-700 focus:border-amber-500 focus:ring-amber-500/20' 
                    : usernameStatus === 'available'
                      ? 'border-emerald-300 dark:border-emerald-700 focus:border-emerald-500 focus:ring-emerald-500/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
                placeholder="Username kiriting"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-3.5">
                {usernameStatus === 'checking' && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
                {usernameStatus === 'available' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {usernameStatus === 'taken' && <XCircle className="h-5 w-5 text-amber-500" />}
              </div>
            </div>
            
            {usernameStatus === 'taken' && (
              <div className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                Ushbu username band. Agar bu sizning akkauntingiz bo'lsa, parolingizni kiritib kirishingiz mumkin. Boshqa variantlar:
                <div className="mt-1 flex flex-wrap gap-2">
                  {suggestedUsernames.map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setUsername(suggestion)}
                      className="rounded-md bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Parol
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Parol kiriting"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !firstName || !lastName || !phone || !username || !password}
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 px-6 py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Kutilmoqda...
              </>
            ) : (
              usernameStatus === 'taken' ? "Akkauntga kirish" : "Ro'yxatdan o'tish"
            )}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}
