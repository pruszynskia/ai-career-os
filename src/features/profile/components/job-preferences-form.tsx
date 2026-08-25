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
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Grid,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="workMode">Work mode</Label>
              <Controller
                control={control}
                name="workMode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="workMode" className="w-full">
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
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="employmentType">Employment type</Label>
              <Controller
                control={control}
                name="employmentType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="employmentType" className="w-full">
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
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="seniority">Seniority</Label>
              <Controller
                control={control}
                name="seniority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="seniority" className="w-full">
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
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="companySize">Company size</Label>
              <Controller
                control={control}
                name="companySize"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="companySize" className="w-full">
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
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                placeholder="e.g. Frontend, Platform, ML"
                {...register('specialization')}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="salaryMin">Salary min</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  aria-invalid={!!errors.salaryMin}
                  {...register('salaryMin')}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="salaryMax">Salary max</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  aria-invalid={!!errors.salaryMax}
                  {...register('salaryMax')}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="salaryCurrency">Currency</Label>
                <Input
                  id="salaryCurrency"
                  placeholder="USD"
                  {...register('salaryCurrency')}
                />
              </div>
            </div>
          </Grid>

          {errors.salaryMin && (
            <p role="alert" className="text-sm text-destructive">
              {errors.salaryMin.message}
            </p>
          )}

          {errors.salaryMax && (
            <p role="alert" className="text-sm text-destructive">
              {errors.salaryMax.message}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="preferredTechnologies">
              Preferred technologies (comma-separated)
            </Label>
            <Input
              id="preferredTechnologies"
              placeholder="TypeScript, React, PostgreSQL"
              {...register('preferredTechnologies')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="industries">Industries (comma-separated)</Label>
            <Input
              id="industries"
              placeholder="Fintech, Healthtech"
              {...register('industries')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="locationPreferences">
              Preferred locations (comma-separated)
            </Label>
            <Input
              id="locationPreferences"
              placeholder="Wrocław, Berlin, Remote"
              {...register('locationPreferences')}
            />
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="self-start"
          >
            {mutation.isPending && <Spinner size="sm" />}
            {mutation.isPending ? 'Saving…' : 'Save preferences'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
