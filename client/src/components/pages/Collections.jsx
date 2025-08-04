// src/pages/Collections.jsx
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  startAfter,
  limit,
} from "firebase/firestore";
import UploadCSV from "../collections/UploadCSV";
import CollectionItem from "../collections/CollectionsItem";
import Navbar from "../common/Navbar";
import "../../styles/Collections.css";

export default function Collections() {
  const [collectionType, setCollectionType] = useState("movies");
  const [items, setItems] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const user = auth.currentUser;

  // Load initial or next batch of collection items
  const fetchItems = async (initial = false) => {
    if (!user || (!initial && !hasMore)) return;

    const colRef = collection(db, `users/${user.uid}/${collectionType}`);
    let q = query(colRef, orderBy("createdAt", "desc"), limit(25));
    if (lastDoc && !initial) {
      q = query(
        colRef,
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(25)
      );
    }

    const snap = await getDocs(q);
    if (snap.empty) {
      setHasMore(false);
      return;
    }

    const newItems = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setItems((prev) => [...prev, ...newItems]);
    setLastDoc(snap.docs[snap.docs.length - 1]);
  };

  useEffect(() => {
    setItems([]);
    setLastDoc(null);
    setHasMore(true);
    fetchItems(true);
    // eslint-disable-next-line
  }, [user, collectionType]);

  // Add new item manually
  const handleAdd = async (title) => {
    if (!title || !user) return;
    const colRef = collection(db, `users/${user.uid}/${collectionType}`);
    const docRef = await addDoc(colRef, {
      title: title.trim(),
      createdAt: new Date(),
      type: collectionType,
    });
    setItems((prev) => [
      { id: docRef.id, title: title.trim(), type: collectionType },
      ...prev,
    ]);
  };

  // Delete item
  const handleDelete = async (id) => {
    const docRef = doc(db, `users/${user.uid}/${collectionType}/${id}`);
    await deleteDoc(docRef);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      <Navbar />
      <div className="collections-page">
        <h2>
          Your{" "}
          {collectionType.charAt(0).toUpperCase() + collectionType.slice(1)}
        </h2>

        <div className="collection-controls">
          {/* Collection Type Selector */}
          <select
            onChange={(e) => setCollectionType(e.target.value)}
            value={collectionType}
          >
            <option value="movies">Movies</option>
            <option value="shows">Shows</option>
            <option value="games">Games</option>
          </select>

          {/* CSV Upload */}
          <UploadCSV type={collectionType} />

          {/* Manual Add Field */}
          <div className="add-new-input">
            <input
              type="text"
              placeholder={`Add new ${collectionType.slice(0, -1)}...`}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button
              onClick={() => {
                handleAdd(newTitle);
                setNewTitle("");
              }}
              disabled={!newTitle.trim()}
            >
              + Add
            </button>
          </div>
        </div>

        {/* Collection List */}
        <ul className="collection-list">
          {items.map((item) => (
            <CollectionItem
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </ul>

        {/* Load More Button */}
        {hasMore && (
          <button className="load-more-btn" onClick={() => fetchItems()}>
            Load More
          </button>
        )}
      </div>
    </>
  );
}
