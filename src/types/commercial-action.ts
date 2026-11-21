import type { StoredFile } from './file';

export type CommercialActionRelation = {
  id: string;
  name: string;
};

export type CommercialActionReseller = {
  id: number;
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
  resellerGuestIds: number[];
  participantIds: string[];
  fileIds: string[];
  event: CommercialActionRelation;
  responsible: CommercialActionRelation;
  wallet: CommercialActionRelation;
  producerGuests: CommercialActionRelation[];
  resellerGuests: CommercialActionReseller[];
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
  resellerGuestIds?: number[];
  fileIds?: string[];
};
