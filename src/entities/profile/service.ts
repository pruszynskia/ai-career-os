import 'server-only';

import { createClient } from '@/shared/db/client';
import type { JobPreferences, Profile } from '@/entities/profile/types';

// A row that exists only to record onboarding completion / preferences
// before any CV has been parsed. NULL summary is the DB's own "no CV yet";
// a parsed CV always writes a string, even an empty one, so a real profile
// and a pre-CV row can never be confused. Exported for direct unit testing.
export function isPlaceholder(row: Record<string, unknown>): boolean {
  return row.summary === null;
}

function toProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    summary: row.summary as string,
    skills: row.skills as string[],
    experience: row.experience,
    projects: row.projects,
    score: row.score,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    onboardedAt: row.onboarded_at ? new Date(row.onboarded_at as string) : null,
    workMode: row.work_mode as Profile['workMode'],
    salaryMin: row.salary_min as number | null,
    salaryMax: row.salary_max as number | null,
    salaryCurrency: row.salary_currency as string | null,
    specialization: row.specialization as string | null,
    employmentType: row.employment_type as Profile['employmentType'],
    seniority: row.seniority as Profile['seniority'],
    preferredTechnologies: (row.preferred_technologies as string[]) ?? [],
    companySize: row.company_size as Profile['companySize'],
    industries: (row.industries as string[]) ?? [],
    locationPreferences: (row.location_preferences as string[]) ?? [],
  };
}

function toPreferencesRow(preferences: Partial<JobPreferences>) {
  const row: Record<string, unknown> = {};
  if ('workMode' in preferences) row.work_mode = preferences.workMode;
  if ('salaryMin' in preferences) row.salary_min = preferences.salaryMin;
  if ('salaryMax' in preferences) row.salary_max = preferences.salaryMax;
  if ('salaryCurrency' in preferences)
    row.salary_currency = preferences.salaryCurrency;
  if ('specialization' in preferences)
    row.specialization = preferences.specialization;
  if ('employmentType' in preferences)
    row.employment_type = preferences.employmentType;
  if ('seniority' in preferences) row.seniority = preferences.seniority;
  if ('preferredTechnologies' in preferences)
    row.preferred_technologies = preferences.preferredTechnologies;
  if ('companySize' in preferences) row.company_size = preferences.companySize;
  if ('industries' in preferences) row.industries = preferences.industries;
  if ('locationPreferences' in preferences)
    row.location_preferences = preferences.locationPreferences;
  return row;
}

export const profileService = {
  async findUnique(ownerId: string): Promise<Profile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) throw error;
    // A placeholder onboarding row is not a real profile: the CV-dependent
    // features guarding on `if (!profile)` must still see null.
    return data && !isPlaceholder(data) ? toProfile(data) : null;
  },

  async upsert(
    ownerId: string,
    values: {
      summary: string;
      skills: string[];
      experience: unknown;
      projects: unknown;
      score: unknown;
    },
  ): Promise<Profile> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          owner_id: ownerId,
          summary: values.summary,
          skills: values.skills,
          experience: values.experience,
          projects: values.projects,
          score: values.score,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'owner_id' },
      )
      .select()
      .single();

    if (error) throw error;
    return toProfile(data);
  },

  // Used by the (app) layout on every navigation to decide whether to
  // gate into onboarding. Selects only the one column it needs instead of
  // the full row findUnique() returns.
  async getOnboardedAt(ownerId: string): Promise<Date | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('onboarded_at')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) throw error;
    return data?.onboarded_at ? new Date(data.onboarded_at as string) : null;
  },

  async updatePreferences(
    ownerId: string,
    preferences: Partial<JobPreferences>,
  ): Promise<Profile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...toPreferencesRow(preferences),
        updated_at: new Date().toISOString(),
      })
      .eq('owner_id', ownerId)
      // Scope the write to a real profile: a placeholder onboarding row has a
      // NULL summary, so this never persists preferences to it before the
      // result is checked.
      .not('summary', 'is', null)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data ? toProfile(data) : null;
  },

  // Additive: sets onboarded_at without touching the CV-parsed fields
  // upsert() owns. The row may not exist yet (skip before any CV upload);
  // skills/experience take their DB defaults and summary stays NULL, which
  // findUnique() reads as "no profile yet". A single upsert is race-safe by
  // construction. On an existing real profile, onConflict updates only
  // onboarded_at and leaves the CV data intact.
  async completeOnboarding(ownerId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { owner_id: ownerId, onboarded_at: new Date().toISOString() },
        { onConflict: 'owner_id' },
      );
    if (error) throw error;
  },
};
