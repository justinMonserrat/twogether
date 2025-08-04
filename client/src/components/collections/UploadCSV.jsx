// src/components/collections/UploadCSV.jsx
import { useState } from "react";
import Papa from "papaparse";
import { auth, db } from "../../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export default function UploadCSV({ type }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // "success" or "error"

  const user = auth.currentUser;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);
    setMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const items = results.data;
          const addedTitles = [];

          for (let row of items) {
            let title =
              row.Title || row.name || row["Movie Name"] || row["Name"] || null;

            if (!title || typeof title !== "string") continue;
            title = title.trim();

            const q = query(
              collection(db, `users/${user.uid}/${type}`),
              where("title", "==", title)
            );
            const existing = await getDocs(q);
            if (!existing.empty) continue;

            await addDoc(collection(db, `users/${user.uid}/${type}`), {
              title,
              createdAt: new Date(),
              type,
            });
            addedTitles.push(title);
          }

          setMessage(`✅ Added ${addedTitles.length} new ${type}`);
          setMessageType("success");
        } catch (err) {
          console.error("Upload error:", err);
          setMessage("❌ Something went wrong during upload.");
          setMessageType("error");
        }

        setUploading(false);
        setTimeout(() => setMessage(""), 5000);
      },
    });
  };

  return (
    <div className="upload-csv-wrapper">
      {message && (
        <div className={`upload-message ${messageType}`}>{message}</div>
      )}
      <label className="upload-csv-label">
        {uploading ? "Uploading..." : "📄 Upload CSV"}
        <input
          type="file"
          accept=".csv,.CSV,text/csv,text/plain"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}
