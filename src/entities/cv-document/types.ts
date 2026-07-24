export interface CvDocument {
  id: string;
  ownerId: string;
  isMaster: boolean;
  content: string;
  jobOfferId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
