const User = require('../models/User');

const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (user) {
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      phone: user.phone,
      cnicImageUrl: user.cnicImageUrl,
      isVerified: user.isVerified,
      walletBalance: user.walletBalance,
      bio: user.bio,
      skills: user.skills,
      avgRating: user.avgRating,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const uploadCnic = async (req, res) => {
  const { cnicUrl } = req.body;

  if (!cnicUrl) {
    return res.status(400).json({ message: 'No CNIC URL provided' });
  }

  try {
    const user = await User.findById(req.user.id);
    user.cnicImageUrl = cnicUrl;
    user.isVerified = false; // Admin needs to verify it
    await user.save();

    res.json({
      message: 'CNIC uploaded successfully',
      cnicImageUrl: user.cnicImageUrl,
      isVerified: user.isVerified
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving CNIC to profile' });
  }
};

module.exports = { getMe, uploadCnic };
