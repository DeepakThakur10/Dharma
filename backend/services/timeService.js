import TimeEntry from '../models/TimeEntry.js';
import mongoose from 'mongoose';
import { logActivity } from './activityService.js';

export const startTime = async (timeData, userId) => {
    const { taskId, workspaceId, note, isBillable } = timeData;

    // Check if there's already a running timer for this user in this workspace
    const runningTimer = await TimeEntry.findOne({
        user: userId,
        workspace: workspaceId,
        isRunning: true
    });

    if (runningTimer) {
        throw new Error('You already have a timer running in this workspace. Stop it first.');
    }

    const timeEntry = await TimeEntry.create({
        workspace: workspaceId,
        task: taskId,
        user: userId,
        startTime: new Date(),
        note,
        isBillable,
        isRunning: true
    });

    await logActivity({
        workspaceId,
        userId,
        actionType: 'TIME_STARTED',
        entityType: 'task',
        entityId: taskId,
        metadata: { timeEntryId: timeEntry._id }
    });

    return timeEntry;
};

export const stopTime = async (id, userId) => {
    const timeEntry = await TimeEntry.findById(id);

    if (!timeEntry) throw new Error('Time entry not found');
    if (timeEntry.user.toString() !== userId.toString()) throw new Error('User not authorized');
    if (!timeEntry.isRunning) throw new Error('Timer is already stopped');

    const endTime = new Date();
    const duration = Math.floor((endTime - timeEntry.startTime) / 1000); // seconds

    timeEntry.endTime = endTime;
    timeEntry.duration = duration;
    timeEntry.isRunning = false;

    await timeEntry.save();

    await logActivity({
        workspaceId: timeEntry.workspace,
        userId,
        actionType: 'TIME_STOPPED',
        entityType: 'task',
        entityId: timeEntry.task,
        metadata: { timeEntryId: id, duration }
    });

    return timeEntry;
};

export const getWeeklyReport = async (workspaceId, userId) => {
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    return await TimeEntry.aggregate([
        {
            $match: {
                workspace: new mongoose.Types.ObjectId(workspaceId),
                user: userId,
                startTime: { $gte: startOfWeek }
            }
        },
        {
            $group: {
                _id: {
                    day: { $dayOfWeek: "$startTime" },
                    isBillable: "$isBillable"
                },
                totalDuration: { $sum: "$duration" },
                entries: { $push: "$$ROOT" }
            }
        },
        { $sort: { "_id.day": 1 } }
    ]);
};
