export interface ScheduledTask {
  id: string;
  label: string;
  enabled: boolean;
  cron: string;
}

export class TaskScheduler {
  private tasks: ScheduledTask[] = [];

  add(task: ScheduledTask) {
    this.tasks.push(task);
  }

  getAll() {
    return this.tasks;
  }

  remove(id: string) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
  }
}

export const scheduler = new TaskScheduler();