import type { StoredFile } from './file';

export type CommercialActionRelation = {
  id: string;
  name: string;
};

export type CommercialAction = {
  id: string;
  description: string | null;
  price: number | null;
  initialDate: string | null;
  finalDate: string | null;
  invoiceNumber: string | null;
  eventId: string;
  walletId: string;
  responsibleId: string;
  producerGuestIds: string[];
  resellerGuestIds: string[];
  participantIds: string[];
  fileIds: string[];
  event: CommercialActionRelation;
  responsible: CommercialActionRelation;
  wallet: CommercialActionRelation;
  producerGuests: CommercialActionRelation[];
  resellerGuests: CommercialActionRelation[];
  participants: CommercialActionRelation[];
  files: StoredFile[] | null;
  createdAt: string;
  updatedAt: string;
};

export type CommercialActionInput = Pick<
  CommercialAction,
  | 'description'
  | 'price'
  | 'initialDate'
  | 'finalDate'
  | 'invoiceNumber'
  | 'eventId'
  | 'walletId'
  | 'responsibleId'
  | 'participantIds'
> & {
  producerGuestIds?: string[];
  resellerGuestIds?: string[];
  fileIds?: string[];
};
