import { listDocuments } from '@/features/document/services/list-documents.service';
import { DocumentList } from '@/features/document/components/document-list';
import { AppPageLayout } from '@/shared/layouts';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const documents = await listDocuments();

  return (
    <AppPageLayout title="Documents">
      <DocumentList documents={documents} />
    </AppPageLayout>
  );
}
