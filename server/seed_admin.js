require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    let admin = await User.findOne({ email: 'admin@trustgig.com' });
    
    if (admin) {
      // Force update password and role just in case
      admin.passwordHash = passwordHash;
      admin.role = 'admin';
      await admin.save();
      console.log('Admin already existed, but password was reset!');
      console.log('Credentials: admin@trustgig.com / admin123');
      process.exit(0);
    }

    admin = await User.create({
      name: 'System Admin',
      email: 'admin@trustgig.com',
      passwordHash,
      phone: '03001234567',
      role: 'admin',
      isVerified: true
    });

    console.log('Admin account created successfully!');
    console.log('Email: admin@trustgig.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
