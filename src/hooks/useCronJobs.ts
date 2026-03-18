import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGatewayQuery } from './useGatewayQuery';
import { useGatewayMutation } from './useGatewayMutation';
import { adaptCronJob, toBackendCronCreate } from '@/lib/gateway/adapters';
import type { GatewayCronJob } from '@/lib/gateway';
import type { CronJob } from '@/types';
import { useCronStore } from '@/stores/cronStore';

export function useCronList() {
  const { setJobs } = useCronStore();

  const query = useGatewayQuery<undefined, GatewayCronJob[]>('cron.list');

  const jobs = query.data ? query.data.map(adaptCronJob) : [];

  useEffect(() => {
    if (jobs.length > 0) {
      setJobs(jobs);
    }
  }, [jobs.length, setJobs]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    jobs,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCronMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['gateway', 'cron.list'] });

  const addJob = useGatewayMutation<Record<string, unknown>, GatewayCronJob>('cron.add', {
    onSuccess: invalidate,
  });

  const updateJob = useGatewayMutation<Record<string, unknown>, GatewayCronJob>('cron.update', {
    onSuccess: invalidate,
  });

  const removeJob = useGatewayMutation<{ id: string }, { ok: boolean }>('cron.remove', {
    onSuccess: invalidate,
  });

  const runJob = useGatewayMutation<{ id: string }, { ok: boolean }>('cron.run', {
    onSuccess: invalidate,
  });

  return { addJob, updateJob, removeJob, runJob };
}

export { toBackendCronCreate };
export type { CronJob };
