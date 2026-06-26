import express from 'express';
import Comment from '../models/Comment.js';
import { verifyToken, requireActiveUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', verifyToken, requireActiveUser, async (req, res) => {
  try {
    const comment = await Comment.create({
      ...req.body,
      authorId: req.user.id,
      authorName: req.body.authorName,
      authorPhoto: req.body.authorPhoto || '',
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', verifyToken, requireActiveUser, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.authorId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    comment.text = req.body.text;
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', verifyToken, requireActiveUser, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
