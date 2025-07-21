import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  uploadProfilePicture,
  deleteOldPicture,
  updateUserProfile,
  getUserProfile,
  sendPartnerRequest,
  getIncomingPartnerRequest,
  acceptPartnerRequest,
  declinePartnerRequest,
  getUserProfileById,
  disconnectPartner,
  updateAnniversaryForBoth,
} from "../../services/firestore";
import "../../styles/Profile.css";
import Navbar from "../common/Navbar";

export default function Profile() {
  const user = auth.currentUser;

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [currentName, setCurrentName] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [previewPic, setPreviewPic] = useState(
    user?.photoURL || "/default-avatar.png"
  );
  const [message, setMessage] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [partnerName, setPartnerName] = useState("Not connected");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerPic, setPartnerPic] = useState(null);
  const [oldPhotoPath, setOldPhotoPath] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [anniversary, setAnniversary] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      const data = await getUserProfile(user.uid);
      if (data?.photoURL) setPreviewPic(data.photoURL);
      if (data?.photoPath) setOldPhotoPath(data.photoPath);
      if (data?.anniversary) setAnniversary(data.anniversary);

      if (data?.partnerId) {
        setPartnerId(data.partnerId);
        const partner = await getUserProfileById(data.partnerId);
        const name = partner?.displayName || partner?.email || "Connected";
        setPartnerName(name);
        setPartnerPic(partner?.photoURL || null);
      }

      const request = await getIncomingPartnerRequest(user.uid);
      if (request) setIncomingRequest(request);
    };

    if (user) loadUserData();
  }, [user]);

  const handleDisplayNameChange = async () => {
    try {
      await updateProfile(user, { displayName });
      await updateUserProfile(user.uid, { displayName });
      setCurrentName(displayName);
      setMessage("Display name updated.");
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !oldPassword) {
      setMessage("Please enter both old and new passwords.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setMessage("Password updated.");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewPic(URL.createObjectURL(file));

    try {
      if (oldPhotoPath) await deleteOldPicture(oldPhotoPath);

      const { url, path } = await uploadProfilePicture(user.uid, file);
      await updateProfile(user, { photoURL: url });
      await updateUserProfile(user.uid, { photoURL: url, photoPath: path });

      setOldPhotoPath(path);
      setPreviewPic(url);
      setMessage("Profile picture updated!");
    } catch (err) {
      setMessage("Error uploading image: " + err.message);
    }
  };

  const handlePartnerConnect = async () => {
    if (partnerEmail === user.email) {
      setMessage("You can't partner with yourself.");
      return;
    }

    try {
      await sendPartnerRequest(user.uid, partnerEmail);
      setMessage("Partner invite sent!");
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const handleAcceptPartner = async () => {
    try {
      await acceptPartnerRequest(user.uid, incomingRequest.from);
      const partner = await getUserProfileById(incomingRequest.from);
      const name = partner?.displayName || partner?.email || "Connected";
      setPartnerId(incomingRequest.from);
      setPartnerName(name);
      setPartnerPic(partner?.photoURL || null);
      setIncomingRequest(null);
      setMessage("Partner connected!");
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const handleDeclinePartner = async () => {
    try {
      await declinePartnerRequest(user.uid);
      setMessage("Partner request declined.");
      setIncomingRequest(null);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const handleDisconnectPartner = async () => {
    try {
      await disconnectPartner(user.uid, partnerId);
      setPartnerId("");
      setPartnerName("Not connected");
      setPartnerPic(null);
      setAnniversary("");
      setMessage("Partner disconnected.");
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const handleAnniversaryChange = async (e) => {
    const newDate = e.target.value;
    setAnniversary(newDate);

    try {
      await updateAnniversaryForBoth(user.uid, partnerId, newDate);
      setMessage("Anniversary date updated.");
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  let years = 0;
  let months = 0;
  if (anniversary) {
    const then = new Date(anniversary);
    const now = new Date();
    years = now.getFullYear() - then.getFullYear();
    months = now.getMonth() - then.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years < 0) years = 0;
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card updated-layout">
          <div className="profile-user">
            <img src={previewPic} alt="You" className="profile-avatar" />
            <h3>{currentName || "Unnamed Adventurer"}</h3>
          </div>
          <div className="anniversary-text">
            <span id="heart">♥️</span>
            {years > 0 && (
              <span>
                {years} {years === 1 ? "year" : "years"}
              </span>
            )}
            {months > 0 && (
              <span>
                {months} {months === 1 ? "month" : "months"}
              </span>
            )}
            {years === 0 && months === 0 && <span>Just started 💕</span>}
          </div>
          <div className="profile-partner">
            {partnerPic ? (
              <img src={partnerPic} alt="Partner" className="profile-avatar" />
            ) : (
              <div className="profile-avatar placeholder-avatar" />
            )}
            <h3>{partnerName}</h3>
          </div>
        </div>

        <h2>Edit Profile</h2>

        <div className="profile-section">
          <label>Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePicChange}
          />
        </div>

        <div className="profile-section">
          <label>Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
          />
          <button onClick={handleDisplayNameChange}>Update Name</button>
        </div>

        <div className="profile-section">
          <label>Change Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter your current password"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter a new password"
          />
          <button onClick={handlePasswordChange}>Update Password</button>
        </div>

        <div className="profile-section">
          <label>Partner</label>
          {partnerId ? (
            <button onClick={handleDisconnectPartner}>
              Disconnect Partner
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter partner's email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
              />
              <button onClick={handlePartnerConnect}>Send Invite</button>
            </>
          )}
        </div>

        {incomingRequest && (
          <div className="profile-section">
            <label>Incoming Partner Request</label>
            <p>
              You have a request from <strong>{incomingRequest.email}</strong>
            </p>
            <button onClick={handleAcceptPartner}>Accept</button>
            <button onClick={handleDeclinePartner}>Decline</button>
          </div>
        )}

        {partnerId && (
          <div className="profile-section">
            <label>Anniversary Date</label>
            <input
              type="date"
              value={anniversary}
              onChange={handleAnniversaryChange}
            />
          </div>
        )}

        {message && <p className="profile-message">{message}</p>}
      </div>
    </>
  );
}
