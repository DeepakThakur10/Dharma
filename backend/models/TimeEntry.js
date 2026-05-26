import mongoose from 'mongoose';

const timeEntrySchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
        index: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, // duration in seconds
        default: 0
    },
    note: String,
    isBillable: {
        type: Boolean,
        default: true
    },
    isRunning: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index for reporting
timeEntrySchema.index({ workspace: 1, user: 1, startTime: 1 });

const TimeEntry = mongoose.model('TimeEntry', timeEntrySchema);

export default TimeEntry;
