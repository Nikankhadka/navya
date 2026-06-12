import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateService } from '@/features/nutrition/api/template.service';
import type { CreateMealTemplateInput } from '@/types/app';

export function useMealTemplates(userId?: string) {
  return useQuery({
    queryKey: ['meal-templates', userId],
    queryFn: () => templateService.getTemplates(userId ?? ''),
    enabled: Boolean(userId),
  });
}

export function useSaveTemplate(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMealTemplateInput) =>
      templateService.saveTemplate(userId ?? '', input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meal-templates', userId] });
    },
  });
}

export function useDeleteTemplate(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => templateService.deleteTemplate(userId ?? '', templateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meal-templates', userId] });
    },
  });
}

export function useToggleTemplateFavorite(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, isFavorite }: { templateId: string; isFavorite: boolean }) =>
      templateService.toggleFavorite(userId ?? '', templateId, isFavorite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meal-templates', userId] });
    },
  });
}
