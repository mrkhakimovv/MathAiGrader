import { db } from './src/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function run() {
  const q = query(collection(db, 'tasks'), where('teacherUsername', '==', 'teacher'));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data());
  });
  process.exit(0);
}
run();
