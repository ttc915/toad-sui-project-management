module toad::kanban;

use std::string::String;
use std::option::{Self, Option};

use sui::clock::Clock;
use sui::display;
use sui::event;
use sui::table::{Self, Table};
use sui::dynamic_object_field as dof; // Used for Objects (Tasks, Comments)
use sui::dynamic_field as df;         // Used for simple structs (Registry entries)

// ==================== Error Codes ====================

const E_NOT_OWNER: u64 = 1;
const E_INVALID_COLUMN: u64 = 2;
const E_TASK_NOT_IN_BOARD: u64 = 3;
const E_EMPTY_NAME: u64 = 4;
const E_DUPLICATE_COLUMN: u64 = 5;
const E_NOT_MEMBER: u64 = 6;
const E_NOT_ADMIN: u64 = 7;
const E_INVALID_ROLE: u64 = 8;
const E_UNAUTHORIZED: u64 = 9;
const E_COMMENT_NOT_FOUND: u64 = 10;

// ==================== Role Constants ====================

const ROLE_TEAM_MEMBER: u8 = 1;
const ROLE_MANAGER: u8 = 2;
const ROLE_ADMIN: u8 = 3;

// ==================== Core Structures ====================

public struct BoardOwnerCap has key, store {
    id: UID,
    board_id: ID,
    owner: address,
}

public struct Board has key, store {
    id: UID,
    owner: address,
    name: String,
    description: String,
    columns: vector<String>,
    task_ids: vector<ID>,
    members: Table<address, u8>,      // address -> role
    member_team: Table<address, u64>, // address -> team id
    created_at_ms: u64,
    labels: vector<String>,
    milestones: vector<String>,
    version: u64,
}

// Registry for shared boards
public struct BoardRegistry has key, store {
    id: UID,
}

// Simple struct stored via `df` (not `dof`) in Registry
public struct MemberBoards has store {
    boards: vector<ID>,
}

public struct Task has key, store {
    id: UID,
    board_id: ID,
    title: String,
    description: String,
    column: String,
    is_encrypted: bool,
    ciphertext: Option<vector<u8>>,
    created_at_ms: u64,
    updated_at_ms: u64,
    creator: address,
    priority: Option<u8>,
    due_at_ms: Option<u64>,
    assignees: vector<address>,
    milestone: Option<String>,
    tags: vector<String>,
    team_id: u64,
}

public struct Subtask has key, store {
    id: UID,
    task_id: ID,
    title: String,
    done: bool,
}

public struct Comment has key, store {
    id: UID,
    task_id: ID,
    author: address,
    body: String,
    is_encrypted: bool,
    ciphertext: Option<vector<u8>>,
    created_at_ms: u64,
    reactions: vector<String>,
}

// ==================== Dynamic Field Keys ====================

public struct TaskKey has copy, drop, store {
    task_id: ID,
}

public struct SubtaskKey has copy, drop, store {
    subtask_id: ID,
}

public struct CommentKey has copy, drop, store {
    comment_id: ID,
}

// ==================== Events ====================

public struct BoardCreated has copy, drop {
    board_id: ID,
    owner: address,
    created_at_ms: u64,
}

public struct TaskCreated has copy, drop {
    task_id: ID,
    board_id: ID,
    title: String,
    column: String,
    team_id: u64,
    timestamp_ms: u64,
}

public struct TaskMoved has copy, drop {
    task_id: ID,
    board_id: ID,
    from_column: String,
    to_column: String,
    timestamp_ms: u64,
}

public struct TaskUpdated has copy, drop {
    task_id: ID,
    board_id: ID,
    timestamp_ms: u64,
}

public struct CommentAdded has copy, drop {
    comment_id: ID,
    task_id: ID,
    board_id: ID,
    timestamp_ms: u64,
}

public struct ReactionAdded has copy, drop {
    comment_id: ID,
    emoji: String,
    timestamp_ms: u64,
}

public struct SubtaskCreated has copy, drop {
    subtask_id: ID,
    task_id: ID,
    board_id: ID,
    timestamp_ms: u64,
}

