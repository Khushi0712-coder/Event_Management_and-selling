import SellTicket from "../models/SellTicket.js";

/* USER: Submit sell ticket */
export const sellTicket = async (req, res) => {
  try {
    const ticket = await SellTicket.create({
      user: req.user.id,
      eventName: req.body.eventName,
      location: req.body.location,
      eventDate: req.body.eventDate,
      originalPrice: req.body.originalPrice,
      expectedPrice: req.body.expectedPrice,
      reason: req.body.reason,
      proofFile: req.file?.filename,
    });

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Sell ticket failed" });
  }
};

/* USER: Get my sell tickets */
export const getMySoldTickets = async (req, res) => {
  try {
    const tickets = await SellTicket.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sell tickets" });
  }
};
