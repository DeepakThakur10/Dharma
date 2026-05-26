import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/auth.js';
import * as bookmarkService from '../services/bookmarkService.js';

const router = express.Router();

// @desc    Get all user bookmarks
// @route   GET /api/bookmarks
router.get('/', protect, asyncHandler(async (req, res) => {
    const bookmarks = await bookmarkService.getUserBookmarks(req.user._id);
    res.json(bookmarks);
}));

// @desc    Create a bookmark
// @route   POST /api/bookmarks
router.post('/', protect, asyncHandler(async (req, res) => {
    const bookmark = await bookmarkService.createBookmark(req.body, req.user._id);
    res.status(201).json(bookmark);
}));

// @desc    Delete a bookmark
// @route   DELETE /api/bookmarks/:id
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    await bookmarkService.deleteBookmark(req.params.id, req.user._id);
    res.json({ message: 'Bookmark removed' });
}));

export default router;