// ==================== One-Time-Witness ====================

public struct KANBAN has drop {}

fun init(otw: KANBAN, ctx: &mut TxContext) {
    let publisher = sui::package::claim(otw, ctx);

    let mut board_display = display::new<Board>(&publisher, ctx);
    board_display.add(b"name".to_string(), b"{name}".to_string());
    board_display.add(b"description".to_string(), b"{description}".to_string());
    board_display.add(b"owner".to_string(), b"{owner}".to_string());
    board_display.update_version();
    transfer::public_transfer(board_display, ctx.sender());

    let mut task_display = display::new<Task>(&publisher, ctx);
    task_display.add(b"title".to_string(), b"{title}".to_string());
    task_display.add(b"description".to_string(), b"{description}".to_string());
    task_display.add(b"column".to_string(), b"{column}".to_string());
    task_display.update_version();
    transfer::public_transfer(task_display, ctx.sender());

    transfer::public_transfer(publisher, ctx.sender());
}

// ==================== Helper Functions ====================

fun timestamp_ms(clock: &Clock): u64 {
    clock.timestamp_ms()
}

fun get_role(board: &Board, addr: address): Option<u8> {
    if (board.members.contains(addr)) {
        let role_ref = board.members.borrow(addr);
        option::some(*role_ref)
    } else {
        option::none()
    }
}

fun get_team(board: &Board, addr: address): Option<u64> {
    if (board.member_team.contains(addr)) {
        let t_ref = board.member_team.borrow(addr);
        option::some(*t_ref)
    } else {
        option::none()
    }
}

fun is_manager_or_admin(board: &Board, addr: address): bool {
    if (addr == board.owner) {
        true
    } else {
        let role_opt = get_role(board, addr);
        if (role_opt.is_some()) {
            let role = role_opt.destroy_some();
            role == ROLE_ADMIN || role == ROLE_MANAGER
        } else {
            false
        }
    }
}

fun column_index(board: &Board, col: &String): u64 {
    let len = board.columns.length();
    let mut i = 0;
    while (i < len) {
        if (&board.columns[i] == col) {
            return i
        };
        i = i + 1;
    };
    abort E_INVALID_COLUMN
}

fun task_index(board: &Board, task_id: &ID): u64 {
    let len = board.task_ids.length();
    let mut i = 0;
    while (i < len) {
        if (&board.task_ids[i] == task_id) {
            return i
        };
        i = i + 1;
    };
    abort E_TASK_NOT_IN_BOARD
}

// Note: Using 'dof' (Dynamic Object Field) because Tasks are objects (have 'key')
fun add_task_df(board: &mut Board, task: Task) {
    let key = TaskKey { task_id: object::id(&task) };
    dof::add(&mut board.id, key, task);
}

fun borrow_task_mut(board: &mut Board, task_id: &ID): &mut Task {
    let key = TaskKey { task_id: *task_id };
    dof::borrow_mut<TaskKey, Task>(&mut board.id, key)
}

fun borrow_task(board: &Board, task_id: &ID): &Task {
    let key = TaskKey { task_id: *task_id };
    dof::borrow<TaskKey, Task>(&board.id, key)
}

fun remove_task_df(board: &mut Board, task_id: ID): Task {
    let key = TaskKey { task_id };
    dof::remove<TaskKey, Task>(&mut board.id, key)
}

// Subtasks are also objects
fun add_subtask_df(task: &mut Task, subtask: Subtask) {
    let key = SubtaskKey { subtask_id: object::id(&subtask) };
    dof::add(&mut task.id, key, subtask);
}

fun borrow_subtask_mut(task: &mut Task, subtask_id: &ID): &mut Subtask {
    let key = SubtaskKey { subtask_id: *subtask_id };
    dof::borrow_mut<SubtaskKey, Subtask>(&mut task.id, key)
}

