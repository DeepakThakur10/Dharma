import asyncHandler from 'express-async-handler';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Message from '../models/Message.js';
import Workspace from '../models/Workspace.js';
import Task from '../models/Task.js';
import AiUsage from '../models/AiUsage.js';
import mongoose from 'mongoose';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Log AI usage to database
 */
const logUsage = async (workspaceId, userId, feature, prompt, response, tokens = 0) => {
    try {
        await AiUsage.create({
            workspace: workspaceId,
            user: userId,
            feature,
            tokensUsed: tokens,
            prompt: prompt.substring(0, 500), // Truncate for storage efficiency
            response: response.substring(0, 1000)
        });
    } catch (err) {
        console.error('Usage logging failed:', err.message);
    }
};

/**
 * Build workspace-aware system prompt
 */
const buildWorkspaceContext = async (workspaceId) => {
    if (!workspaceId) return 'General context (no workspace selected).';

    let context = '';
    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return 'Workspace not found.';

        const now = new Date();
        const tasks = await Task.find({ workspace: workspaceId }).limit(20).sort({ updatedAt: -1 });

        const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'done');
        const completedTasks = tasks.filter(t => t.status === 'done');
        const criticalTasks = tasks.filter(t => t.priority === 'critical');

        context += `Workspace: ${workspace.name}\n`;
        context += `Workspace Health Summary: Total Tasks: ${tasks.length}, Overdue: ${overdueTasks.length}, Critical: ${criticalTasks.length}, Completed: ${completedTasks.length}.\n`;

        if (tasks.length > 0) {
            context += `Detailed Asset List (Top 20):\n`;
            tasks.forEach(t => {
                const isOverdue = t.deadline && new Date(t.deadline) < now && t.status !== 'done';
                const deadlineStr = t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A';
                context += `- [${t.status.toUpperCase()}] ${t.title} | Priority: ${t.priority} | Deadline: ${deadlineStr}${isOverdue ? ' **(OVERDUE)**' : ''}\n`;
            });
        }
    } catch (err) {
        console.error('Context mapping failed:', err.message);
        return 'Context unavailable due to system error.';
    }

    return context;
};

// @desc    Chat with AI assistant in workspace context (Streaming)
// @route   POST /api/ai/chat
export const chatWithAi = asyncHandler(async (req, res) => {
    const { message, workspaceId } = req.body;
    const userId = req.user._id;

    const context = await buildWorkspaceContext(workspaceId);
    const systemPrompt = `You are Dharma AI, an enterprise project assistant. 
    Context: ${context}
    Provide helpful, concise, and professional advice.`;

    // Save user message (persistent)
    await Message.create({ user: userId, role: 'user', text: message });

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const chat = model.startChat({
        history: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'I am ready to help you with ' + (workspaceId ? 'your workspace.' : 'anything.') }] }
        ]
    });

    try {
        const result = await chat.sendMessageStream(message);
        let fullResponse = '';

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            // Send chunk to client in SSE format
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }

        // Save assistant message once finished
        const finalMsg = await Message.create({ user: userId, role: 'assistant', text: fullResponse });

        // Send final message metadata (like _id)
        res.write(`data: ${JSON.stringify({ done: true, message: finalMsg })}\n\n`);
        res.end();

        await logUsage(workspaceId, userId, 'chat', message, fullResponse);
    } catch (err) {
        console.error('Streaming error detailed:', {
            message: err.message,
            stack: err.stack,
            cause: err.cause,
            status: err.status,
            name: err.name
        });
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
});

// @desc    Get AI chat history
// @route   GET /api/ai/history
export const getChatHistory = asyncHandler(async (req, res) => {
    const messages = await Message.find({ user: req.user._id })
        .sort({ createdAt: 1 })
        .limit(50);
    res.json(messages);
});

// @desc    Clear AI chat history
// @route   DELETE /api/ai/history
export const clearChatHistory = asyncHandler(async (req, res) => {
    await Message.deleteMany({ user: req.user._id });
    res.status(204).send();
});

// @desc    Break down a task into subtasks
// @route   POST /api/ai/breakdown
export const breakdownTask = asyncHandler(async (req, res) => {
    const { taskId, workspaceId } = req.body;
    const task = await Task.findById(taskId);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const prompt = `Break down the task "${task.title}" with description "${task.description || 'N/A'}" into a JSON array of subtask objects with "title" and "description" fields. Max 5 subtasks.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().replace(/```json|```/g, '');
    const subtasksData = JSON.parse(responseText);

    // Create subtasks in the same hierarchy
    const subtasks = await Promise.all(subtasksData.map(st => Task.create({
        title: st.title,
        description: st.description,
        workspace: task.workspace,
        spaceId: task.spaceId,
        folderId: task.folderId,
        listId: task.listId,
        status: 'todo',
        createdBy: req.user._id,
        customFieldValues: { parentTask: task._id } // Fixed field name to customFieldValues
    })));

    await logUsage(workspaceId, req.user._id, 'breakdown', prompt, responseText);

    res.json(subtasks);
});

// @desc    Analyze workspace health and risks
// @route   GET /api/ai/analyze/:workspaceId
export const analyzeWorkspaceHealth = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const tasks = await Task.find({ workspace: workspaceId });

    const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        critical: tasks.filter(t => t.priority === 'critical').length,
        overdue: tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length
    };

    const prompt = `Analyze this project data: ${JSON.stringify(stats)}. 
    Identify 3 major risks and suggest action items. Format as Markdown.`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    await logUsage(workspaceId, req.user._id, 'risk-analysis', prompt, analysis);

    res.json({ stats, analysis });
});

// @desc    Provide AI suggestions for fields
// @route   POST /api/ai/suggest
export const suggestAiContent = asyncHandler(async (req, res) => {
    const { text, fieldType, title, workspaceId } = req.body;

    const prompt = `As an AI project assistant, provide a short, professional suggestion (max 20 words) for a ${fieldType} field titled "${title}". 
    Current input: "${text || ''}"
    Return ONLY the suggested additional text.`;

    try {
        const result = await model.generateContent(prompt);
        const suggestion = result.response.text().trim();

        if (workspaceId) {
            await logUsage(workspaceId, req.user._id, 'autocomplete', prompt, suggestion);
        }

        res.json({ suggestion });
    } catch (err) {
        // Handle common AI errors gracefully (Rate Limit, Not Found, etc.)
        const isRateLimit = err.message?.includes('exhausted') || err.message?.includes('429');
        const isNotFound = err.message?.includes('404') || err.message?.includes('not found');

        console.error('AI Suggestion Error:', err.message);

        if (isRateLimit || isNotFound) {
            // Return empty 200 instead of 500 to keep UI clean
            return res.json({ suggestion: '', meta: { error: isRateLimit ? 'rate_limit' : 'not_found' } });
        }

        res.status(500).json({ message: 'AI suggestion failed', error: err.message });
    }
});
