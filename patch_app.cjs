const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add states
const statesRegex = /const \[showLogin, setShowLogin\] = useState\(false\);/;
const newStates = `const [showLogin, setShowLogin] = useState(false);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [switchingId, setSwitchingId] = useState<string | null>(null);`;
code = code.replace(statesRegex, newStates);

// 2. Replace useEffect for loading user
const oldEffect = /useEffect\(\(\) => \{\n    const storedUser = localStorage\.getItem\("almath_user"\);[\s\S]*?\}, \[\]\);/;
const newEffect = `useEffect(() => {
    // Migrate and load accounts
    migrateLegacyUser();
    setAccounts(getAccounts());

    const activeId = getActiveAccountId();
    if (activeId) {
      const acc = getAccount(activeId);
      if (acc) {
        setCurrentUser(acc.username);
        setRole(acc.role);
        if (acc.role === 'admin') {
          setActiveView('admin-create-teacher');
        }
        import('./lib/db').then(({ cleanupOldAnalyses }) => {
          cleanupOldAnalyses();
        });
      }
    }
  }, []);`;
code = code.replace(oldEffect, newEffect);

// 3. Replace handleLogin
const oldHandleLogin = /const handleLogin = async \(username: string, pass: string\) => \{[\s\S]*?return false;\n  \};/;
const newHandleLogin = `const handleLogin = async (username: string, pass: string) => {
    let success = false;
    let loggedInRole: any = null;
    let docId = undefined;
    let firstName = undefined;
    let lastName = undefined;
    let avatar = undefined;

    if (username === 'admin') {
      if (pass === '7788') {
        success = true;
        loggedInRole = 'admin';
        setActiveView('admin-create-teacher');
      }
    } else if (username === 'teacher' && pass === '7744') {
      success = true;
      loggedInRole = 'teacher';
    } else {
      try {
        const qTeacher = query(collection(db, "teachers"), where("username", "==", username), where("password", "==", pass));
        const snapshotTeacher = await getDocs(qTeacher);
        if (!snapshotTeacher.empty) {
          success = true;
          loggedInRole = 'teacher';
          docId = snapshotTeacher.docs[0].id;
        } else {
          const q = query(collection(db, "students"), where("username", "==", username), where("password", "==", pass));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            success = true;
            loggedInRole = 'student';
            const data = snapshot.docs[0].data();
            docId = snapshot.docs[0].id;
            firstName = data.firstName;
            lastName = data.lastName;
            avatar = data.avatar;
          }
        }
      } catch(e) { console.error(e); }
    }

    if (success) {
      const acc = upsertAccount({
        username,
        role: loggedInRole,
        password: pass,
        docId,
        firstName,
        lastName,
        avatar
      });
      setActiveAccountId(acc.id);
      setAccounts(getAccounts());
      setCurrentUser(username);
      setRole(loggedInRole);
      setShowLogin(false);
      return true;
    }
    return false;
  };

  const handleSwitchAccount = async (id: string) => {
    const acc = getAccount(id);
    if (!acc) return;
    
    if (acc.secret) {
      const pass = decodeSecret(acc.secret);
      setSwitchingId(id);
      const ok = await handleLogin(acc.username, pass);
      setSwitchingId(null);
      if (ok) {
        setActiveAccountId(id);
        setAccounts(getAccounts());
        setShowLogin(false);
      } else {
        alert("Parol xato! Iltimos qaytadan login qiling.");
        // We could prompt for password, but for now just clear secret
        // logic omitted for simplicity
      }
    } else {
      // Need password
      setShowLogin(true);
    }
  };

  const handleRemoveAccount = (id: string) => {
    setAccounts(removeAccount(id));
  };
`;
code = code.replace(oldHandleLogin, newHandleLogin);

// 4. Update ProfileModal props
const oldProfileModal = /<ProfileModal[\s\S]*?\/>/;
const newProfileModal = `<ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        history={userHistory}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        username={currentUser}
        onLogout={handleLogout}
        userRole={role}
        studentInfo={currentStudentInfo}
        tasks={tasks}
        onUsernameChange={(newUsername) => {
          setCurrentUser(newUsername);
          // Assuming upsert/patch is handled inside ProfileModal or needs reload
        }}
        accounts={accounts}
        activeAccountId={getActiveAccountId()}
        switchingId={switchingId}
        onSwitchAccount={handleSwitchAccount}
        onAddAccount={() => {
          setIsProfileModalOpen(false);
          setShowLogin(true);
        }}
        onRemoveAccount={handleRemoveAccount}
      />`;
code = code.replace(oldProfileModal, newProfileModal);

// 5. Update LoginScreen props
const oldLoginScreen = /<LoginScreen\n\s*onLogin={handleLogin}[\s\S]*?\/>/;
const newLoginScreen = `<LoginScreen
          onLogin={handleLogin}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onBack={() => setShowLogin(false)}
          accounts={accounts}
          activeAccountId={getActiveAccountId()}
          switchingId={switchingId}
          onSwitchAccount={handleSwitchAccount}
          onRemoveAccount={handleRemoveAccount}
        />`;
code = code.replace(oldLoginScreen, newLoginScreen);

fs.writeFileSync('src/App.tsx', code);
