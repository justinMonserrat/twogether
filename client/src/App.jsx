import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home";
import Activities from "./components/pages/Activities";
import Profile from "./components/pages/Profile";
//import Journal from "./components/pages/Journal";
//import Explore from "./components/pages/Explore";
//import Notes from "./components/pages/Notes";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import PrivateRoute from "./routes/PrivateRoute";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

/*
      <Route path="/journal" element={<Journal />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/notes" element={<Notes />} />
*/
