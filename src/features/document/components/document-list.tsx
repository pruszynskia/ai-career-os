'use client';

import { useState } from 'react';

import type { CvDocument, CvDocumentKind } from '@/entities/cv-document/types';
import { CV_DOCUMENT_KIND_LABEL } from '@/entities/cv-document/types';
import { downloadTextFile } from '@/shared/utils/download-text-file';
import { formatDate } from '@/shared/utils/format-date';
import {
  Heading,
  Input,
  SegmentedControl,
  SegmentedControlItem,
  Tabs,
  TabsList,
  TabsTrigger,
  Tag,
  surfaceVariants,
} from '@/shared/ui/primitives';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/utils';
import { DocumentEditor } from '@/shared/ui/document-editor';
import { EmptyState } from '@/shared/ui/empty-state';

// A CV/cover-letter upload demotes the previous master's isMaster flag but
// keeps its kind (kind marks what a document originally was, not whether
// it's still current) — label it distinctly so the list doesn't show two
// "Master"/"Cover Letter" rows with no way to tell which one is active. A
// jobOfferId-less COVER_LETTER row is always a (possibly former) master —
// per-offer generated letters always carry a jobOfferId.
function documentLabel(document: CvDocument): string {
  if (document.kind === 'MASTER' && !document.isMaster)
    return 'Master (previous)';
  if (
    document.kind === 'COVER_LETTER' &&
    !document.isMaster &&
    !document.jobOfferId
  )
    return 'Cover Letter (previous)';
  return CV_DOCUMENT_KIND_LABEL[document.kind];
}

// A document is a "previous version" exactly when documentLabel() marks it
// "(previous)" - generated docs (isMaster always false) are never previous
// versions, they're the current output for their offer/kind.
export function isPreviousVersion(document: CvDocument): boolean {
  if (document.kind === 'MASTER') return !document.isMaster;
  if (document.kind === 'COVER_LETTER')
    return !document.isMaster && !document.jobOfferId;
  return false;
}

function documentFilename(document: CvDocument): string {
  return `${documentLabel(document).toLowerCase().replace(/\s+/g, '-')}-${document.id}.txt`;
}

// Type Tabs group (TASK-113): OPTIMIZED/TAILORED/OPTIMIZED_COVER_LETTER are
// always AI-generated per-offer variants (createVersion always passes
// isMaster:false for these, see cv-document/service.ts) - grouped together
// as "Generated" rather than split by CV/cover-letter, matching the
// mockup's distinction between an owner's own documents and AI output.
const GENERATED_KINDS: CvDocumentKind[] = [
  'OPTIMIZED',
  'TAILORED',
  'OPTIMIZED_COVER_LETTER',
];

type TypeFilter = 'all' | 'MASTER' | 'COVER_LETTER' | 'GENERATED';

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'MASTER', label: 'Master CV' },
  { value: 'COVER_LETTER', label: 'Cover Letter' },
  { value: 'GENERATED', label: 'Generated' },
];

export function matchesTypeFilter(
  document: CvDocument,
  filter: TypeFilter,
): boolean {
  if (filter === 'all') return true;
  if (filter === 'GENERATED') return GENERATED_KINDS.includes(document.kind);
  return document.kind === filter;
}

export function DocumentList({ documents }: { documents: CvDocument[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    (documents.find((document) => !isPreviousVersion(document)) ?? documents[0])
      ?.id ?? null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [search, setSearch] = useState('');
  // Previous versions are hidden by default - matches the "(previous)"
  // labels documentLabel() already computes.
  const [showPrevious, setShowPrevious] = useState(false);

  if (documents.length === 0) {
    return <EmptyState message="No documents yet." />;
  }

  const query = search.trim().toLowerCase();
  const visibleDocuments = documents.filter((document) => {
    if (!showPrevious && isPreviousVersion(document)) return false;
    if (!matchesTypeFilter(document, typeFilter)) return false;
    if (!query) return true;
    return (
      document.content.toLowerCase().includes(query) ||
      documentLabel(document).toLowerCase().includes(query)
    );
  });

  const selectedDocument =
    documents.find((document) => document.id === selectedId) ?? null;

  function selectDocument(id: string) {
    setSelectedId(id);
    setIsEditing(false);
  }

  return (
    <div className="flex flex-col items-start gap-4 md:flex-row">
      <div
        className={cn(
          surfaceVariants({ elevation: 'outlined' }),
          'flex w-full flex-col md:w-[400px] md:shrink-0',
        )}
      >
        <div className="flex flex-col gap-3 border-b border-border p-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by content…"
            aria-label="Search documents"
          />
          <Tabs
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as TypeFilter)}
          >
            <TabsList>
              {TYPE_FILTERS.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value}>
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <SegmentedControl
            value={showPrevious ? 'all' : 'latest'}
            onValueChange={(value) => setShowPrevious(value === 'all')}
            aria-label="Show previous versions"
          >
            <SegmentedControlItem value="latest">Latest</SegmentedControlItem>
            <SegmentedControlItem value="all">
              All versions
            </SegmentedControlItem>
          </SegmentedControl>
        </div>
        <div className="flex flex-col">
          {visibleDocuments.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              No documents match your filters.
            </p>
          ) : (
            visibleDocuments.map((document) => (
              <button
                key={document.id}
                type="button"
                onClick={() => selectDocument(document.id)}
                aria-current={document.id === selectedId}
                className={cn(
                  'flex flex-col items-start gap-1.5 border-b border-border p-3 text-left last:border-b-0 hover:bg-muted',
                  document.id === selectedId && 'bg-muted',
                )}
              >
                <Tag size="sm">{documentLabel(document)}</Tag>
                <span className="text-xs text-muted-foreground">
                  Updated {formatDate(document.updatedAt)}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
      <div
        className={cn(
          surfaceVariants({ elevation: 'outlined', padding: 'md' }),
          'min-w-0 flex-1',
        )}
      >
        {!selectedDocument ? (
          <EmptyState message="Select a document to view it." />
        ) : isEditing ? (
          <DocumentEditor
            key={selectedDocument.id}
            documentId={selectedDocument.id}
            content={selectedDocument.content}
            downloadFilename={documentFilename(selectedDocument)}
            onSaved={() => setIsEditing(false)}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Heading level={3} as="h2">
                {documentLabel(selectedDocument)}
              </Heading>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    downloadTextFile(
                      documentFilename(selectedDocument),
                      selectedDocument.content,
                    )
                  }
                >
                  Download
                </Button>
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm">
              {selectedDocument.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
