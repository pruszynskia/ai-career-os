import type { CvDocument, Profile } from '@prisma/client';

export interface UploadCvResponse {
  profile: Profile;
  cvDocument: CvDocument;
}
