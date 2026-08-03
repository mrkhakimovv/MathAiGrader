import { db } from './src/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function run() {
  const q = query(collection(db, 'groups'), where('teacherUsername', '==', 'teacher'));
  const snapshot = await getDocs(q);
  console.log(`Found ${snapshot.size} groups for 'teacher'`);
  process.exit(0);
}
run();
