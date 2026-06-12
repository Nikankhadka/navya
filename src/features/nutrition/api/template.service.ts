import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import type {
  MealTemplate,
  CreateMealTemplateInput,
  TemplateFoodEntry,
  CreateFoodLogInput,
} from '@/types/app';
import { MOCK_MEAL_TEMPLATES } from '@/features/demo/mockNutrition';

interface RawTemplateRow {
  id: string;
  user_id: string;
  name: string;
  meal_time: string;
  foods: unknown;
  is_system: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

function mapTemplateRow(row: RawTemplateRow): MealTemplate {
  const foods =
    typeof row.foods === 'string'
      ? (JSON.parse(row.foods) as TemplateFoodEntry[])
      : ((row.foods as TemplateFoodEntry[]) ?? []);

  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    meal_time: row.meal_time as MealTemplate['meal_time'],
    foods: Array.isArray(foods) ? foods : [],
    is_system: row.is_system,
    is_favorite: row.is_favorite,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function shouldUseDemoTemplates(userId: string): boolean {
  return userId === '00000000-0000-0000-0000-000000000000' || !isSupabaseConfigured;
}

export const templateService = {
  async getTemplates(userId: string): Promise<MealTemplate[]> {
    if (shouldUseDemoTemplates(userId)) {
      return MOCK_MEAL_TEMPLATES as MealTemplate[];
    }

    // Use raw query until Database type is regenerated with meal_templates
    const { data, error } = await supabase
      .from('meal_templates' as never)
      .select('*')
      .or(`user_id.eq.${userId},is_system.eq.true`)
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching meal templates:', error);
      return [];
    }

    return ((data ?? []) as RawTemplateRow[]).map(mapTemplateRow);
  },

  async saveTemplate(userId: string, input: CreateMealTemplateInput): Promise<MealTemplate> {
    if (shouldUseDemoTemplates(userId)) {
      return {
        id: `template-${Date.now()}`,
        user_id: userId,
        name: input.name,
        meal_time: input.meal_time,
        foods: input.foods,
        is_system: false,
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('meal_templates' as never)
      .insert({
        user_id: userId,
        name: input.name.trim(),
        meal_time: input.meal_time,
        foods: input.foods,
        is_system: false,
      } as never)
      .select('*')
      .single();

    if (error) {
      console.error('Error saving meal template:', error);
      throw new Error('Failed to save meal template');
    }

    return mapTemplateRow(data as RawTemplateRow);
  },

  async deleteTemplate(userId: string, templateId: string): Promise<void> {
    if (shouldUseDemoTemplates(userId)) {
      return;
    }

    const { error } = await supabase
      .from('meal_templates' as never)
      .delete()
      .eq('id', templateId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting meal template:', error);
    }
  },

  async toggleFavorite(userId: string, templateId: string, isFavorite: boolean): Promise<void> {
    if (shouldUseDemoTemplates(userId)) {
      return;
    }

    const { error } = await supabase
      .from('meal_templates' as never)
      .update({
        is_favorite: isFavorite,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', templateId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error toggling template favorite:', error);
    }
  },

  /** Convert a template to an array of CreateFoodLogInput entries for batch logging */
  templateToFoodLogs(template: MealTemplate): CreateFoodLogInput[] {
    return template.foods.map((food) => ({
      meal_name: food.meal_name,
      calories: food.calories,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      meal_time: template.meal_time,
      notes: `From template: ${template.name}`,
      source: 'manual' as const,
      source_food_id: null,
      custom_food_id: null,
      quantity: 1,
      serving_label: null,
      serving_grams: null,
      is_custom: false,
    }));
  },
};
