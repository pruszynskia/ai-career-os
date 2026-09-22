import type { ParsedProfile } from '@/entities/profile/types';
import {
  Badge,
  Heading,
  Text,
  VStack,
  surfaceVariants,
} from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

type ProfileSummaryData = Pick<
  ParsedProfile,
  'summary' | 'skills' | 'experience' | 'projects'
>;

export function ProfileSummary({ profile }: { profile: ProfileSummaryData }) {
  return (
    <VStack gap={6}>
      <VStack gap={1}>
        <Heading level={4} as="h2">
          Summary
        </Heading>
        <Text size="lg">{profile.summary}</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={4} as="h2">
          Skills
        </Heading>
        <ul className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <li key={skill}>
              <Badge variant="secondary">{skill}</Badge>
            </li>
          ))}
        </ul>
      </VStack>

      <VStack gap={2}>
        <Heading level={4} as="h2">
          Experience
        </Heading>
        <ul className="flex flex-col">
          {profile.experience.map((role, index) => (
            <li
              key={`${role.company}-${role.title}-${index}`}
              className={cn(
                surfaceVariants({ elevation: 'ruled', padding: 'sm' }),
                'flex flex-col gap-1 last:border-b-0',
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
      </VStack>

      {profile.projects.length > 0 && (
        <VStack gap={2}>
          <Heading level={4} as="h2">
            Projects
          </Heading>
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
                    'flex flex-col gap-1 last:border-b-0',
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
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </VStack>
      )}
    </VStack>
  );
}
