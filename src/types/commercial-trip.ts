import type { StoredFile } from './file';

export type CommercialTripStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type CommercialTripRelation = {
  id: string;
  name: string;
};

// Produto da view do ERP: o código é numérico (cd_prod).
export type CommercialTripProduct = {
  id: number;
  name: string;
};

export type CommercialTrip = {
  id: string;
  status: CommercialTripStatus;
  expectedDate: string | null;
  tripDate: string | null;
  performedActionDescription: string | null;
  followUpDetails: string | null;
  pendingIssuesDescription: string | null;
  producerId: string;
  responsibleId: string;
  participantIds: string[];
  harvestIds: string[];
  recommendedProductIds: number[];
  fileIds: string[];
  producer: CommercialTripRelation;
  responsible: CommercialTripRelation;
  participants: CommercialTripRelation[];
  harvests: CommercialTripRelation[];
  recommendedProducts: CommercialTripProduct[] | null;
  files: StoredFile[] | null;
  createdAt: string;
  updatedAt: string;
};

export type CommercialTripInput = Pick<
  CommercialTrip,
  | 'status'
  | 'expectedDate'
  | 'tripDate'
  | 'performedActionDescription'
  | 'followUpDetails'
  | 'pendingIssuesDescription'
  | 'producerId'
  | 'responsibleId'
  | 'participantIds'
  | 'harvestIds'
> & {
  recommendedProductIds?: number[];
  fileIds?: string[];
};
