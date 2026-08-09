const Gig = require('../models/Gig');

const createGig = async (req, res) => {
  const { title, description, category, price, city, deliveryDays } = req.body;

  const gig = await Gig.create({
    title,
    description,
    category,
    price,
    city,
    deliveryDays,
    freelancer: req.user.id
  });

  res.status(201).json(gig);
};

const getGigs = async (req, res) => {
  const { city, category, freelancer } = req.query;
  const filter = {};

  if (city) filter.city = new RegExp(city, 'i');
  if (category) filter.category = new RegExp(category, 'i');
  if (freelancer) filter.freelancer = freelancer;

  const gigs = await Gig.find(filter).populate('freelancer', 'name avgRating isVerified');
  res.json(gigs);
};

const getGigById = async (req, res) => {
  const gig = await Gig.findById(req.params.id).populate('freelancer', 'name avgRating isVerified bio skills');

  if (!gig) {
    return res.status(404).json({ message: 'Gig not found' });
  }

  res.json(gig);
};

const updateGig = async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    return res.status(404).json({ message: 'Gig not found' });
  }

  if (gig.freelancer.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update this gig' });
  }

  const updatedGig = await Gig.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedGig);
};

const deleteGig = async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    return res.status(404).json({ message: 'Gig not found' });
  }

  if (gig.freelancer.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this gig' });
  }

  await gig.deleteOne();
  res.json({ message: 'Gig removed' });
};

module.exports = { createGig, getGigs, getGigById, updateGig, deleteGig };
