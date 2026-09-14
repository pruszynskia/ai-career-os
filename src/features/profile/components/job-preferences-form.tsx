'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

import {
  companySizeSchema,
  employmentTypeSchema,
  seniorityLevelSchema,
  workModeSchema,
  type JobPreferences,
} from '@/entities/profile/types';
import { useUpdatePreferences } from '@/features/profile/hooks/use-update-preferences';
import {
  fromSelectValue,
  preferencesFormSchema,
  toList,
  toSelectValue,
  UNSET,
  type PreferencesFormValues,
} from '@/features/profile/utils/preferences-form';
import { AsyncButton } from '@/shared/ui/async-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import {
  Grid,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives';

const WORK_MODE_LABEL: Record<z.infer<typeof workModeSchema>, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'Onsite',
};

const EMPLOYMENT_TYPE_LABEL: Record<
  z.infer<typeof employmentTypeSchema>,
  string
> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
};

const SENIORITY_LABEL: Record<z.infer<typeof seniorityLevelSchema>, string> = {
  JUNIOR: 'Junior',
  MID: 'Mid',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  PRINCIPAL: 'Principal',
};

const COMPANY_SIZE_LABEL: Record<z.infer<typeof companySizeSchema>, string> = {
  STARTUP: 'Startup',
  SCALEUP: 'Scaleup',
  MID_SIZE: 'Mid-size',
  ENTERPRISE: 'Enterprise',
};

export function JobPreferencesForm({
  preferences,
}: {
  preferences: JobPreferences;
}) {
  const mutation = useUpdatePreferences();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      workMode: toSelectValue(preferences.workMode),
      salaryMin: preferences.salaryMin?.toString() ?? '',
      salaryMax: preferences.salaryMax?.toString() ?? '',
      salaryCurrency: preferences.salaryCurrency ?? '',
      specialization: preferences.specialization ?? '',
      employmentType: toSelectValue(preferences.employmentType),
      seniority: toSelectValue(preferences.seniority),
      preferredTechnologies: preferences.preferredTechnologies.join(', '),
      companySize: toSelectValue(preferences.companySize),
      industries: preferences.industries.join(', '),
      locationPreferences: preferences.locationPreferences.join(', '),
    },
  });

  function onSubmit(values: PreferencesFormValues) {
    mutation.mutate({
      workMode: fromSelectValue(values.workMode),
      salaryMin: values.salaryMin.trim() ? Number(values.salaryMin) : null,
      salaryMax: values.salaryMax.trim() ? Number(values.salaryMax) : null,
      salaryCurrency: values.salaryCurrency.trim() || null,
      specialization: values.specialization.trim() || null,
      employmentType: fromSelectValue(values.employmentType),
      seniority: fromSelectValue(values.seniority),
      preferredTechnologies: toList(values.preferredTechnologies),
      companySize: fromSelectValue(values.companySize),
      industries: toList(values.industries),
      locationPreferences: toList(values.locationPreferences),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Grid cols={1} colsMd={2} gap={4}>
            <Field id="workMode" label="Work mode">
              {(controlProps) => (
                <Controller
                  control={control}
                  name="workMode"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full" {...controlProps}>
                        <SelectValue placeholder="No preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNSET}>No preference</SelectItem>
                        {workModeSchema.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {WORK_MODE_LABEL[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </Field>

            <Field id="employmentType" label="Employment type">
              {(controlProps) => (
                <Controller
                  control={control}
                  name="employmentType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full" {...controlProps}>
                        <SelectValue placeholder="No preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNSET}>No preference</SelectItem>
                        {employmentTypeSchema.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {EMPLOYMENT_TYPE_LABEL[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </Field>

            <Field id="seniority" label="Seniority">
              {(controlProps) => (
                <Controller
                  control={control}
                  name="seniority"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full" {...controlProps}>
                        <SelectValue placeholder="No preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNSET}>No preference</SelectItem>
                        {seniorityLevelSchema.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {SENIORITY_LABEL[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </Field>

            <Field id="companySize" label="Company size">
              {(controlProps) => (
                <Controller
                  control={control}
                  name="companySize"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full" {...controlProps}>
                        <SelectValue placeholder="No preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNSET}>No preference</SelectItem>
                        {companySizeSchema.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {COMPANY_SIZE_LABEL[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </Field>

            <Field id="specialization" label="Specialization">
              <Input
                placeholder="e.g. Frontend, Platform, ML"
                {...register('specialization')}
              />
            </Field>

            <div className="grid grid-cols-3 gap-2">
              <Field
                id="salaryMin"
                label="Salary min"
                error={errors.salaryMin?.message}
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  {...register('salaryMin')}
                />
              </Field>
              <Field
                id="salaryMax"
                label="Salary max"
                error={errors.salaryMax?.message}
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  {...register('salaryMax')}
                />
              </Field>
              <Field id="salaryCurrency" label="Currency">
                <Input placeholder="USD" {...register('salaryCurrency')} />
              </Field>
            </div>
          </Grid>

          <Field
            id="preferredTechnologies"
            label="Preferred technologies (comma-separated)"
          >
            <Input
              placeholder="TypeScript, React, PostgreSQL"
              {...register('preferredTechnologies')}
            />
          </Field>

          <Field id="industries" label="Industries (comma-separated)">
            <Input
              placeholder="Fintech, Healthtech"
              {...register('industries')}
            />
          </Field>

          <Field
            id="locationPreferences"
            label="Preferred locations (comma-separated)"
          >
            <Input
              placeholder="Wrocław, Berlin, Remote"
              {...register('locationPreferences')}
            />
          </Field>

          <AsyncButton
            type="submit"
            pending={mutation.isPending}
            pendingLabel="Saving…"
            className="self-start"
          >
            Save preferences
          </AsyncButton>
        </form>
      </CardContent>
    </Card>
  );
}
