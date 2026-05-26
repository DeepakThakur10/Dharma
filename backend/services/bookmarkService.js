import Bookmark from '../models/Bookmark.js';

export const getUserBookmarks = async (userId) => {
    return await Bookmark.find({ user: userId }).sort({ createdAt: -1 });
};

export const createBookmark = async (bookmarkData, userId) => {
    const { title, url, category } = bookmarkData;
    return await Bookmark.create({
        user: userId,
        title,
        url,
        category
    });
};

export const deleteBookmark = async (id, userId) => {
    const bookmark = await Bookmark.findById(id);
    if (!bookmark) throw new Error('Bookmark not found');
    if (bookmark.user.toString() !== userId.toString()) {
        throw new Error('Not authorized to delete this bookmark');
    }

    await bookmark.deleteOne();
    return { success: true };
};
