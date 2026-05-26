import crypto from 'crypto';
import Workspace from '../models/Workspace.js';

/**
 * Dharma API Key Service
 * Handles generation and secure hashing of API keys
 */
class ApiKeyService {
    /**
     * Generate a new API key pair
     * Returns { rawKey, hashedKey }
     */
    generateKeyPair() {
        const rawKey = `mh_${crypto.randomBytes(24).toString('hex')}`;
        const hashedKey = this.hashKey(rawKey);
        return { rawKey, hashedKey };
    }

    /**
     * Hash a raw API key using SHA-256
     */
    hashKey(rawKey) {
        return crypto.createHash('sha256').update(rawKey).digest('hex');
    }

    /**
     * Validate an API key and return the workspace
     */
    async validateKey(rawKey) {
        const hashedKey = this.hashKey(rawKey);
        const workspace = await Workspace.findOne({ 'apiKeys.key': hashedKey });
        return workspace;
    }

    /**
     * Add a new API key to a workspace
     */
    async addKeyToWorkspace(workspaceId, name) {
        const { rawKey, hashedKey } = this.generateKeyPair();

        await Workspace.findByIdAndUpdate(workspaceId, {
            $push: { apiKeys: { key: hashedKey, name, createdAt: new Date() } }
        });

        return rawKey; // Return the raw key ONLY ONCE upon creation
    }
}

export default new ApiKeyService();
