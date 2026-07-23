import type { ParsedProfile } from '@/entities/profile/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export function ProfileSummary({ profile }: { profile: ParsedProfile }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{profile.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
              >
                {skill}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-4">
            {profile.experience.map((role, index) => (
              <li key={`${role.company}-${role.title}-${index}`}>
                <p className="text-sm font-medium">
                  {role.title} · {role.company}
                </p>
                <p className="text-xs text-muted-foreground">
                  {role.startDate} – {role.endDate ?? 'Present'}
                </p>
                <p className="mt-1 text-sm">{role.description}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
