export type Role = {
  id: string;
  name: string;
  description: string | null;
  permissionIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type RoleListItem = Role & {
  membersCount: number;
};

export type RoleInput = Pick<Role, 'name' | 'description' | 'permissionIds'>;
