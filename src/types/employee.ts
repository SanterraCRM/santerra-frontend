export type Employee = {
  id: string;
  personId: string;
  userCompanyId: string | null;
  hiredAt: string | null;
  terminatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeInput = Pick<Employee, 'userCompanyId' | 'hiredAt' | 'terminatedAt'>;
