import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  buildCreateBoardTx,
  buildDeleteBoardTx,
  buildUpdateBoardColumnsTx,
  buildAddMemberTx,
  buildUpdateMemberRoleTx,
  buildRemoveMemberTx,
  buildCreateTaskTx,
  buildUpdateTaskPositionTx,
  buildUpdateTaskDetailsTx,
  buildSetTaskDueDateTx,
  buildAssignTaskTx,
  buildSetTaskMilestoneTx,
  buildSetTaskTagsTx,
  buildSetTaskPriorityTx,
  buildDeleteTaskTx,
  buildCreateSubtaskTx,
  buildToggleSubtaskDoneTx,
  buildAddCommentTx,
  buildAddReactionTx,
  CreateTaskParams,
  suiClient,
} from '../lib/toadSuiClient';

export function useCreateBoard() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      columns: string[];
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildCreateBoardTx(params.name, params.description, params.columns);

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

export function useDeleteBoard() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { boardId: string; capId: string }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildDeleteBoardTx(params.boardId, params.capId);

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

export function useUpdateBoardColumns() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      capId: string;
      columns: string[];
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildUpdateBoardColumnsTx(
        params.boardId,
        params.capId,
        params.columns,
      );

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
    },
  });
}

export function useAddMember() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      capId: string;
      memberAddress: string;
      role: number;
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildAddMemberTx(
        params.boardId,
        params.capId,
        params.memberAddress,
        params.role,
      );

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
    },
  });
}

export function useUpdateMemberRole() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      capId: string;
      memberAddress: string;
      newRole: number;
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildUpdateMemberRoleTx(
        params.boardId,
        params.capId,
        params.memberAddress,
        params.newRole,
      );

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
    },
  });
}

export function useRemoveMember() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      capId: string;
      memberAddress: string;
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildRemoveMemberTx(
        params.boardId,
        params.capId,
        params.memberAddress,
      );

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
    },
  });
}

export function useCreateTask() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateTaskParams) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildCreateTaskTx(params);

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.boardId] });
    },
  });
}

export function useUpdateTaskPosition() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      taskId: string;
      newColumn: string;
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildUpdateTaskPositionTx(
        params.boardId,
        params.taskId,
        params.newColumn,
      );

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useUpdateTaskDetails() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      taskId: string;
      title: string;
      description: string;
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildUpdateTaskDetailsTx(
        params.boardId,
        params.taskId,
        params.title,
        params.description,
      );

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useSetTaskDueDate() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      taskId: string;
      dueAtMs: string;
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildSetTaskDueDateTx(
        params.boardId,
        params.taskId,
        params.dueAtMs,
      );

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useAssignTask() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      taskId: string;
      assignees: string[];
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildAssignTaskTx(params.boardId, params.taskId, params.assignees);

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useSetTaskMilestone() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      taskId: string;
      milestone: string;
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildSetTaskMilestoneTx(
        params.boardId,
        params.taskId,
        params.milestone,
      );

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useSetTaskTags() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      taskId: string;
      tags: string[];
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildSetTaskTagsTx(params.boardId, params.taskId, params.tags);

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useSetTaskPriority() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      taskId: string;
      priority: number;
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildSetTaskPriorityTx(
        params.boardId,
        params.taskId,
        params.priority,
      );

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useDeleteTask() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { boardId: string; taskId: string }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildDeleteTaskTx(params.boardId, params.taskId);

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.boardId] });
    },
  });
}

export function useCreateSubtask() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      taskId: string;
      title: string;
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildCreateSubtaskTx(params.boardId, params.taskId, params.title);

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useToggleSubtaskDone() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      taskId: string;
      subtaskId: string;
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildToggleSubtaskDoneTx(
        params.boardId,
        params.taskId,
        params.subtaskId,
      );

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useAddComment() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      taskId: string;
      body: string;
      isEncrypted: boolean;
      ciphertext?: Uint8Array;
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildAddCommentTx(
        params.boardId,
        params.taskId,
        params.body,
        params.isEncrypted,
        params.ciphertext,
      );

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useAddReaction() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      boardId: string;
      taskId: string;
      commentId: string;
      emoji: string;
    }) => {
      if (!currentAccount?.address) throw new Error('No connected account');

      const tx = buildAddReactionTx(
        params.boardId,
        params.taskId,
        params.commentId,
        params.emoji,
      );

      const result = await signAndExecute({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}
