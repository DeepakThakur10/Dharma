import asyncHandler from 'express-async-handler';
import * as timeService from '../services/timeService.js';

// @desc    Start a timer for a task
// @route   POST /api/enterprise/time/start
// @access  Private
export const startTime = asyncHandler(async (req, res) => {
    const timeEntry = await timeService.startTime(req.body, req.user._id);
    res.status(201).json(timeEntry);
});

// @desc    Stop a running timer
// @route   POST /api/enterprise/time/stop/:id
// @access  Private
export const stopTime = asyncHandler(async (req, res) => {
    const timeEntry = await timeService.stopTime(req.params.id, req.user._id);
    res.json(timeEntry);
});

// @desc    Get user's weekly time report for a workspace
// @route   GET /api/enterprise/time/report/weekly
// @access  Private
export const getWeeklyReport = asyncHandler(async (req, res) => {
    const report = await timeService.getWeeklyReport(req.query.workspaceId, req.user._id);
    res.json(report);
});
