import 'dotenv/config';
import mongoose from 'mongoose';
import AutomationRule from '../models/AutomationRule.js';

const cleanupRules = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await AutomationRule.deleteMany({});
        console.log(`Deleted ${result.deletedCount} automation rules.`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Cleanup Error:', error);
        process.exit(1);
    }
};

cleanupRules();
