import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db } from "../firebase";

const storage = getStorage();

// 🔹 Create user document at signup
export async function createUserProfile(user) {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    email: user.email,
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    partnerId: "",
    anniversary: "", // 🔸 optional: ISO date string like "2022-05-01"
    createdAt: serverTimestamp(),
  });
}

// 🔹 Upload profile picture to Firebase Storage and return the URL/path
export async function uploadProfilePicture(userId, file) {
  const storageRef = ref(storage, `profile_pictures/${userId}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return { url, path: snapshot.ref.fullPath };
}

// 🔹 Delete the user's old profile picture from Firebase Storage
export async function deleteOldPicture(fullPath) {
  if (!fullPath) return;
  const fileRef = ref(storage, fullPath);
  await deleteObject(fileRef).catch(() => {}); // silently fail if missing
}

// 🔹 Update user Firestore profile fields
export async function updateUserProfile(userId, data) {
  const userRef = doc(db, "users", userId);
  const existing = await getDoc(userRef);

  if (existing.exists()) {
    await updateDoc(userRef, data);
  } else {
    await setDoc(userRef, { ...data, createdAt: serverTimestamp() });
  }
}

// 🔹 Get full user profile by user ID
export async function getUserProfile(userId) {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

// 🔹 Alias for clarity
export async function getUserProfileById(userId) {
  return await getUserProfile(userId);
}

// 🔹 Send a partner request to another user's email
export async function sendPartnerRequest(senderId, partnerEmail) {
  const q = query(collection(db, "users"), where("email", "==", partnerEmail));
  const snapshot = await getDocs(q);

  if (snapshot.empty) throw new Error("No user with that email found.");

  const partnerDoc = snapshot.docs[0];
  const partnerId = partnerDoc.id;

  if (partnerId === senderId) {
    throw new Error("You can't invite yourself.");
  }

  const requestRef = doc(db, "users", partnerId, "partnerRequests", senderId);
  await setDoc(requestRef, { from: senderId, status: "pending" });

  return partnerDoc.data();
}

// 🔹 Get the first incoming partner request (with sender's email for display)
export async function getIncomingPartnerRequest(userId) {
  const requestsRef = collection(db, "users", userId, "partnerRequests");
  const snapshot = await getDocs(requestsRef);

  if (snapshot.empty) return null;

  const request = snapshot.docs[0];
  const senderId = request.id;
  const senderProfile = await getUserProfileById(senderId);

  return {
    senderId,
    from: senderId,
    email: senderProfile?.email || "Unknown",
    ...request.data(),
  };
}

// 🔹 Accept partner request and update both users
export async function acceptPartnerRequest(userId, senderId) {
  await updateDoc(doc(db, "users", userId), { partnerId: senderId });
  await updateDoc(doc(db, "users", senderId), { partnerId: userId });
  await deletePartnerRequest(userId, senderId);
}

// 🔹 Decline a partner request
export async function declinePartnerRequest(userId, senderId) {
  await deletePartnerRequest(userId, senderId);
}

// 🔹 Internal: remove request doc from Firestore
async function deletePartnerRequest(userId, senderId) {
  const requestRef = doc(db, "users", userId, "partnerRequests", senderId);
  await deleteDoc(requestRef);
}

// 🔹 Disconnect partner relationship on both sides
export async function disconnectPartner(userId, partnerId) {
  await updateDoc(doc(db, "users", userId), { partnerId: "" });
  await updateDoc(doc(db, "users", partnerId), { partnerId: "" });
}

// 🔸 Update anniversary date for both users
export async function updateAnniversaryForBoth(userId, partnerId, anniversary) {
  if (!userId || !partnerId) throw new Error("Both user IDs are required.");

  const userRef = doc(db, "users", userId);
  const partnerRef = doc(db, "users", partnerId);

  await updateDoc(userRef, { anniversary });
  await updateDoc(partnerRef, { anniversary });
}

// addActivity({ title, description, createdBy })
export async function addActivity(data) {
  /* setDoc or addDoc */
}

// getActivities() → array of activity objects
export async function getActivities() {
  /* query, snapshot → map */
}
