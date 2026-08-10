import bcrypt from "bcryptjs";
import SellTicket from "../models/SellTicket.js";
import User from "../models/User.js";

const removePassword = (user) => {
  const data = user.toObject ? user.toObject() : { ...user };
  delete data.password;
  return data;
};

/* ADMIN: Get all users */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ADMIN: Create a new user */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "A user with that email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      phone,
      status: status || "active",
    });

    res.status(201).json(removePassword(newUser));
  } catch (err) {
    res.status(500).json({ message: "Failed to create user" });
  }
};

/* ADMIN: Update an existing user */
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return res.status(409).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    user.name = name || user.name;
    user.role = role || user.role;
    user.phone = phone || user.phone;
    if (status) user.status = status;

    await user.save();
    res.json(removePassword(user));
  } catch (err) {
    res.status(500).json({ message: "Failed to update user" });
  }
};

/* ADMIN: Delete a user */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

/* ADMIN: Update user status */
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["active", "pending", "suspended", "blocked"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = status;
    await user.save();
    res.json(removePassword(user));
  } catch (err) {
    res.status(500).json({ message: "Failed to update user status" });
  }
};

/* ADMIN: Get all sell tickets */
export const getSellTickets = async (req, res) => {
  try {
    const tickets = await SellTicket.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
};

/* ADMIN: Update ticket status */
export const updateSellTicketStatus = async (req, res) => {
  try {
    const ticket = await SellTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.status = req.body.status;
    await ticket.save();

    res.json({ ticket });
  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
};
