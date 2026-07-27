import VisitorStat from '../models/VisitorStat.js';

const getTodayDateString = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

import User from '../models/User.js';

export const getStats = async (req, res) => {
  try {
    const allStats = await VisitorStat.find();
    let totalDownloads = 0;
    allStats.forEach(stat => {
      totalDownloads += stat.downloads || 0;
    });

    // We can still send the recent 30 days for chart if needed, but let's just send everything needed
    const stats = await VisitorStat.find().sort({ date: -1 }).limit(30);
    const totalUsers = await User.countDocuments();
    const allUsers = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({ stats, totalUsers, totalDownloads, allUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recordVisit = async (req, res) => {
  try {
    const today = getTodayDateString();
    let stat = await VisitorStat.findOne({ date: today });
    
    if (!stat) {
      stat = await VisitorStat.create({ date: today, views: 1, downloads: 0 });
    } else {
      stat.views += 1;
      await stat.save();
    }
    
    res.json({ message: 'Visit recorded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recordDownload = async (req, res) => {
  try {
    const today = getTodayDateString();
    let stat = await VisitorStat.findOne({ date: today });
    
    if (!stat) {
      stat = await VisitorStat.create({ date: today, views: 0, downloads: 1 });
    } else {
      stat.downloads += 1;
      await stat.save();
    }
    
    res.json({ message: 'Download recorded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
