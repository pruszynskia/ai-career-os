'use client';

import { useState } from 'react';

import type { CvDocument } from '@/entities/cv-document/types';
import { CV_DOCUMENT_KIND_LABEL } from '@/entities/cv-document/types';
import { downloadTextFile } from '@/shared/utils/download-text-file';
import { Badge } from '@/shared/ui/primitives/feedback/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
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

function documentFilename(document: CvDocument): string {
  return `${documentLabel(document).toLowerCase().replace(/\s+/g, '-')}-${document.id}.txt`;
}

export function DocumentList({ documents }: { documents: CvDocument[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (documents.length === 0) {
    return <EmptyState message="No documents yet." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {documents.map((document) => (
        <Card key={document.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">{documentLabel(document)}</Badge>
              <span className="text-sm font-normal text-muted-foreground">
                {document.updatedAt.toLocaleDateString()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {editingId === document.id ? (
              <DocumentEditor
                key={document.id}
                documentId={document.id}
                content={document.content}
                downloadFilename={documentFilename(document)}
                onSaved={() => setEditingId(null)}
              />
            ) : (
              <>
                <p className="line-clamp-3 whitespace-pre-wrap text-sm">
                  {document.content}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(document.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadTextFile(
                        documentFilename(document),
                        document.content,
                      )
                    }
                  >
                    Download
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
