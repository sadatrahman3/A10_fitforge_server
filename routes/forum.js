import express from 'express';
import ForumPost from '../models/ForumPost.js';
import { verifyToken, requireRole, requireActiveUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.query;
    const total = await ForumPost.countDocuments();
    const posts = await ForumPost.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ posts, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const posts = await ForumPost.find().sort({ createdAt: -1 }).limit(4);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', verifyToken, requireActiveUser, requireRole('trainer', 'admin'), async (req, res) => {
  try {
    const post = await ForumPost.create({
      ...req.body,
      authorId: req.user.id,
      authorName: req.body.authorName,
      authorRole: req.user.role,
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/like', verifyToken, requireActiveUser, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.includes(req.user.id);
    if (alreadyLiked) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.addToSet(req.user.id);
      post.dislikes.pull(req.user.id);
    }
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/dislike', verifyToken, requireActiveUser, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyDisliked = post.dislikes.includes(req.user.id);
    if (alreadyDisliked) {
      post.dislikes.pull(req.user.id);
    } else {
      post.dislikes.addToSet(req.user.id);
      post.likes.pull(req.user.id);
    }
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', verifyToken, requireActiveUser, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (req.user.role !== 'admin' && post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await ForumPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
