import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

export const TOAD_CONFIG = {
  packageId: import.meta.env.VITE_TOAD_PACKAGE_ID || '0x0',
  module: 'kanban',
  clockId: '0x6', // shared object clock
  registryId: import.meta.env.VITE_TOAD_REGISTRY_ID || '0x0', // shared BoardRegistry
};

export function buildCreateBoardTx(
  name: string,
  description: string,
  columns: string[],
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::create_board`,
    arguments: [
      tx.pure.string(name),
      tx.pure.string(description),
      tx.pure.vector('string', columns),
      tx.object(TOAD_CONFIG.registryId),
      tx.object(TOAD_CONFIG.clockId),
    ],
  });

  return tx;
}

export function buildDeleteBoardTx(
  boardId: string,
  capId: string,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::delete_board`,
    arguments: [
      tx.object(boardId),
      tx.object(capId),
    ],
  });

  return tx;
}

export function buildUpdateBoardColumnsTx(
  boardId: string,
  capId: string,
  columns: string[],
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::update_board_columns`,
    arguments: [
      tx.object(boardId),
      tx.object(capId),
      tx.pure.vector('string', columns),
    ],
  });

  return tx;
}

export function buildAddMemberTx(
  boardId: string,
  capId: string,
  memberAddress: string,
  role: number,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::add_member`,
    arguments: [
      tx.object(boardId),
      tx.object(capId),
      tx.pure.address(memberAddress),
      tx.pure.u8(role),
      tx.object(TOAD_CONFIG.registryId),
    ],
  });

  return tx;
}

export function buildUpdateMemberRoleTx(
  boardId: string,
  capId: string,
  memberAddress: string,
  newRole: number,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::update_member_role`,
    arguments: [
      tx.object(boardId),
      tx.object(capId),
      tx.pure.address(memberAddress),
      tx.pure.u8(newRole),
    ],
  });

  return tx;
}

export function buildRemoveMemberTx(
  boardId: string,
  capId: string,
  memberAddress: string,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::remove_member`,
    arguments: [
      tx.object(boardId),
      tx.object(capId),
      tx.pure.address(memberAddress),
    ],
  });

  return tx;
}

export interface CreateTaskParams {
  boardId: string;
  title: string;
  description: string;
  column: string;
  priority?: number;            // u8 option
  dueAtMs?: string;             // u64 option (ms)
  assignees: string[];          // vector<address>
  milestone?: string;           // option<string>
  tags: string[];               // vector<string>
  isEncrypted: boolean;         // bool
  ciphertext?: Uint8Array;      // option<vector<u8>>
  teamId?: string | number;     // u64
}

export function buildCreateTaskTx(params: CreateTaskParams) {
  const tx = new Transaction();

  const priorityArg = tx.pure.option('u8', params.priority ?? null);
  const dueAtMsArg = tx.pure.option('u64', params.dueAtMs ? BigInt(params.dueAtMs) : null);
  const milestoneArg = tx.pure.option('string', params.milestone ?? null);
  const ciphertextArg = tx.pure.option(
    'vector<u8>',
    params.ciphertext ? Array.from(params.ciphertext) : null,
  );
  const teamId = params.teamId !== undefined ? BigInt(params.teamId) : 0n;

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::create_task`,
    arguments: [
      tx.object(params.boardId),
      tx.pure.string(params.title),
      tx.pure.string(params.description),
      tx.pure.string(params.column),
      priorityArg,
      dueAtMsArg,
      tx.pure.vector('address', params.assignees),
      milestoneArg,
      tx.pure.vector('string', params.tags),
      tx.pure.bool(params.isEncrypted),
      ciphertextArg,
      tx.pure.u64(teamId),
      tx.object(TOAD_CONFIG.clockId),
    ],
  });

  return tx;
}

export function buildUpdateTaskPositionTx(
  boardId: string,
  taskId: string,
  newColumn: string,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::update_task_position`,
    arguments: [
      tx.object(boardId),
      tx.pure.id(taskId),
      tx.pure.string(newColumn),
      tx.object(TOAD_CONFIG.clockId),
    ],
  });

  return tx;
}

