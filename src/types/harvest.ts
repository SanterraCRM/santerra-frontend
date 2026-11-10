export type Harvest = {
  id: string;
  name: string;
  tripsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type HarvestInput = Pick<Harvest, 'name'>;
