// @ts-ignore
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { Event, Message, UserProfile } from './types';

// Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCkV42kdPDl2GssgQy3s4ks5TyXtP3PolI",
    authDomain: "trailconnect-85b9e.firebaseapp.com",
    projectId: "trailconnect-85b9e",
    storageBucket: "trailconnect-85b9e.firebasestorage.app",
    messagingSenderId: "441650212799",
    appId: "1:441650212799:web:810a9155e4f2cfae15bb0a",
    measurementId: "G-3NZCXF6GL6"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Events CRUD
export const addEvent = async (event: Omit<Event, 'id'>) => {
  const docRef = await addDoc(collection(db, 'events'), event);
  return docRef.id;
};

export const getEvents = async () => {
  const querySnapshot = await getDocs(collection(db, 'events'));
  return querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Event));
};

export const updateEvent = async (id: string, event: Partial<Event>) => {
  const eventRef = doc(db, 'events', id);
  await updateDoc(eventRef, event);
};

export const deleteEvent = async (id: string) => {
  const eventRef = doc(db, 'events', id);
  await deleteDoc(eventRef);
};

// Messages CRUD
export const addMessage = async (message: Omit<Message, 'id'>) => {
  const docRef = await addDoc(collection(db, 'messages'), message);
  return docRef.id;
};

export const getMessages = async () => {
  const querySnapshot = await getDocs(collection(db, 'messages'));
  return querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Message));
};

export const updateMessage = async (id: string, message: Partial<Message>) => {
  const messageRef = doc(db, 'messages', id);
  await updateDoc(messageRef, message);
};

export const deleteMessage = async (id: string) => {
  const messageRef = doc(db, 'messages', id);
  await deleteDoc(messageRef);
};

// User Profiles CRUD
export const addUserProfile = async (profile: Omit<UserProfile, 'id'>) => {
  const docRef = await addDoc(collection(db, 'userProfiles'), profile);
  return docRef.id;
};

export const getUserProfiles = async () => {
  const querySnapshot = await getDocs(collection(db, 'userProfiles'));
  return querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as UserProfile));
};

export const updateUserProfile = async (id: string, profile: Partial<UserProfile>) => {
  const profileRef = doc(db, 'userProfiles', id);
  await updateDoc(profileRef, profile);
};

export const deleteUserProfile = async (id: string) => {
  const profileRef = doc(db, 'userProfiles', id);
  await deleteDoc(profileRef);
}; 