export function buildUpdateTaskDetailsTx(
  boardId: string,
  taskId: string,
  title: string,
  description: string,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::update_task_details`,
    arguments: [
      tx.object(boardId),
      tx.pure.id(taskId),
      tx.pure.string(title),
      tx.pure.string(description),
      tx.object(TOAD_CONFIG.clockId),
    ],
  });

  return tx;
}

export function buildSetTaskDueDateTx(
  boardId: string,
  taskId: string,
  dueAtMs: string,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::set_task_due_date`,
    arguments: [
      tx.object(boardId),
      tx.pure.id(taskId),
      tx.pure.u64(dueAtMs),
      tx.object(TOAD_CONFIG.clockId),
    ],
  });

  return tx;
}

export function buildAssignTaskTx(
  boardId: string,
  taskId: string,
  assignees: string[],
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::assign_task`,
    arguments: [
      tx.object(boardId),
      tx.pure.id(taskId),
      tx.pure.vector('address', assignees),
      tx.object(TOAD_CONFIG.clockId),
    ],
  });

  return tx;
}

export function buildSetTaskMilestoneTx(
  boardId: string,
  taskId: string,
  milestone: string,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::set_task_milestone`,
    arguments: [
      tx.object(boardId),
      tx.pure.id(taskId),
      tx.pure.string(milestone),
      tx.object(TOAD_CONFIG.clockId),
    ],
  });

  return tx;
}

export function buildSetTaskTagsTx(
  boardId: string,
  taskId: string,
  tags: string[],
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::set_task_tags`,
    arguments: [
      tx.object(boardId),
      tx.pure.id(taskId),
      tx.pure.vector('string', tags),
      tx.object(TOAD_CONFIG.clockId),
    ],
  });

  return tx;
}

export function buildSetTaskPriorityTx(
  boardId: string,
  taskId: string,
  priority: number,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::set_task_priority`,
    arguments: [
      tx.object(boardId),
      tx.pure.id(taskId),
      tx.pure.u8(priority),
      tx.object(TOAD_CONFIG.clockId),
    ],
  });

  return tx;
}

export function buildDeleteTaskTx(
  boardId: string,
  taskId: string,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::delete_task`,
    arguments: [
      tx.object(boardId),
      tx.pure.id(taskId),
    ],
  });

  return tx;
}

export function buildCreateSubtaskTx(
  boardId: string,
  taskId: string,
  title: string,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::create_subtask`,
    arguments: [
      tx.object(boardId),
      tx.pure.id(taskId),
      tx.pure.string(title),
      tx.object(TOAD_CONFIG.clockId),
    ],
  });

  return tx;
}

export function buildToggleSubtaskDoneTx(
  boardId: string,
  taskId: string,
  subtaskId: string,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::toggle_subtask_done`,
    arguments: [
      tx.object(boardId),
      tx.pure.id(taskId),
      tx.pure.id(subtaskId),
    ],
  });

  return tx;
}

export function buildAddCommentTx(
  boardId: string,
  taskId: string,
  body: string,
  isEncrypted: boolean,
  ciphertext?: Uint8Array,
) {
  const tx = new Transaction();

  const ciphertextArg = tx.pure.option(
    'vector<u8>',
    ciphertext ? Array.from(ciphertext) : null,
  );

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::add_comment`,
    arguments: [
      tx.object(boardId),
      tx.pure.id(taskId),
      tx.pure.string(body),
      tx.pure.bool(isEncrypted),
      ciphertextArg,
      tx.object(TOAD_CONFIG.clockId),
    ],
  });

  return tx;
}

export function buildAddReactionTx(
  boardId: string,
  taskId: string,
  commentId: string,
  emoji: string,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${TOAD_CONFIG.packageId}::${TOAD_CONFIG.module}::add_reaction`,
    arguments: [
      tx.object(boardId),
      tx.pure.id(taskId),
      tx.pure.id(commentId),
      tx.pure.string(emoji),
      tx.object(TOAD_CONFIG.clockId),
    ],
  });

  return tx;
}
