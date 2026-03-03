import TaskDetailView from "@/components/tasks/TaskDetailView";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  return <TaskDetailView taskId={id} />;
}
