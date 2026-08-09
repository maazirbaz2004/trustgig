const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');

const createReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  if (booking.status !== 'completed') {
    return res.status(400).json({ message: 'Can only review completed bookings' });
  }

  // Only client can review freelancer in this MVP, but we can make it bi-directional if needed
  if (booking.client.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Only the client can leave a review for this booking' });
  }

  const existingReview = await Review.findOne({ booking: bookingId, reviewer: req.user.id });
  if (existingReview) {
    return res.status(400).json({ message: 'You have already reviewed this booking' });
  }

  const review = await Review.create({
    booking: booking._id,
    reviewer: req.user.id,
    reviewee: booking.freelancer,
    rating,
    comment
  });

  // Recalculate average rating
  const reviews = await Review.find({ reviewee: booking.freelancer });
  const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

  const freelancer = await User.findById(booking.freelancer);
  freelancer.avgRating = avgRating;
  await freelancer.save();

  res.status(201).json(review);
};

module.exports = { createReview };
