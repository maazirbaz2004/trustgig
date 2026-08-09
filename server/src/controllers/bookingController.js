const Booking = require('../models/Booking');
const Gig = require('../models/Gig');
const User = require('../models/User');
const { fundEscrow, releaseEscrow } = require('../services/escrowService');

const createBooking = async (req, res) => {
  const { gigId } = req.body;
  const gig = await Gig.findById(gigId);

  if (!gig) {
    return res.status(404).json({ message: 'Gig not found' });
  }

  const client = await User.findById(req.user.id);
  
  if (gig.freelancer.toString() === client._id.toString()) {
    return res.status(400).json({ message: 'Cannot book your own gig' });
  }

  const booking = new Booking({
    gig: gig._id,
    client: client._id,
    freelancer: gig.freelancer,
    amount: gig.price,
    status: 'funded'
  });

  try {
    await fundEscrow(client, gig.price, booking._id);
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deliverBooking = async (req, res) => {
  const { deliveryNotes } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  if (booking.freelancer.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (booking.status !== 'funded') {
    return res.status(400).json({ message: 'Booking cannot be delivered in current status' });
  }

  booking.status = 'delivered';
  booking.deliveryNotes = deliveryNotes;
  await booking.save();

  res.json(booking);
};

const approveBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  if (booking.client.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (booking.status !== 'delivered') {
    return res.status(400).json({ message: 'Booking is not in delivered status' });
  }

  await releaseEscrow(booking.freelancer, booking.amount, booking._id);
  
  booking.status = 'completed';
  await booking.save();

  res.json(booking);
};

const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({
    $or: [{ client: req.user.id }, { freelancer: req.user.id }]
  }).populate('gig client freelancer');
  res.json(bookings);
};

module.exports = { createBooking, deliverBooking, approveBooking, getMyBookings };
