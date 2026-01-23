import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Events from "./pages/Events";
import SellTicket from "./pages/SellTicket";
import Contact from "./pages/Contact";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Profile from "./pages/Profile";

import AdminDashboard from "./pages/AdminDashboard";

import AdminContacts from "./pages/AdminContacts";

function App() {
  return (
    <BrowserRouter>
      {/* ✅ Navbar is GLOBAL */}
      <Navbar />

      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/sell-ticket" element={<SellTicket />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/admin/contacts" element={<AdminContacts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
