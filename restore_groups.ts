import { db } from './src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

async function run() {
  const groupsToCreate = [
    { name: 'Toq kunlar 10-12', days: 'Du, Chor, Juma', time: '10:00 - 12:00', teacherUsername: 'teacher' },
    { name: 'Juft kunlar 10-12', days: 'Se, Pay, Shan', time: '10:00 - 12:00', teacherUsername: 'teacher' },
    { name: 'Daraja guruhi', days: 'Du, Chor, Juma', time: '14:00 - 16:00', teacherUsername: 'teacher' },
    { name: 'Geometriya', days: 'Se, Pay, Shan', time: '16:00 - 18:00', teacherUsername: 'teacher' },
    { name: 'A+', days: 'Du, Chor, Juma', time: '08:00 - 10:00', teacherUsername: 'teacher' }
  ];

  for (const group of groupsToCreate) {
    await addDoc(collection(db, 'groups'), {
      ...group,
      createdAt: serverTimestamp()
    });
    console.log(`Created group: ${group.name}`);
  }
  process.exit(0);
}
run();
