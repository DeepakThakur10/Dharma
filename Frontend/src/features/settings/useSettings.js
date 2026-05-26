import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

// Custom Fields
export const useCustomFields = (workspaceId) => {
    return useQuery({
        queryKey: ['custom-fields', workspaceId],
        queryFn: async () => {
            const { data } = await api.get(`/api/workspaces/${workspaceId}/custom-fields`);
            return data;
        },
        enabled: !!workspaceId
    });
};

export const useCreateCustomField = () => {
    const qc = useQueryClient();
    return useMutation({
        /** @param {{ workspaceId: string, fieldData: any }} variables */
        mutationFn: async ({ workspaceId, fieldData }) => {
            const { data } = await api.post(`/api/workspaces/${workspaceId}/custom-fields`, fieldData);
            return data;
        },
        onSuccess: (data, variables) => {
            qc.invalidateQueries({ queryKey: ['custom-fields', variables.workspaceId] });
            toast.success('Custom field created');
        }
    });
};

export const useUpdateCustomField = () => {
    const qc = useQueryClient();
    return useMutation({
        /** @param {{ id: string, fieldData: any }} variables */
        mutationFn: ({ id, fieldData }) => api.put(`/api/custom-fields/${id}`, fieldData).then(r => r.data),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['custom-fields'] });
            toast.success('Custom field updated');
        }
    });
};

export const useDeleteCustomField = () => {
    const qc = useQueryClient();
    return useMutation({
        /** @param {{ id: string, workspaceId: string }} variables */
        mutationFn: ({ id }) => api.delete(`/api/custom-fields/${id}`),
        onSuccess: (data, variables) => {
            const { workspaceId } = variables;
            qc.invalidateQueries({ queryKey: ['custom-fields', workspaceId] });
            toast.success('Custom field removed');
        }
    });
};

// Automation Rules
export const useAutomationRules = (workspaceId) => {
    return useQuery({
        queryKey: ['automation-rules', workspaceId],
        queryFn: async () => {
            const { data } = await api.get(`/api/workspaces/${workspaceId}/automation`);
            return data;
        },
        enabled: !!workspaceId
    });
};

export const useCreateAutomationRule = () => {
    const qc = useQueryClient();
    return useMutation({
        /** @param {{ workspaceId: string, ruleData: any }} variables */
        mutationFn: ({ workspaceId, ruleData }) => api.post(`/api/workspaces/${workspaceId}/automation`, ruleData).then(r => r.data),
        onSuccess: (data, { workspaceId }) => {
            qc.invalidateQueries({ queryKey: ['automation-rules', workspaceId] });
            toast.success('Automation rule created');
        }
    });
};

export const useUpdateAutomationRule = () => {
    const qc = useQueryClient();
    return useMutation({
        /** @param {{ id: string, ruleData: any }} variables */
        mutationFn: ({ id, ruleData }) => api.put(`/api/automation/${id}`, ruleData).then(r => r.data),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['automation-rules'] });
            toast.success('Automation rule updated');
        }
    });
};

export const useDeleteAutomationRule = () => {
    const qc = useQueryClient();
    return useMutation({
        /** @param {{ id: string, workspaceId: string }} variables */
        mutationFn: ({ id }) => api.delete(`/api/automation/${id}`),
        onSuccess: (data, variables) => {
            const { workspaceId } = variables;
            qc.invalidateQueries({ queryKey: ['automation-rules', workspaceId] });
            toast.success('Automation rule removed');
        }
    });
};
