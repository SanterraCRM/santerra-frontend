export type GoalMetric = 'COMPLETED_TRIPS' | 'VISITED_PRODUCERS' | 'COMMERCIAL_ACTIONS' | 'SALES';

export type GoalRelation = {
  id: string;
  name: string;
};

export type Goal = {
  id: string;
  employeeId: string;
  employee: GoalRelation;
  metric: GoalMetric;
  targetValue: number;
  achievedValue: number | null;
  achieved: number;
  startDate: string;
  endDate: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GoalInput = Pick<
  Goal,
  'employeeId' | 'metric' | 'targetValue' | 'achievedValue' | 'startDate' | 'endDate' | 'description'
>;

export type GoalMetricSummary = {
  metric: GoalMetric;
  goalsCount: number;
  targetValue: number;
  achieved: number;
};

export type GoalSummary = {
  byMetric: GoalMetricSummary[];
};