// Comments are objects
fun add_comment_df(task: &mut Task, comment: Comment) {
    let key = CommentKey { comment_id: object::id(&comment) };
    dof::add(&mut task.id, key, comment);
}

fun borrow_comment_mut(task: &mut Task, comment_id: &ID): &mut Comment {
    let key = CommentKey { comment_id: *comment_id };
    dof::borrow_mut<CommentKey, Comment>(&mut task.id, key)
}

fun assert_can_manage_tasks(board: &Board, signer: address) {
    let allowed = is_manager_or_admin(board, signer);
    assert!(allowed, E_NOT_ADMIN);
}

fun assert_can_comment_on_task(board: &Board, task: &Task, signer: address) {
    if (is_manager_or_admin(board, signer)) {
        return
    };

    // Must be a member
    let role_opt = get_role(board, signer);
    assert!(role_opt.is_some(), E_NOT_MEMBER);
    let role = role_opt.destroy_some();

    // Must be team member
    assert!(role == ROLE_TEAM_MEMBER, E_INVALID_ROLE);

    // Must belong to the same team as the task
    let team_opt = get_team(board, signer);
    assert!(team_opt.is_some(), E_NOT_MEMBER);
    let signer_team = team_opt.destroy_some();

    assert!(signer_team == task.team_id, E_UNAUTHORIZED);
}

// ==================== Registry Helpers ====================

// Registry uses `df` (Standard Dynamic Fields) because MemberBoards is just a struct (store), not an object
fun ensure_member_entry(registry: &mut BoardRegistry, member: address): &mut MemberBoards {
    if (!df::exists_(&registry.id, member)) {
        let entry = MemberBoards { boards: vector[] };
        df::add(&mut registry.id, member, entry);
    };
    df::borrow_mut(&mut registry.id, member)
}

fun add_board_to_member(registry: &mut BoardRegistry, member: address, board_id: ID) {
    let entry = ensure_member_entry(registry, member);
    entry.boards.push_back(board_id);
}

// ==================== Board Management ====================

public entry fun create_board(
    name: String,
    description: String,
    columns: vector<String>,
    registry: &mut BoardRegistry,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();

    assert!(name.length() > 0, E_EMPTY_NAME);
    assert!(columns.length() > 0, E_INVALID_COLUMN);

    let len = columns.length();
    let mut i = 0;
    while (i < len) {
        let mut j = i + 1;
        while (j < len) {
            assert!(&columns[i] != &columns[j], E_DUPLICATE_COLUMN);
            j = j + 1;
        };
        i = i + 1;
    };

    let members = table::new<address, u8>(ctx);
    let member_team = table::new<address, u64>(ctx);

    let board = Board {
        id: object::new(ctx),
        owner: sender,
        name,
        description,
        columns,
        task_ids: vector[],
        members,
        member_team,
        created_at_ms: timestamp_ms(clock),
        labels: vector[],
        milestones: vector[],
        version: 1,
    };

    let cap = BoardOwnerCap {
        id: object::new(ctx),
        board_id: object::id(&board),
        owner: sender,
    };

    let board_id = object::id(&board);

    event::emit(BoardCreated {
        board_id,
        owner: sender,
        created_at_ms: board.created_at_ms,
    });

    transfer::share_object(board);
    transfer::transfer(cap, sender);
    add_board_to_member(registry, sender, board_id);
}

public entry fun delete_board(board: Board, owner_cap: BoardOwnerCap, ctx: &mut TxContext) {
    let sender = ctx.sender();
    assert!(owner_cap.owner == sender, E_NOT_OWNER);
    assert!(owner_cap.board_id == object::id(&board), E_NOT_OWNER);
    assert!(board.task_ids.length() == 0, E_TASK_NOT_IN_BOARD);

    let Board {
        id: board_uid,
        owner: _,
        name: _,
        description: _,
        columns: _,
        task_ids: _,
        members,
        member_team,
        created_at_ms: _,
        labels: _,
        milestones: _,
        version: _,
    } = board;

    members.drop();
    member_team.drop();

    let BoardOwnerCap { id: cap_uid, board_id: _, owner: _ } = owner_cap;

    board_uid.delete();
    cap_uid.delete();
}

