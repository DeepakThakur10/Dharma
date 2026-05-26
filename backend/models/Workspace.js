import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member', 'guest', 'project_lead', 'project_manager', 'employee'],
            default: 'member'
        }
    }],
    settings: {
        logo: String,
        themeColor: { type: String, default: '#ff6b35' },
        tier: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' }
    },
    subscription: {
        stripeCustomerId: String,
        stripeSubscriptionId: String,
        status: { type: String, enum: ['active', 'canceled', 'past_due', 'incomplete'], default: 'incomplete' },
        currentPeriodEnd: Date
    },
    apiKeys: [{
        key: String, // Hashed API Key
        name: String,
        lastUsed: Date,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });


const Workspace = mongoose.model('Workspace', workspaceSchema);

export default Workspace;
