import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, Column, Board, Comment, Priority, Status } from '../types';
import { mockColumns } from '../data/mockData';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { buildCreateBoardTx, buildCreateTaskTx, buildAddMemberTx, TOAD_CONFIG } from '../lib/toadSuiClient';

interface TaskContextType {
  tasks: Task[];
  columns: Column[];
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  lastError: string | null;
  members: { address: string; role: number }[];
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, targetColumnId: string) => void;
  addBoard: (board: Omit<Board, 'id' | 'columns'> & { members?: string[] }) => Promise<void>;
  switchBoard: (boardId: string) => void;
  addComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  addMember: (boardId: string, wallet: string, role?: number) => Promise<void>;
  loadBoardById: (boardId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

function slugify(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-');
}

function titleFromSlug(columns: Column[] | undefined, slug: string) {
  const col = columns?.find(c => c.id === slug);
  return col ? col.title : slug.replace(/-/g, ' ');
}

function priorityToU8(priority?: string): number | undefined {
  if (!priority) return undefined;
  if (priority === 'low') return 0;
  if (priority === 'medium') return 1;
  if (priority === 'high') return 2;
  return undefined;
}

function priorityFromOption(opt: any): string | undefined {
  if (!opt || opt === null) return undefined;
  const val = opt as number;
  if (val === 0) return 'low';
  if (val === 1) return 'medium';
  if (val === 2) return 'high';
  return undefined;
}

function optionToValue(opt: any): string | undefined {
  if (!opt || opt === null) return undefined;
  return `${opt}`;
}

function normalizeId(val: any): string | null {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (typeof (val as any).id === 'string') return (val as any).id;
    if (typeof (val as any).bytes === 'string') return (val as any).bytes;
    if (typeof (val as any).value === 'string') return (val as any).value;
  }
  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function columnColor(slug: string): string {
  switch (slug) {
    case 'backlog':
      return 'slate';
    case 'planned':
      return 'blue';
    case 'in-progress':
      return 'amber';
    case 'blocked':
      return 'red';
    case 'done':
      return 'emerald';
    default:
      return 'slate';
  }
}

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [members, setMembers] = useState<{ address: string; role: number }[]>([]);
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    if (!account?.address) {
      setBoards([]);
      setTasks([]);
      setCurrentBoardId('');
    } else {
      fetchBoards();
    }
  }, [account?.address]);

  useEffect(() => {
    if (boards.length > 0 && !currentBoardId) {
      setCurrentBoardId(boards[0].id);
    }
  }, [boards, currentBoardId]);

  useEffect(() => {
    if (currentBoardId) {
      fetchTasksForBoard(currentBoardId);
    }
  }, [currentBoardId]);

  const mapBoard = (boardId: string, content: any): Board => {
    const cols = (content.columns as string[]) || [];
    return {
      id: boardId,
      name: content.name as string,
      description: content.description as string,
      columns: (cols.length > 0 ? cols : ['Backlog', 'Planned', 'In Progress', 'Blocked', 'Done']).map((c) => {
        const id = slugify(c);
        return {
          id,
          title: c,
          color: columnColor(id),
          statusLabel: c,
          tasks: [],
        };
      }),
    };
  };

  const fetchBoards = async () => {
    setLoading(true);
    setLastError(null);
    if (!account?.address) {
      setBoards([]);
      setTasks([]);
      setCurrentBoardId('');
      setLoading(false);
      return;
    }

    const boardsFound: Board[] = [];

    // Prefer registry for discovery (works for members of shared boards)
    if (TOAD_CONFIG.registryId && TOAD_CONFIG.registryId !== '0x0') {
      try {
        const regEntry = await suiClient.getDynamicFieldObject({
          parentId: TOAD_CONFIG.registryId,
          name: {
            type: 'address',
            value: account.address,
          },
        });
        const entryFields = (regEntry.data?.content as any)?.fields;
        const boardsVec = entryFields?.value?.fields?.boards as string[] | undefined;
        if (boardsVec && boardsVec.length > 0) {
          for (const boardId of boardsVec) {
            try {
              const obj = await suiClient.getObject({
                id: boardId,
                options: { showContent: true, showOwner: true, showType: true },
              });
              const content = (obj.data?.content as any)?.fields;
              if (!content) continue;
              boardsFound.push(mapBoard(boardId, content));
            } catch (e) {
              console.warn('Failed to load board from registry', boardId, e);
            }
          }
        }
      } catch (e) {
        // no registry entry for this address
        console.warn('No registry entry for address', account.address, e);
      }
    }

    // Fallback: discover via BoardOwnerCap (creator/admin owns the cap; board is shared)
    if (boardsFound.length === 0) {
      const caps = await suiClient.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::BoardOwnerCap`,
        },
        options: { showContent: true },
      });
      for (const cap of caps.data || []) {
        const fields = (cap.data?.content as any)?.fields;
        const boardId = fields?.board_id as string | undefined;
        if (!boardId) continue;
        try {
          const obj = await suiClient.getObject({
            id: boardId,
            options: { showContent: true, showOwner: true, showType: true },
          });
          const content = (obj.data?.content as any)?.fields;
          if (!content) continue;
          boardsFound.push(mapBoard(boardId, content));
        } catch (e) {
          console.warn('Failed to load board by cap', boardId, e);
        }
      }
    }

    setBoards(boardsFound);
    if (boardsFound[0] && !currentBoardId) setCurrentBoardId(boardsFound[0].id);
    setLoading(false);
  };

  const fetchTasksForBoard = async (boardId: string) => {
    // Fetch board to get task_ids, then load each task object directly
    const boardObj = await suiClient.getObject({
      id: boardId,
      options: { showContent: true, showOwner: true, showType: true },
    });
    const bFields = (boardObj.data?.content as any)?.fields;
    // Fetch members from members table (dynamic fields)
    const membersTableId: string | undefined =
      bFields?.members?.fields?.id?.id ||
      bFields?.members?.fields?.id?.bytes ||
      bFields?.members?.fields?.id;
    if (membersTableId) {
      try {
        const memberDfs = await suiClient.getDynamicFields({ parentId: membersTableId });
        const memberEntries = await Promise.all(
          memberDfs.data.map(async (df) => {
            try {
              const addr = (df.name as any)?.value as string | undefined;
              if (!addr) return null;
              const valObj = await suiClient.getDynamicFieldObject({
                parentId: membersTableId,
                name: {
                  type: 'address',
                  value: addr,
                },
              });
              const roleVal = (valObj.data?.content as any)?.fields?.value as number | undefined;
              return { address: addr, role: roleVal ?? 1 };
            } catch (e) {
              console.warn('Failed to load member entry', df, e);
              return null;
            }
          }),
        );
        setMembers(memberEntries.filter(Boolean) as { address: string; role: number }[]);
      } catch (e) {
        console.warn('Failed to load members table', membersTableId, e);
        setMembers([]);
      }
    } else {
      setMembers([]);
    }
    const rawIds: any[] = Array.isArray(bFields?.task_ids) ? bFields.task_ids : [];
    let taskIds: string[] = rawIds
      .map((v) => normalizeId(v))
      .filter((v): v is string => !!v);

    // Fallback: if task_ids not present, discover via dynamic fields
    if (taskIds.length === 0) {
      const dfs = await suiClient.getDynamicFields({ parentId: boardId });
      const taskEntries = dfs.data.filter((d) => d.name?.type?.includes('TaskKey'));
      taskIds = taskEntries.map((d) => {
        const maybe = normalizeId((d.name as any)?.value?.task_id);
        return maybe || d.objectId;
      });
    }

    console.log('[TOAD] Fetching tasks for board', boardId, 'taskIds:', taskIds);

    const taskObjs = await Promise.all(taskIds.map(async (taskId) => {
      try {
        const obj = await suiClient.getObject({
          id: taskId,
          options: { showContent: true, showOwner: true, showType: true },
        });
        let fields = (obj.data?.content as any)?.fields;

        // If direct fetch failed, try dynamic field path
        if (!fields) {
          try {
            const dfObj = await suiClient.getDynamicFieldObject({
              parentId: boardId,
              name: {
                type: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::TaskKey`,
                value: { task_id: taskId },
              },
            });
            fields = (dfObj.data?.content as any)?.fields?.value?.fields;
          } catch (e2) {
            console.warn('[TOAD] Dynamic field fetch failed for task', taskId, e2);
          }
        }

        if (!fields) {
          console.warn('[TOAD] Task has no fields', taskId);
          return null;
        }
        const priority = (priorityFromOption(fields.priority) || 'medium') as Priority;
        const tags = Array.isArray(fields.tags) ? (fields.tags as string[]) : [];
        const assignees: any[] = [];
        const comments: any[] = [];
        const subtasks: any[] = [];
        const dueDateVal = optionToValue(fields.due_at_ms);
        const columnSlug = slugify(fields.column) as Status;

        const task: Task = {
          id: taskId,
          title: (fields.title as string) || 'Untitled Task',
          description: (fields.description as string) || '',
          status: columnSlug,
          priority,
          assignees,
          tags,
          columnId: columnSlug,
          comments,
          subtasks,
          dueDate: dueDateVal,
          boardId,
          suiObjectId: taskId,
          suiOwner: (obj.data?.owner as any)?.AddressOwner || undefined,
        };
        console.log('[TOAD] Task loaded', task);
        return task;
      } catch (e) {
        console.warn('[TOAD] Failed to load task', taskId, e);
        return null;
      }
    }));
    const filtered = taskObjs.filter(Boolean) as Task[];
    console.log('[TOAD] Completed fetch, tasks count:', filtered.length);
    setTasks(filtered);
  };

  const currentBoard = boards.find(b => b.id === currentBoardId) || boards[0] || null;

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    if (!currentBoard) return;
    const columnName = titleFromSlug(currentBoard.columns, taskData.columnId || taskData.status || 'backlog');
    const tx = buildCreateTaskTx({
      boardId: currentBoard.id,
      title: taskData.title || '',
      description: taskData.description || '',
      column: columnName,
      priority: priorityToU8(taskData.priority),
      dueAtMs: taskData.dueDate ? `${new Date(taskData.dueDate).getTime()}` : undefined,
      assignees: [],
      milestone: undefined,
      tags: taskData.tags || [],
      isEncrypted: false,
      ciphertext: undefined,
      teamId: 0,
    });
    const result = await signAndExecute({ transaction: tx });
    await suiClient.waitForTransaction({ digest: result.digest });
    await sleep(5000);
    await fetchTasksForBoard(currentBoard.id);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const moveTask = (taskId: string, targetColumnId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, columnId: targetColumnId, status: targetColumnId as any };
      }
      return task;
    }));
  };

  const addBoard = async (boardData: Omit<Board, 'id' | 'columns'>) => {
    const defaultColumns = ['Backlog', 'Planned', 'In Progress', 'Blocked', 'Done'];
    const tx = buildCreateBoardTx(boardData.name, boardData.description, defaultColumns);
    const result = await signAndExecute({ transaction: tx });
    const receipt = await suiClient.waitForTransaction({
      digest: result.digest,
      options: { showEffects: true, showObjectChanges: true },
    });
    await sleep(5000);

    let createdBoardId: string | null = null;
    const changes = receipt.objectChanges || [];
    for (const change of changes) {
      if (
        change.type === 'created' &&
        typeof change.objectType === 'string' &&
        change.objectType.endsWith(`${TOAD_CONFIG.module}::Board`)
      ) {
        createdBoardId = change.objectId;
        break;
      }
    }

    await fetchBoards();
    if (createdBoardId) {
      setCurrentBoardId(createdBoardId);
    }

    // Add members if provided
    const members = (boardData as any).members as string[] | undefined;
    if (createdBoardId && members && members.length > 0) {
      // fetch owner caps
      const caps = await suiClient.getOwnedObjects({
        owner: account!.address!,
        filter: { StructType: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::BoardOwnerCap` },
        options: { showContent: true },
      });
      let capId: string | null = null;
      for (const c of caps.data || []) {
        const fields = (c.data?.content as any)?.fields;
        if (fields?.board_id === createdBoardId) {
          capId = c.data!.objectId;
          break;
        }
      }
      if (!capId && caps.data?.[0]) {
        capId = caps.data[0].data!.objectId;
      }

      if (capId) {
        for (const m of members) {
          try {
            const addTx = buildAddMemberTx(createdBoardId, capId, m, 1); // contributor role
            const addRes = await signAndExecute({ transaction: addTx });
            await suiClient.waitForTransaction({ digest: addRes.digest });
          } catch (e) {
            console.warn('Failed to add member', m, e);
          }
        }
      }
    }
  };

  const findOwnerCapId = async (boardId: string): Promise<string | null> => {
    if (!account?.address) return null;
    const caps = await suiClient.getOwnedObjects({
      owner: account.address,
      filter: { StructType: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::BoardOwnerCap` },
      options: { showContent: true },
    });
    for (const c of caps.data || []) {
      const fields = (c.data?.content as any)?.fields;
      if (fields?.board_id === boardId) {
        return c.data!.objectId;
      }
    }
    return null;
  };

  const addMember = async (boardId: string, wallet: string, role = 1) => {
    const capId = await findOwnerCapId(boardId);
    if (!capId) {
      throw new Error('No BoardOwnerCap found for this board');
    }
    const addTx = buildAddMemberTx(boardId, capId, wallet, role);
    const res = await signAndExecute({ transaction: addTx });
    await suiClient.waitForTransaction({ digest: res.digest });
  };

  const switchBoard = (boardId: string) => {
    setCurrentBoardId(boardId);
  };

  const addComment = (taskId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...commentData,
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, comments: [...(task.comments || []), newComment] }
        : task
    ));
  };

  const loadBoardById = async (boardId: string) => {
    // If already loaded, just switch
    const existing = boards.find(b => b.id === boardId);
    if (existing) {
      setCurrentBoardId(boardId);
      await fetchTasksForBoard(boardId);
      return;
    }

    // Fetch board even if not owned
    const obj = await suiClient.getObject({
      id: boardId,
      options: { showContent: true, showOwner: true, showType: true },
    });
    const fields = (obj.data?.content as any)?.fields;
    if (!fields) throw new Error('Board not found or has no content');
    const cols = (fields.columns as string[]) || [];
    const board: Board = {
      id: boardId,
      name: fields.name as string,
      description: fields.description as string,
      columns: (cols.length > 0 ? cols : ['Backlog', 'Planned', 'In Progress', 'Blocked', 'Done']).map((c) => {
        const id = slugify(c);
        return {
          id,
          title: c,
          color: columnColor(id),
          statusLabel: c,
          tasks: [],
        };
      }),
    };
    setBoards(prev => [...prev, board]);
    setCurrentBoardId(boardId);
    await fetchTasksForBoard(boardId);
  };

  const columns: Column[] = (currentBoard?.columns || mockColumns).map(col => ({
    ...col,
    tasks: tasks.filter(t => t.columnId === col.id),
  }));

  return (
    <TaskContext.Provider value={{
      tasks,
      columns,
      boards,
      currentBoard,
      loading,
      lastError,
      members,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      addBoard,
      switchBoard,
      addComment,
      addMember,
      loadBoardById,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
