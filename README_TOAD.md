# TOAD – Task On-chain Agile Dashboard

A decentralized project management platform built for the Sui Builder Forge hackathon. TOAD leverages Sui Move smart contracts to provide transparent, immutable task tracking with on-chain ownership and permissions.

## Features

- **On-chain Boards & Tasks**: Immutable task history on Sui blockchain
- **Role-based Permissions**: Contributor and Admin roles with granular access control
- **Subtasks & Comments**: Hierarchical task management with discussion threads
- **Emoji Reactions**: Collaborative feedback on comments
- **Client-side Encryption**: Optional encryption for sensitive task data
- **AI Assistant**: Google Gemini-powered workflow guidance
- **zkLogin Integration**: Sign in with Google via Sui zkLogin
- **Multiple Views**: Kanban, List, Calendar, Timeline, and Analytics

## Tech Stack

### Smart Contracts
- **Sui Move 2024**: Latest Move syntax with method chaining
- **Dynamic Fields**: Efficient on-chain storage
- **Display Objects**: Rich metadata for boards and tasks
- **Row Level Security**: Ownership-based access control

### Frontend
- **React 18** + **TypeScript**
- **Vite** for fast development
- **Sui TypeScript SDK v1.0+**
- **@mysten/dapp-kit** for wallet integration
- **@tanstack/react-query** for state management
- **Tailwind CSS** for styling

### AI & Auth
- **Google Gemini 2.0 Flash** for AI assistance
- **zkLogin** for Web2-style authentication
- **Client-side AES-GCM encryption**

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `VITE_TOAD_PACKAGE_ID`: Your deployed Move package ID
- `VITE_GEMINI_API_KEY`: Google Gemini API key (optional, for AI assistant)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID (optional, for zkLogin)

### 3. Deploy Move Contracts

```bash
cd move/toad
sui move build
sui client publish --gas-budget 100000000
```

Update `VITE_TOAD_PACKAGE_ID` in `.env` with the published package ID.

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Move Contract Structure

### Core Objects

- **Board**: Main workspace with configurable columns
- **BoardOwnerCap**: Ownership capability for board management
- **Task**: Individual work item with metadata
- **Subtask**: Child tasks for hierarchical organization
- **Comment**: Discussion threads on tasks

### Entry Functions

#### Board Management
- `create_board`: Create a new board with custom columns
- `delete_board`: Remove an empty board
- `update_board_columns`: Reconfigure workflow columns
- `add_member`: Grant access to a user
- `update_member_role`: Change user permissions
- `remove_member`: Revoke access

#### Task Management
- `create_task`: Add a new task to a board
- `update_task_position`: Move task between columns
- `update_task_details`: Edit title and description
- `set_task_due_date`: Set deadline
- `assign_task`: Assign users to task
- `set_task_milestone`: Link to milestone
- `set_task_tags`: Add labels
- `set_task_priority`: Set High/Medium/Low
- `delete_task`: Remove a task

#### Subtasks & Comments
- `create_subtask`: Add child task
- `toggle_subtask_done`: Mark complete/incomplete
- `add_comment`: Post a comment
- `add_reaction`: React with emoji

### Role System

- **Owner**: Full control (board creator)
- **Admin** (role=2): Can manage members and settings
- **Contributor** (role=1): Can create and edit tasks

## Frontend Architecture

### Transaction Builders (`src/lib/toadSuiClient.ts`)

All Move calls are wrapped in type-safe transaction builders:

```typescript
const tx = buildCreateTaskTx({
  boardId: '0x...',
  title: 'Implement feature',
  description: 'Details here',
  column: 'To Do',
  assignees: [],
  tags: ['frontend'],
  isEncrypted: false,
});
```

### Hooks

#### Mutations (`src/hooks/useToadMutations.ts`)
- `useCreateBoard()`
- `useCreateTask()`
- `useUpdateTaskPosition()`
- `useAddComment()`
- `useAddReaction()`
- And more...

#### Queries (`src/hooks/useToadQueries.ts`)
- `useBoards()`: Fetch user's boards
- `useBoardOwnerCaps()`: Get ownership capabilities
- `useBoard(boardId)`: Get board details

### AI Assistant (`src/hooks/useToadAssistant.ts`)

```typescript
const { messages, loading, sendMessage } = useToadAssistant(boardSnapshot);

sendMessage("What should I work on next?");
```

### zkLogin Flow

1. User clicks "Sign in with zkLogin"
2. Redirects to Google OAuth
3. Receives JWT token
4. Derives zkLogin address on-chain
5. Uses zkLogin wallet for transactions

## Testing

Run Move tests:

```bash
cd move/toad
sui move test
```

Expected tests:
- Board creation and deletion
- Member management
- Task CRUD operations
- Subtasks and comments
- Access control violations

## Deployment

### Move Contracts (Devnet)

```bash
cd move/toad
sui client publish --gas-budget 100000000
```

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy `dist` folder
```

Set environment variables in your hosting platform.

## Hackathon Requirements

TOAD fulfills all Sui Builder Forge requirements:

- ✅ Board creation with ownership
- ✅ Membership and role-based access control
- ✅ Task/Issue management (CRUD)
- ✅ Configurable workflow columns
- ✅ Hierarchical tasks (subtasks)
- ✅ Discussion threads (comments)
- ✅ Milestones and tags
- ✅ Board insights via events
- ✅ **Bonus**: Dynamic fields, display, clock, upgradeability, zkLogin, encryption

## License

MIT

## Built for Sui Builder Forge

TOAD demonstrates:
- Modern Move 2024 syntax
- Sui object model best practices
- dApp Kit integration
- zkLogin authentication
- AI-powered workflows

Happy building on Sui!
