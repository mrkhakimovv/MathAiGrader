import { db } from './src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function run() {
  const snapshot = await getDocs(collection(db, 'groups'));
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data());
  });
  process.exit(0);
}
run();