public entry fun update_board_columns(
    board: &mut Board,
    owner_cap: &BoardOwnerCap,
    new_columns: vector<String>,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    assert!(owner_cap.owner == sender, E_NOT_OWNER);
    assert!(owner_cap.board_id == object::id(board), E_NOT_OWNER);
    assert!(new_columns.length() > 0, E_INVALID_COLUMN);

    board.columns = new_columns;
    board.version = board.version + 1;
}

// ==================== Membership & Teams ====================

public entry fun add_member(
    board: &mut Board,
    owner_cap: &BoardOwnerCap,
    member: address,
    role: u8,
    registry: &mut BoardRegistry,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    assert!(owner_cap.owner == sender, E_NOT_OWNER);
    assert!(owner_cap.board_id == object::id(board), E_NOT_OWNER);
    assert!(role == ROLE_TEAM_MEMBER || role == ROLE_MANAGER || role == ROLE_ADMIN, E_INVALID_ROLE);

    board.members.add(member, role);
    add_board_to_member(registry, member, object::id(board));
}

public entry fun create_registry(ctx: &mut TxContext) {
    let registry = BoardRegistry { id: object::new(ctx) };
    transfer::share_object(registry);
}

public entry fun update_member_role(
    board: &mut Board,
    owner_cap: &BoardOwnerCap,
    member: address,
    new_role: u8,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    assert!(owner_cap.owner == sender, E_NOT_OWNER);
    assert!(owner_cap.board_id == object::id(board), E_NOT_OWNER);
    assert!(
        new_role == ROLE_TEAM_MEMBER || new_role == ROLE_MANAGER || new_role == ROLE_ADMIN,
        E_INVALID_ROLE,
    );

    let role_ref = board.members.borrow_mut(member);
    *role_ref = new_role;
}

public entry fun remove_member(
    board: &mut Board,
    owner_cap: &BoardOwnerCap,
    member: address,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    assert!(owner_cap.owner == sender, E_NOT_OWNER);
    assert!(owner_cap.board_id == object::id(board), E_NOT_OWNER);

    if (board.members.contains(member)) {
        board.members.remove(member);
    };
    if (board.member_team.contains(member)) {
        board.member_team.remove(member);
    };
}

public entry fun assign_member_team(
    board: &mut Board,
    owner_cap: &BoardOwnerCap,
    member: address,
    team_id: u64,
    ctx: &mut TxContext,
) {
    let signer = ctx.sender();
    assert!(owner_cap.owner == signer, E_NOT_OWNER);
    assert!(owner_cap.board_id == object::id(board), E_NOT_OWNER);
    assert!(board.members.contains(member), E_NOT_MEMBER);

    if (board.member_team.contains(member)) {
        let t_ref = board.member_team.borrow_mut(member);
        *t_ref = team_id;
    } else {
        board.member_team.add(member, team_id);
    };
}

// ==================== Task Management ====================

public entry fun create_task(
    board: &mut Board,
    title: String,
    description: String,
    column: String,
    priority: Option<u8>,
    due_at_ms: Option<u64>,
    assignees: vector<address>,
    milestone: Option<String>,
    tags: vector<String>,
    is_encrypted: bool,
    ciphertext: Option<vector<u8>>,
    team_id: u64,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    assert_can_manage_tasks(board, sender);

    column_index(board, &column);

    let now = timestamp_ms(clock);

    let task = Task {
        id: object::new(ctx),
        board_id: object::id(board),
        title,
        description,
        column: column,
        is_encrypted,
        ciphertext,
        created_at_ms: now,
        updated_at_ms: now,
        creator: sender,
        priority,
        due_at_ms,
        assignees,
        milestone,
        tags,
        team_id,
    };

    let task_id = object::id(&task);
    board.task_ids.push_back(task_id);

    event::emit(TaskCreated {
        task_id,
        board_id: object::id(board),
        title,
        column,
        team_id,
        timestamp_ms: now,
    });

    add_task_df(board, task);
}

