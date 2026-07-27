import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Artwork from '../models/Artwork.js';
import { sendEmail } from '../utils/email.js';

export const submitTransaction = async (req, res) => {
  try {
    const { transactionId, type, amount, artworkId } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      artwork: artworkId || null,
      transactionId,
      type,
      amount: Number(amount)
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: 'Pending' })
      .populate('user', 'name email')
      .populate('artwork', 'title');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user')
      .populate('artwork');
      
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = 'Verified';
    await transaction.save();

    if (transaction.type === 'ArtworkPurchase') {
      // Send receipt and download link
      const downloadLink = `${process.env.FRONTEND_URL}/download/${transaction.artwork._id}`;
      await sendEmail({
        to: transaction.user.email,
        subject: 'Payment Verified - Download your artwork',
        text: `Your payment of ₹${transaction.amount} has been verified. You can now download ${transaction.artwork.title}.`,
        html: `<p>Your payment of ₹${transaction.amount} has been verified.</p>
               <p>You can now download <strong>${transaction.artwork.title}</strong> using the link below:</p>
               <a href="${downloadLink}">Download Artwork</a>`
      });
    } else if (transaction.type === 'ArtistUploadSlot') {
      // Reset artist upload count so they can upload 5 more
      const user = await User.findById(transaction.user._id);
      if (user) {
        user.artistUploadCount = 0; // Reset to 0 so they get 5 free again
        await user.save();
      }

      await sendEmail({
        to: transaction.user.email,
        subject: 'Payment Verified - Upload Slot Unlocked',
        text: `Your payment of ₹${transaction.amount} has been verified. You can now upload more artworks.`,
        html: `<p>Your payment of ₹${transaction.amount} has been verified.</p>
               <p>You can now upload more artworks to the SK Art Gallery.</p>`
      });
    }

    res.json({ message: 'Transaction verified' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('user');
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = 'Rejected';
    await transaction.save();

    await sendEmail({
      to: transaction.user.email,
      subject: 'Payment Rejected',
      text: `Your payment with transaction ID ${transaction.transactionId} has been rejected. Please contact the owner.`,
      html: `<p>Your payment with transaction ID ${transaction.transactionId} has been rejected. Please contact the owner.</p>`
    });

    res.json({ message: 'Transaction rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
