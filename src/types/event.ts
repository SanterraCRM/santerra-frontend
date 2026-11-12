export type Event = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventListItem = Event & {
  actionsCount: number;
};

export type EventInput = Pick<Event, 'name' | 'description'>;
