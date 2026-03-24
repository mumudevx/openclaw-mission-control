import { useEffect } from 'react';
import { useCronStore } from '@/stores/cronStore';
import { useTaskStore } from '@/stores/taskStore';
import { useCalendarStore } from '@/stores/calendarStore';
import type { CalendarEvent } from '@/types';
import type { CronJob, Task } from '@/types';

function cronJobToEvent(job: CronJob): CalendarEvent {
  return {
    id: `cron-${job.id}`,
    title: job.name,
    description: job.description,
    type: 'cron',
    startDate: job.nextRun,
    allDay: false,
    relatedId: job.id,
  };
}

function taskToEvent(task: Task): CalendarEvent | null {
  if (!task.dueDate) return null;
  return {
    id: `task-${task.id}`,
    title: task.title,
    description: task.description,
    type: 'task_deadline',
    startDate: task.dueDate,
    allDay: true,
    relatedId: task.id,
  };
}

/** Upsert: add if missing, update if exists */
function upsertEvent(event: CalendarEvent) {
  const { events, addEvent, updateEvent } = useCalendarStore.getState();
  const existing = events.find((e) => e.id === event.id);
  if (existing) {
    updateEvent(event.id, event);
  } else {
    addEvent(event);
  }
}

function removeEventIfExists(eventId: string) {
  const { events, removeEvent } = useCalendarStore.getState();
  if (events.some((e) => e.id === eventId)) {
    removeEvent(eventId);
  }
}

function syncCronJobs(currentJobs: CronJob[], prevJobs: CronJob[]) {
  const currentIds = new Set(currentJobs.map((j) => j.id));

  // Upsert events for current jobs
  for (const job of currentJobs) {
    upsertEvent(cronJobToEvent(job));
  }

  // Remove events for deleted jobs
  for (const prevJob of prevJobs) {
    if (!currentIds.has(prevJob.id)) {
      removeEventIfExists(`cron-${prevJob.id}`);
    }
  }
}

function syncTasks(currentTasks: Task[], prevTasks: Task[]) {
  const currentIds = new Set(currentTasks.map((t) => t.id));

  for (const task of currentTasks) {
    const eventId = `task-${task.id}`;
    if (!task.dueDate) {
      removeEventIfExists(eventId);
      continue;
    }
    const event = taskToEvent(task);
    if (event) upsertEvent(event);
  }

  // Remove events for deleted tasks
  for (const prevTask of prevTasks) {
    if (!currentIds.has(prevTask.id)) {
      removeEventIfExists(`task-${prevTask.id}`);
    }
  }
}

export function useCalendarSync() {
  useEffect(() => {
    // Initial hydration
    const cronJobs = useCronStore.getState().jobs;
    const tasks = useTaskStore.getState().tasks;
    if (cronJobs.length > 0) syncCronJobs(cronJobs, []);
    if (tasks.length > 0) syncTasks(tasks, []);

    // Subscribe to changes
    const unsubCron = useCronStore.subscribe((state, prevState) => {
      syncCronJobs(state.jobs, prevState.jobs);
    });

    const unsubTask = useTaskStore.subscribe((state, prevState) => {
      syncTasks(state.tasks, prevState.tasks);
    });

    return () => {
      unsubCron();
      unsubTask();
    };
  }, []);
}
