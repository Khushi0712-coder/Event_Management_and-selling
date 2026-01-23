import SellTicket from "../models/SellTicket.js";

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
