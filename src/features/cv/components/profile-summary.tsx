import type { ParsedProfile } from '@/entities/profile/types';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge, Text, surfaceVariants } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

type ProfileSummaryData = Pick<
  ParsedProfile,
  'summary' | 'skills' | 'experience' | 'projects'
>;

export function ProfileSummary({ profile }: { profile: ProfileSummaryData }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Text size="lg">{profile.summary}</Text>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <li key={skill}>
                <Badge>{skill}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
          <CardAction>
            <Text size="xs" color="muted">
              {profile.experience.length} role
              {profile.experience.length === 1 ? '' : 's'}
            </Text>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0 pt-0 pb-0">
          <ul className="flex flex-col">
            {profile.experience.map((role, index) => (
              <li
                key={`${role.company}-${role.title}-${index}`}
                className={cn(
                  surfaceVariants({ elevation: 'ruled', padding: 'sm' }),
                  'flex flex-col gap-1 px-4 last:border-b-0',
                )}
              >
                <Text size="sm" weight="medium">
                  {role.title} · {role.company}
                </Text>
                <Text size="xs" color="muted">
                  {role.startDate} – {role.endDate ?? 'Present'}
                </Text>
                <Text size="sm">{role.description}</Text>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {profile.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-0 pb-0">
            <ul className="flex flex-col">
              {profile.projects.map((project, index) => {
                const href =
                  project.url && /^https?:\/\//i.test(project.url)
                    ? project.url
                    : null;
                return (
                  <li
                    key={`${project.name}-${index}`}
                    className={cn(
                      surfaceVariants({ elevation: 'ruled', padding: 'sm' }),
                      'flex flex-col gap-1 px-4 last:border-b-0',
                    )}
                  >
                    <Text size="sm" weight="medium">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2"
                        >
                          {project.name}
                        </a>
                      ) : (
                        project.name
                      )}
                    </Text>
                    <Text size="sm">{project.description}</Text>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <Badge key={tech}>{tech}</Badge>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}
