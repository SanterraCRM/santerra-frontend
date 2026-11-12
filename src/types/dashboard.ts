import type { CommercialTripStatus } from './commercial-trip';

export type DashboardRelation = {
  id: string;
  name: string;
};

export type DashboardSummary = {
  producers: {
    total: number;
    byPotential: (DashboardRelation & { count: number })[];
  } | null;
  trips: {
    byStatus: Record<CommercialTripStatus, number>;
    upcoming: {
      id: string;
      status: CommercialTripStatus;
      expectedDate: string | null;
      producer: DashboardRelation;
      responsible: DashboardRelation;
    }[];
  } | null;
  actions: {
    month: string;
    monthTotal: number;
    byEvent: (DashboardRelation & { total: number })[];
    recent: {
      id: string;
      description: string | null;
      price: number | null;
      initialDate: string | null;
      event: DashboardRelation;
      wallet: DashboardRelation;
    }[];
  } | null;
  wallets: {
    count: number;
    totalBalance: number;
  } | null;
};
