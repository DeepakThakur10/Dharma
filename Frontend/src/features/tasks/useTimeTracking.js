import { useState, useEffect, useRef } from 'react';
import api from '../../lib/axios';

/**
 * useTimeTracking — manages a per-task timer with backend persistence.
 *
 * Usage:
 *   const { isRunning, seconds, startTimer, stopTimer, fetchReport } = useTimeTracking();
 */
export function useTimeTracking() {
    const [isRunning, setIsRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [currentEntryId, setCurrentEntryId] = useState(null);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);

    // Tick the local counter every second while running
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    /**
     * Start a timer for a specific task in a workspace.
     * @param {string} taskId
     * @param {string} workspaceId
     * @param {object} opts  - optional { note, isBillable }
     */
    const startTimer = async (taskId, workspaceId, opts = {}) => {
        setError(null);
        try {
            const { data } = await api.post('/api/time/start', {
                taskId,
                workspaceId,
                note: opts.note,
                isBillable: opts.isBillable ?? true,
            });
            setCurrentEntryId(data._id);
            setSeconds(0);
            setIsRunning(true);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to start timer';
            setError(msg);
            throw new Error(msg);
        }
    };

    /**
     * Stop the currently running timer.
     */
    const stopTimer = async () => {
        if (!currentEntryId) return;
        setError(null);
        setIsRunning(false);
        clearInterval(intervalRef.current);
        try {
            const { data } = await api.post(`/api/time/stop/${currentEntryId}`);
            setCurrentEntryId(null);
            setSeconds(0);
            return data; // Return the saved TimeEntry for callers
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to stop timer';
            setError(msg);
            throw new Error(msg);
        }
    };

    /**
     * Fetch this week's time report for a workspace.
     * @param {string} workspaceId
     * @returns {Promise<Array>} aggregated daily report
     */
    const fetchReport = async (workspaceId) => {
        const { data } = await api.get('/api/time/report/weekly', {
            params: { workspaceId },
        });
        return data;
    };

    const formatTime = (totalSeconds) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return { isRunning, seconds, currentEntryId, error, startTimer, stopTimer, fetchReport, formatTime };
}
