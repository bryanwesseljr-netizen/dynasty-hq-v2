import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CreateDynastyInput, Dynasty } from '../types/dynasty';

function dynastyCollection(userId: string) {
  return collection(db, 'users', userId, 'dynasties');
}

export function subscribeToDynasties(
  userId: string,
  onData: (dynasties: Dynasty[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const dynastiesQuery = query(dynastyCollection(userId), orderBy('updatedAt', 'desc'));

  return onSnapshot(
    dynastiesQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((snapshotDoc) => ({
          id: snapshotDoc.id,
          ...snapshotDoc.data(),
        })) as Dynasty[],
      );
    },
    onError,
  );
}

export async function createDynasty(userId: string, input: CreateDynastyInput) {
  return addDoc(dynastyCollection(userId), {
    ...input,
    ownerId: userId,
    season: 1,
    week: 1,
    wins: 0,
    losses: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function touchDynasty(userId: string, dynastyId: string) {
  return updateDoc(doc(db, 'users', userId, 'dynasties', dynastyId), {
    updatedAt: serverTimestamp(),
  });
}

export async function removeDynasty(userId: string, dynastyId: string) {
  return deleteDoc(doc(db, 'users', userId, 'dynasties', dynastyId));
}
