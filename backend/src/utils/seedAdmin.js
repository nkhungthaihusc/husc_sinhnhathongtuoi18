import User from '../models/User.js';

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin account already exists. Skipping seeding.');
      return;
    }

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const studentId = process.env.ADMIN_STUDENTID || 'ADMIN001';

    const admin = new User({
      username,
      password,
      role: 'admin',
      studentId,
      status: 'active',
    });

    await admin.save();
    console.log(`✅ Default admin created: ${username}`);
  } catch (err) {
    console.error('❌ Error creating default admin:', err);
  }
};

export default seedAdmin;
