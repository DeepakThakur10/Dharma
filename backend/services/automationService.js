import AutomationRule from '../models/AutomationRule.js';
import Task from '../models/Task.js';
import User from '../models/User.js'; // For notifications if needed

import { logActivity } from './activityService.js';
import * as notificationService from './notificationService.js';

class AutomationService {
    async getRules(workspaceId) {
        return await AutomationRule.find({ workspaceId });
    }

    async createRule(workspaceId, ruleData, userId) {
        const { trigger, action, isActive, projectId, name } = ruleData;
        const rule = await AutomationRule.create({
            workspaceId,
            projectId,
            name,
            trigger,
            action,
            isActive: isActive !== undefined ? isActive : true,
            createdBy: userId
        });

        await logActivity({
            workspaceId,
            userId,
            actionType: 'RULE_CREATED',
            entityType: 'workspace',
            entityId: rule._id,
            metadata: { triggerType: trigger.type, actionType: action.type, projectId }
        });

        return rule;
    }

    async updateRule(id, updateData, userId) {
        const rule = await AutomationRule.findById(id);
        if (!rule) throw new Error('Automation rule not found');

        Object.assign(rule, updateData);
        const updatedRule = await rule.save();

        await logActivity({
            workspaceId: rule.workspaceId,
            userId,
            actionType: 'RULE_UPDATED',
            entityType: 'workspace',
            entityId: id,
            metadata: { isActive: rule.isActive }
        });

        return updatedRule;
    }

    async deleteRule(id, userId) {
        const rule = await AutomationRule.findById(id);
        if (!rule) throw new Error('Automation rule not found');

        const workspaceId = rule.workspaceId;

        await rule.deleteOne();

        await logActivity({
            workspaceId,
            userId,
            actionType: 'RULE_DELETED',
            entityType: 'workspace',
            entityId: id
        });

        return { success: true };
    }

    /**
     * Evaluate rules when a task is created or updated
     * @param {string} workspaceId 
     * @param {Object} task - current task state
     */
    async evaluate(workspaceId, task) {
        try {
            // Find rules that are:
            // 1. In this workspace
            // 2. Active
            // 3. Either workspace-wide (no projectId) OR specific to this task's project
            const rules = await AutomationRule.find({
                workspaceId: workspaceId,
                isActive: true,
                $or: [
                    { projectId: { $exists: false } },
                    { projectId: null },
                    { projectId: task.listId } // Frontend uses listId for projects in some places, checking both
                ]
            });

            // Note: If task doesn't have a projectId/listId, only workspace-wide rules trigger.
            // If it does, both workspace-wide and project-specific rules trigger.

            for (const rule of rules) {
                if (this.checkTrigger(rule.trigger, task)) {
                    await this.executeAction(rule.action, task);
                }
            }
        } catch (err) {
            console.error('Automation Engine Error:', err.message);
        }
    }

    checkTrigger(trigger, task) {
        const { field, value } = trigger;

        // Check for array fields (like assignees)
        if (Array.isArray(task[field])) {
            return task[field].some(v => String(v?._id || v) === String(value));
        }

        // Check standard fields
        if (task[field] !== undefined) {
            return String(task[field]) === String(value);
        }

        // Check custom fields
        if (task.customFieldValues && task.customFieldValues.get(field) !== undefined) {
            return String(task.customFieldValues.get(field)) === String(value);
        }

        return false;
    }

    async executeAction(action, task) {
        const { type, value } = action;
        const Workspace = (await import('../models/Workspace.js')).default;

        switch (type) {
            case 'move_status':
                if (task.status !== value) {
                    task.status = value;
                    await task.save();
                    console.log(`Automation: Moved task ${task._id} to status ${value}`);
                }
                break;

            case 'assign_user':
                if (String(task.assignees?.[0] || '') !== String(value)) {
                    task.assignees = [value];
                    await task.save();
                    console.log(`Automation: Assigned task ${task._id} to user ${value}`);
                }
                break;

            case 'notify':
                console.log(`Automation Notification: [Task ${task.title}] - ${value}`);
                break;

            case 'notify_admin': {
                const workspace = await Workspace.findById(task.workspace);
                if (workspace) {
                    const admins = workspace.members.filter(m => ['admin', 'owner', 'project_lead'].includes(m.role));
                    admins.forEach(admin => {
                        console.log(`Automation: Notify Admin (${admin.user}) for task ${task.title}: ${value}`);
                        // Here you'd trigger a real notification (email/push/in-app)
                    });
                }
                break;
            }

            case 'notify_creator': {
                console.log(`Automation: Notify Creator (${task.createdBy}) for task ${task.title}: ${value}`);
                break;
            }

            case 'notify_all': {
                const workspace = await Workspace.findById(task.workspace);
                if (workspace) {
                    for (const member of workspace.members) {
                        await notificationService.createNotification({
                            recipient: member.user,
                            type: 'task_updated',
                            title: 'Workspace Update',
                            message: `Automation: ${value}`,
                            workspace: task.workspace,
                            data: { taskId: task._id }
                        });
                        console.log(`Automation: Notified Member (${member.user}) for task ${task.title}`);
                    }
                }
                break;
            }

            case 'notify_assignee': {
                if (task.assignees && task.assignees.length > 0) {
                    for (const assigneeId of task.assignees) {
                        await notificationService.createNotification({
                            recipient: assigneeId,
                            type: 'task_assigned',
                            title: 'Task Assigned',
                            message: `You have been assigned to: ${task.title}`,
                            workspace: task.workspace,
                            data: { taskId: task._id }
                        });
                        console.log(`Automation: Notified Assignee (${assigneeId}) for task ${task.title}`);
                    }
                }
                break;
            }

            default:
                break;
        }
    }

    /**
     * Legacy trigger method for compatibility while refactoring
     */
    async trigger(workspaceId, eventType, context) {
        // We'll call evaluate for status changes and creations
        if (['task_status_changed', 'task_created'].includes(eventType)) {
            await this.evaluate(workspaceId, context.task);
        }
    }
}

export default new AutomationService();
