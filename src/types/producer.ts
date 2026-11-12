export type Producer = {
  id: string;
  personId: string;
  potentialId: string;
  address: string | null;
  mainCrop: string | null;
  totalArea: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ProducerInput = Pick<Producer, 'potentialId' | 'address' | 'mainCrop' | 'totalArea'>;
