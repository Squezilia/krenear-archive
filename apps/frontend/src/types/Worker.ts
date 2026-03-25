export default interface Worker {
  id: string;
  status: string;
  executionHistory: string[];
  deploymentId: string | null;
  userId: string;
  isRunning: boolean;
  logs: string[];
}
