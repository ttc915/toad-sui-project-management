#[test_only]
module toad::kanban_tests {
    use std::string::{Self, String};
    use std::option;

    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self as clock, Clock};
    use sui::test_utils;

    use toad::kanban::{Self, Board, BoardOwnerCap, BoardRegistry};

    const ADMIN: address = @0xA;
    const USER1: address = @0xB;
    const USER2: address = @0xC;

    // Must match the main module:
    // ROLE_TEAM_MEMBER = 1, ROLE_MANAGER = 2, ROLE_ADMIN = 3
    const ROLE_TEAM_MEMBER: u8 = 1;
    const ROLE_MANAGER: u8 = 2;
    const ROLE_ADMIN: u8 = 3;

    fun setup_test(): (Scenario, Clock) {
        let mut scenario = ts::begin(ADMIN);
        let clock = clock::create_for_testing(scenario.ctx());
        
        // Initialize Registry
        kanban::create_registry(scenario.ctx());
        
        // Advance to next tx so the registry is available
        scenario.next_tx(ADMIN);
        
        (scenario, clock)
    }

    fun create_default_board(scenario: &mut Scenario, clock: &Clock) {
        scenario.next_tx(ADMIN);
        {
            let mut registry = scenario.take_shared<BoardRegistry>();
            let ctx = scenario.ctx();
            let columns = vector[
                string::utf8(b"Backlog"),
                string::utf8(b"To Do"),
                string::utf8(b"In Progress"),
                string::utf8(b"Done"),
            ];

            kanban::create_board(
                string::utf8(b"Test Board"),
                string::utf8(b"A test board"),
                columns,
                &mut registry,
                clock,
                ctx,
            );
            ts::return_shared(registry);
        };
    }

    #[test]
    fun test_create_board() {
        let (mut scenario, clock) = setup_test();

        create_default_board(&mut scenario, &clock);

        scenario.next_tx(ADMIN);
        {
            // Board is shared, OwnerCap is owned
            let board = scenario.take_shared<Board>();
            let cap = scenario.take_from_sender<BoardOwnerCap>();

            assert!(kanban::board_owner(&board) == ADMIN);
            assert!(kanban::board_name(&board) == string::utf8(b"Test Board"));
            assert!(kanban::board_columns(&board).length() == 4);
            assert!(kanban::board_task_ids(&board).length() == 0);

            ts::return_shared(board);
            ts::return_to_sender(&scenario, cap);
        };

        clock.destroy_for_testing();
        scenario.end();
    }

    #[test]
    fun test_add_member() {
        let (mut scenario, clock) = setup_test();

        create_default_board(&mut scenario, &clock);

        scenario.next_tx(ADMIN);
        {
            let mut board = scenario.take_shared<Board>();
            let cap = scenario.take_from_sender<BoardOwnerCap>();
            let mut registry = scenario.take_shared<BoardRegistry>();

            kanban::add_member(
                &mut board,
                &cap,
                USER1,
                ROLE_TEAM_MEMBER,
                &mut registry,
                scenario.ctx(),
            );

            ts::return_shared(board);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(registry);
        };

        clock.destroy_for_testing();
        scenario.end();
    }

    #[test]
    fun test_create_task() {
        let (mut scenario, clock) = setup_test();

        create_default_board(&mut scenario, &clock);

        scenario.next_tx(ADMIN);
        {
            let mut board = scenario.take_shared<Board>();

            kanban::create_task(
                &mut board,
                string::utf8(b"Task 1"),
                string::utf8(b"Description 1"),
                string::utf8(b"To Do"),
                option::some(1u8),
                option::none(),
                vector[ADMIN],
                option::none(),
                vector[],
                false,
                option::none(),
                1,              // team_id
                &clock,
                scenario.ctx(),
            );

            assert!(kanban::board_task_ids(&board).length() == 1);

            ts::return_shared(board);
        };

        clock.destroy_for_testing();
        scenario.end();
    }

    #[test]
    fun test_update_task_position() {
        let (mut scenario, clock) = setup_test();

        create_default_board(&mut scenario, &clock);

        let task_id;

        // 1. Create Task
        scenario.next_tx(ADMIN);
        {
            let mut board = scenario.take_shared<Board>();

            kanban::create_task(
                &mut board,
                string::utf8(b"Task 1"),
                string::utf8(b"Description 1"),
                string::utf8(b"To Do"),
                option::none(),
                option::none(),
                vector[],
                option::none(),
                vector[],
                false,
                option::none(),
                1,              // team_id
                &clock,
                scenario.ctx(),
            );
            
            task_id = kanban::board_task_ids(&board)[0];
            ts::return_shared(board);
        };

        // 2. Update Position
        scenario.next_tx(ADMIN);
        {
            let mut board = scenario.take_shared<Board>();
            kanban::update_task_position(
                &mut board,
                task_id,
                string::utf8(b"In Progress"),
                &clock,
                scenario.ctx(),
            );
            ts::return_shared(board);
        };

        clock.destroy_for_testing();
        scenario.end();
    }

    #[test]
    fun test_member_can_create_task() {
        let (mut scenario, clock) = setup_test();

        create_default_board(&mut scenario, &clock);

        // ADMIN adds USER1 as a MANAGER
        scenario.next_tx(ADMIN);
        {
            let mut board = scenario.take_shared<Board>();
            let cap = scenario.take_from_sender<BoardOwnerCap>();
            let mut registry = scenario.take_shared<BoardRegistry>();

            kanban::add_member(
                &mut board,
                &cap,
                USER1,
                ROLE_MANAGER,
                &mut registry,
                scenario.ctx(),
            );

            ts::return_shared(board);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(registry);
        };

        // USER1 (manager) creates a task
        scenario.next_tx(USER1);
        {
            let mut board = scenario.take_shared<Board>();

            kanban::create_task(
                &mut board,
                string::utf8(b"User Task"),
                string::utf8(b"Task by member"),
                string::utf8(b"To Do"),
                option::none(),
                option::none(),
                vector[USER1],
                option::none(),
                vector[],
                false,
                option::none(),
                1,              // team_id
                &clock,
                scenario.ctx(),
            );

            assert!(kanban::board_task_ids(&board).length() == 1);

            ts::return_shared(board);
        };

        clock.destroy_for_testing();
        scenario.end();
    }

    #[test]
    #[expected_failure(abort_code = 7)] // E_NOT_ADMIN
    fun test_non_member_cannot_create_task() {
        let (mut scenario, clock) = setup_test();

        create_default_board(&mut scenario, &clock);

        scenario.next_tx(USER2);
        {
            let mut board = scenario.take_shared<Board>();

            kanban::create_task(
                &mut board,
                string::utf8(b"Unauthorized Task"),
                string::utf8(b"Should fail"),
                string::utf8(b"To Do"),
                option::none(),
                option::none(),
                vector[],
                option::none(),
                vector[],
                false,
                option::none(),
                1,              // team_id
                &clock,
                scenario.ctx(),
            );

            ts::return_shared(board);
        };

        clock.destroy_for_testing();
        scenario.end();
    }

    #[test]
    fun test_create_subtask() {
        let (mut scenario, clock) = setup_test();

        create_default_board(&mut scenario, &clock);

        let task_id;

        // Create Task
        scenario.next_tx(ADMIN);
        {
            let mut board = scenario.take_shared<Board>();
            kanban::create_task(
                &mut board,
                string::utf8(b"Parent Task"),
                string::utf8(b"Has subtasks"),
                string::utf8(b"To Do"),
                option::none(),
                option::none(),
                vector[],
                option::none(),
                vector[],
                false,
                option::none(),
                1,
                &clock,
                scenario.ctx(),
            );
            task_id = kanban::board_task_ids(&board)[0];
            ts::return_shared(board);
        };

        // Create Subtask
        scenario.next_tx(ADMIN);
        {
            let mut board = scenario.take_shared<Board>();
            kanban::create_subtask(
                &mut board,
                task_id,
                string::utf8(b"Subtask 1"),
                &clock,
                scenario.ctx(),
            );
            ts::return_shared(board);
        };

        clock.destroy_for_testing();
        scenario.end();
    }

    #[test]
    fun test_add_comment() {
        let (mut scenario, clock) = setup_test();

        create_default_board(&mut scenario, &clock);

        let task_id;

        // Create Task
        scenario.next_tx(ADMIN);
        {
            let mut board = scenario.take_shared<Board>();
            kanban::create_task(
                &mut board,
                string::utf8(b"Task with comments"),
                string::utf8(b"Description"),
                string::utf8(b"To Do"),
                option::none(),
                option::none(),
                vector[],
                option::none(),
                vector[],
                false,
                option::none(),
                1,
                &clock,
                scenario.ctx(),
            );
            task_id = kanban::board_task_ids(&board)[0];
            ts::return_shared(board);
        };

        // Add Comment
        scenario.next_tx(ADMIN);
        {
            let mut board = scenario.take_shared<Board>();
            kanban::add_comment(
                &mut board,
                task_id,
                string::utf8(b"First comment"),
                false,
                option::none(),
                &clock,
                scenario.ctx(),
            );
            ts::return_shared(board);
        };

        clock.destroy_for_testing();
        scenario.end();
    }

    #[test]
    fun test_delete_board() {
        let (mut scenario, clock) = setup_test();

        create_default_board(&mut scenario, &clock);

        scenario.next_tx(ADMIN);
        {
            let board = scenario.take_shared<Board>();
            let cap = scenario.take_from_sender<BoardOwnerCap>();

            kanban::delete_board(board, cap, scenario.ctx());
        };

        clock.destroy_for_testing();
        scenario.end();
    }
}