public entry fun update_task_position(
    board: &mut Board,
    task_id: ID,
    new_column: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let signer = ctx.sender();
    assert_can_manage_tasks(board, signer);

    column_index(board, &new_column);

    let now = timestamp_ms(clock);

    let task_ref = borrow_task_mut(board, &task_id);
    let from_column = task_ref.column;
    task_ref.column = new_column;
    task_ref.updated_at_ms = now;

    event::emit(TaskMoved {
        task_id,
        board_id: object::id(board),
        from_column,
        to_column: new_column,
        timestamp_ms: now,
    });
}

public entry fun update_task_details(
    board: &mut Board,
    task_id: ID,
    new_title: String,
    new_description: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let signer = ctx.sender();
    assert_can_manage_tasks(board, signer);

    let now = timestamp_ms(clock);
    let task_ref = borrow_task_mut(board, &task_id);
    task_ref.title = new_title;
    task_ref.description = new_description;
    task_ref.updated_at_ms = now;

    event::emit(TaskUpdated {
        task_id,
        board_id: object::id(board),
        timestamp_ms: now,
    });
}

public entry fun set_task_due_date(
    board: &mut Board,
    task_id: ID,
    due_at_ms: u64,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let signer = ctx.sender();
    assert_can_manage_tasks(board, signer);

    let now = timestamp_ms(clock);
    let task_ref = borrow_task_mut(board, &task_id);
    task_ref.due_at_ms = option::some(due_at_ms);
    task_ref.updated_at_ms = now;

    event::emit(TaskUpdated {
        task_id,
        board_id: object::id(board),
        timestamp_ms: now,
    });
}

public entry fun assign_task(
    board: &mut Board,
    task_id: ID,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let signer = ctx.sender();
    assert_can_manage_tasks(board, signer);

    let now = timestamp_ms(clock);
    let task_ref = borrow_task_mut(board, &task_id);
    task_ref.assignees = assignees;
    task_ref.updated_at_ms = now;

    event::emit(TaskUpdated {
        task_id,
        board_id: object::id(board),
        timestamp_ms: now,
    });
}

public entry fun set_task_milestone(
    board: &mut Board,
    task_id: ID,
    milestone: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let signer = ctx.sender();
    assert_can_manage_tasks(board, signer);

    let now = timestamp_ms(clock);
    let task_ref = borrow_task_mut(board, &task_id);
    task_ref.milestone = option::some(milestone);
    task_ref.updated_at_ms = now;

    event::emit(TaskUpdated {
        task_id,
        board_id: object::id(board),
        timestamp_ms: now,
    });
}

public entry fun set_task_tags(
    board: &mut Board,
    task_id: ID,
    tags: vector<String>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let signer = ctx.sender();
    assert_can_manage_tasks(board, signer);

    let now = timestamp_ms(clock);
    let task_ref = borrow_task_mut(board, &task_id);
    task_ref.tags = tags;
    task_ref.updated_at_ms = now;

    event::emit(TaskUpdated {
        task_id,
        board_id: object::id(board),
        timestamp_ms: now,
    });
}

public entry fun set_task_priority(
    board: &mut Board,
    task_id: ID,
    priority: u8,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let signer = ctx.sender();
    assert_can_manage_tasks(board, signer);

    let now = timestamp_ms(clock);
    let task_ref = borrow_task_mut(board, &task_id);
    task_ref.priority = option::some(priority);
    task_ref.updated_at_ms = now;

    event::emit(TaskUpdated {
        task_id,
        board_id: object::id(board),
        timestamp_ms: now,
    });
}

