import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
}

export function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  return (
    <AppLayout title={title} subtitle={subtitle}>
      <div className="p-6">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This feature is under development
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
