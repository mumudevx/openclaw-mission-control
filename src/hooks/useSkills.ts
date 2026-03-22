import { useQueryClient } from '@tanstack/react-query';
import { useGatewayQuery } from './useGatewayQuery';
import { useGatewayMutation } from './useGatewayMutation';
import type {
  SkillsStatusResponse,
  SkillsInstallResponse,
  SkillsUpdateResponse,
} from '@/lib/gateway';

export function useSkillsStatus(agentId?: string) {
  return useGatewayQuery<{ agentId?: string }, SkillsStatusResponse>(
    'skills.status',
    agentId ? { agentId } : {},
  );
}

export function useSkillInstall() {
  const queryClient = useQueryClient();

  return useGatewayMutation<
    { name: string; installId: string; timeoutMs?: number },
    SkillsInstallResponse
  >('skills.install', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateway', 'skills.status'] });
    },
  });
}

export function useSkillUpdate() {
  const queryClient = useQueryClient();

  return useGatewayMutation<
    { skillKey: string; enabled?: boolean; apiKey?: string; env?: Record<string, string> },
    SkillsUpdateResponse
  >('skills.update', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateway', 'skills.status'] });
    },
  });
}
