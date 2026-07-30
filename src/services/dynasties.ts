import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  defaultDynastyProfile,
  type CreateDynastyInput,
  type CreateGameInput,
  type CreateRecruitInput,
  type Dynasty,
  type DynastyGame,
  type DynastyUpdate,
  type RecruitSchool,
  type UpdateGameInput,
  type UpdateRecruitInput,
} from '../types/dynasty';

function dynastyCollection(userId: string) {
  return collection(db, 'users', userId, 'dynasties');
}

function dynastyDocument(userId: string, dynastyId: string) {
  return doc(db, 'users', userId, 'dynasties', dynastyId);
}

function gamesCollection(userId: string, dynastyId: string) {
  return collection(db, 'users', userId, 'dynasties', dynastyId, 'games');
}

function recruitingCollection(userId: string, dynastyId: string) {
  return collection(db, 'users', userId, 'dynasties', dynastyId, 'recruiting');
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

export function subscribeToDynasty(
  userId: string,
  dynastyId: string,
  onData: (dynasty: Dynasty | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    dynastyDocument(userId, dynastyId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }

      onData({ id: snapshot.id, ...snapshot.data() } as Dynasty);
    },
    onError,
  );
}

export function subscribeToGames(
  userId: string,
  dynastyId: string,
  onData: (games: DynastyGame[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const gamesQuery = query(gamesCollection(userId, dynastyId), orderBy('createdAt', 'desc'));

  return onSnapshot(
    gamesQuery,
    (snapshot) => {
      const games = snapshot.docs.map((snapshotDoc) => ({
        id: snapshotDoc.id,
        ...snapshotDoc.data(),
      })) as DynastyGame[];

      games.sort((a, b) => b.season - a.season || b.week - a.week);
      onData(games);
    },
    onError,
  );
}

export function subscribeToRecruiting(
  userId: string,
  dynastyId: string,
  onData: (schools: RecruitSchool[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const recruitingQuery = query(recruitingCollection(userId, dynastyId), orderBy('rank', 'asc'));

  return onSnapshot(
    recruitingQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((snapshotDoc) => ({
          id: snapshotDoc.id,
          ...snapshotDoc.data(),
        })) as RecruitSchool[],
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
    profile: {
      ...defaultDynastyProfile,
      displayName: input.mode === 'RTG' ? input.name : '',
      almaMater: input.mode === 'RTG' ? '' : input.school,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateDynasty(userId: string, dynastyId: string, input: DynastyUpdate) {
  return updateDoc(dynastyDocument(userId, dynastyId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function touchDynasty(userId: string, dynastyId: string) {
  return updateDynasty(userId, dynastyId, {});
}

export async function removeDynasty(userId: string, dynastyId: string) {
  const [gamesSnapshot, recruitingSnapshot] = await Promise.all([
    getDocs(gamesCollection(userId, dynastyId)),
    getDocs(recruitingCollection(userId, dynastyId)),
  ]);

  await Promise.all([
    ...gamesSnapshot.docs.map((snapshotDoc) => deleteDoc(snapshotDoc.ref)),
    ...recruitingSnapshot.docs.map((snapshotDoc) => deleteDoc(snapshotDoc.ref)),
  ]);

  return deleteDoc(dynastyDocument(userId, dynastyId));
}

export async function createGame(userId: string, dynastyId: string, input: CreateGameInput) {
  return addDoc(gamesCollection(userId, dynastyId), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateGame(userId: string, dynastyId: string, gameId: string, input: UpdateGameInput) {
  return updateDoc(doc(gamesCollection(userId, dynastyId), gameId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function removeGame(userId: string, dynastyId: string, gameId: string) {
  return deleteDoc(doc(gamesCollection(userId, dynastyId), gameId));
}

export async function createRecruit(userId: string, dynastyId: string, input: CreateRecruitInput) {
  return addDoc(recruitingCollection(userId, dynastyId), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateRecruit(userId: string, dynastyId: string, recruitId: string, input: UpdateRecruitInput) {
  return updateDoc(doc(recruitingCollection(userId, dynastyId), recruitId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function removeRecruit(userId: string, dynastyId: string, recruitId: string) {
  return deleteDoc(doc(recruitingCollection(userId, dynastyId), recruitId));
}
