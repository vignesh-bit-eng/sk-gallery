import User from '../models/User.js';

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    let dbQuery = {};
    
    // Only search owners and artists, not customers
    dbQuery.role = { $in: ['owner', 'artist'] };

    if (query) {
      dbQuery.name = { $regex: query, $options: 'i' };
    }

    const users = await User.find(dbQuery).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      await user.save();
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        artistUploadCount: user.artistUploadCount,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
