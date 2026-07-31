import fs from 'fs';
let content = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

content = content.replace("import { initializeFirestore } from 'firebase/firestore';", "import { initializeFirestore } from 'firebase/firestore';");

// Make sure it uses initializeFirestore properly, or we can use getFirestore.
// I will rewrite src/lib/firebase.ts just to be sure it exports db properly.
const newContent = `import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
`;

fs.writeFileSync('src/lib/firebase.ts', newContent);
