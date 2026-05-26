import mongoose from 'mongoose';

const bookmarkSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            default: 'General'
        }
    },
    {
        timestamps: true,
    }
);

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;
