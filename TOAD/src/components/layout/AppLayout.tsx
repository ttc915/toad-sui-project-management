import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showAddTask?: boolean;
  onAddTask?: (task: any) => void;
}

export function AppLayout({ children, title, subtitle, showAddTask, onAddTask }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F5F0] dark:bg-[#050509]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={title}
          subtitle={subtitle}
          showAddTask={showAddTask}
          onAddTask={onAddTask}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
