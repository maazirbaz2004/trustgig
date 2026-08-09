require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Gig = require('../src/models/Gig');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing
    await User.deleteMany();
    await Gig.deleteMany();

    // Create password hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@trustgig.com',
      passwordHash,
      role: 'admin',
      isVerified: true
    });

    // Create Client
    const client = await User.create({
      name: 'John Client',
      email: 'client@trustgig.com',
      passwordHash,
      role: 'client',
      walletBalance: 10000,
      isVerified: true,
      city: 'Karachi'
    });

    // Create Freelancers
    const freelancer1 = await User.create({
      name: 'Alice Coder',
      email: 'alice@trustgig.com',
      passwordHash,
      role: 'freelancer',
      isVerified: true,
      city: 'Lahore',
      bio: 'Expert full stack developer',
      skills: ['React', 'Node.js', 'MongoDB']
    });

    const freelancer2 = await User.create({
      name: 'Bob Designer',
      email: 'bob@trustgig.com',
      passwordHash,
      role: 'freelancer',
      isVerified: true,
      city: 'Islamabad',
      bio: 'Creative UI/UX Designer',
      skills: ['Figma', 'Photoshop']
    });

    // Create Gigs
    await Gig.create([
      {
        title: 'I will build a full stack MERN application',
        description: 'Complete web application with frontend and backend.',
        category: 'Web Development',
        price: 500,
        freelancer: freelancer1._id,
        city: freelancer1.city,
        deliveryDays: 7
      },
      {
        title: 'I will fix bugs in your React app',
        description: 'Quick bug fixing and performance optimization.',
        category: 'Web Development',
        price: 150,
        freelancer: freelancer1._id,
        city: freelancer1.city,
        deliveryDays: 2
      },
      {
        title: 'I will design a modern landing page in Figma',
        description: 'High converting landing page design with responsive layouts.',
        category: 'Design',
        price: 200,
        freelancer: freelancer2._id,
        city: freelancer2.city,
        deliveryDays: 3
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
