const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');

const createDispute = async (req, res) => {
  const { bookingId, reason } = req.body;
  
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  if (booking.client.toString() !== req.user.id && booking.freelancer.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to dispute this booking' });
  }

  let evidenceUrl = null;
  if (req.file) {
    const cloudinary = require('../config/cloudinary');
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    try {
      const result = await cloudinary.uploader.upload(dataURI, { folder: 'trustgig/disputes' });
      evidenceUrl = result.secure_url;
    } catch (error) {
      return res.status(500).json({ message: 'Error uploading evidence' });
    }
  }

  const dispute = await Dispute.create({
    booking: booking._id,
    raisedBy: req.user.id,
    reason,
    evidenceUrl
  });

  booking.status = 'disputed';
  await booking.save();

  res.status(201).json(dispute);
};

module.exports = { createDispute };
