import Feedback from '../models/Feedback.js';
import { sendEmail } from '../utils/email.js';

export const submitFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    const feedback = await Feedback.create({
      name,
      email,
      message
    });

    // Notify owner
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: `New Feedback from ${name}`,
      text: `Message: ${message} \n\nFrom: ${email}`,
      html: `<p><strong>New Feedback</strong></p><p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`
    });

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