public entry fun delete_task(board: &mut Board, task_id: ID, ctx: &mut TxContext) {
    let signer = ctx.sender();
    assert_can_manage_tasks(board, signer);

    let idx = task_index(board, &task_id);
    board.task_ids.remove(idx);

    let task = remove_task_df(board, task_id);
    let Task {
        id: task_uid,
        board_id: _,
        title: _,
        description: _,
        column: _,
        is_encrypted: _,
        ciphertext: _,
        created_at_ms: _,
        updated_at_ms: _,
        creator: _,
        priority: _,
        due_at_ms: _,
        assignees: _,
        milestone: _,
        tags: _,
        team_id: _,
    } = task;

    task_uid.delete();
}

// ==================== Subtask Management ====================

public entry fun create_subtask(
    board: &mut Board,
    task_id: ID,
    title: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let signer = ctx.sender();
    assert_can_manage_tasks(board, signer);

    let now = timestamp_ms(clock);
    let board_id = object::id(board);
    let task_ref = borrow_task_mut(board, &task_id);

    let subtask = Subtask {
        id: object::new(ctx),
        task_id,
        title,
        done: false,
    };

    let subtask_id = object::id(&subtask);

    event::emit(SubtaskCreated {
        subtask_id,
        task_id,
        board_id,
        timestamp_ms: now,
    });

    add_subtask_df(task_ref, subtask);
}

public entry fun toggle_subtask_done(
    board: &mut Board,
    task_id: ID,
    subtask_id: ID,
    ctx: &mut TxContext,
) {
    let signer = ctx.sender();
    assert_can_manage_tasks(board, signer);

    let task_ref = borrow_task_mut(board, &task_id);
    let subtask_ref = borrow_subtask_mut(task_ref, &subtask_id);
    subtask_ref.done = !subtask_ref.done;
}

// ==================== Comment Management ====================

public entry fun add_comment(
    board: &mut Board,
    task_id: ID,
    body: String,
    is_encrypted: bool,
    ciphertext: Option<vector<u8>>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let signer = ctx.sender();

    // Permission check scope (Immutable borrow)
    {
        let t_ref = borrow_task(board, &task_id);
        assert_can_comment_on_task(board, t_ref, signer);
    };

    // Action scope (Mutable borrow)
    let now = timestamp_ms(clock);
    let board_id = object::id(board);
    let task_ref = borrow_task_mut(board, &task_id);

    let comment = Comment {
        id: object::new(ctx),
        task_id,
        author: signer,
        body,
        is_encrypted,
        ciphertext,
        created_at_ms: now,
        reactions: vector[],
    };

    let comment_id = object::id(&comment);

    event::emit(CommentAdded {
        comment_id,
        task_id,
        board_id,
        timestamp_ms: now,
    });

    add_comment_df(task_ref, comment);
}

public entry fun add_reaction(
    board: &mut Board,
    task_id: ID,
    comment_id: ID,
    emoji: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let signer = ctx.sender();

    // Permission check scope (Immutable borrow)
    {
        let t_ref = borrow_task(board, &task_id);
        assert_can_comment_on_task(board, t_ref, signer);
    };

    // Action scope (Mutable borrow)
    let task_ref = borrow_task_mut(board, &task_id);
    let comment_ref = borrow_comment_mut(task_ref, &comment_id);
    comment_ref.reactions.push_back(emoji);

    event::emit(ReactionAdded {
        comment_id,
        emoji,
        timestamp_ms: timestamp_ms(clock),
    });
}

// ==================== Upgradeability ====================

public entry fun upgrade_board_version(
    board: &mut Board,
    owner_cap: &BoardOwnerCap,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    assert!(owner_cap.owner == sender, E_NOT_OWNER);
    assert!(owner_cap.board_id == object::id(board), E_NOT_OWNER);

    board.version = board.version + 1;
}

// ==================== Public View Functions ====================

public fun board_owner(board: &Board): address {
    board.owner
}

public fun board_name(board: &Board): String {
    board.name
}

public fun board_columns(board: &Board): &vector<String> {
    &board.columns
}

public fun board_task_ids(board: &Board): &vector<ID> {
    &board.task_ids
}

public fun task_title(task: &Task): String {
    task.title
}

public fun task_column(task: &Task): String {
    task.column
}

public fun task_team(task: &Task): u64 {
    task.team_id
}