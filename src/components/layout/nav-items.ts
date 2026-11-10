import {
  Boxes,
  BriefcaseBusiness,
  Building,
  Building2,
  CalendarDays,
  Contact,
  Factory,
  Gauge,
  Handshake,
  House,
  Layers,
  type LucideIcon,
  MapPin,
  Megaphone,
  Package,
  Settings,
  ShieldCheck,
  Store,
  Tractor,
  UserCog,
  Users,
  UsersRound,
  Wallet,
  Wheat,
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string | string[];
};

export type NavGroup = {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
};

export type NavEntry = NavItem | NavGroup;

export type NavSection = {
  label?: string;
  platformOnly?: boolean;
  entries: NavEntry[];
};

const HOME_HREF = '/admin';

export const NAV_SECTIONS: NavSection[] = [
  { entries: [{ title: 'Início', href: HOME_HREF, icon: House }] },
  {
    label: 'Módulos',
    entries: [
      {
        title: 'Entidades',
        icon: Contact,
        items: [
          { title: 'Pessoas', href: '/admin/persons', icon: Users, permission: 'persons.read' },
          {
            title: 'Funcionários',
            href: '/admin/employees',
            icon: BriefcaseBusiness,
            permission: ['persons.read', 'employees.read'],
          },
          {
            title: 'Produtores',
            href: '/admin/producers',
            icon: Tractor,
            permission: ['persons.read', 'producers.read'],
          },
          {
            title: 'Revendas',
            href: '/admin/resellers',
            icon: Store,
            permission: 'resellers.read',
          },
        ],
      },
      {
        title: 'Comercial',
        icon: Handshake,
        items: [
          {
            title: 'Visitas',
            href: '/admin/commercial-trips',
            icon: MapPin,
            permission: 'commercial-trips.read',
          },
          {
            title: 'Ações comerciais',
            href: '/admin/commercial-actions',
            icon: Megaphone,
            permission: 'commercial-actions.read',
          },
          {
            title: 'Eventos',
            href: '/admin/events',
            icon: CalendarDays,
            permission: 'events.read',
          },
          {
            title: 'Carteiras',
            href: '/admin/wallets',
            icon: Wallet,
            permission: 'wallets.read',
          },
        ],
      },
      {
        title: 'Catálogo',
        icon: Boxes,
        items: [
          {
            title: 'Produtos',
            href: '/admin/products',
            icon: Package,
            permission: 'products.read',
          },
          {
            title: 'Grupos de produtos',
            href: '/admin/groups',
            icon: Layers,
            permission: 'groups.read',
          },
        ],
      },
      {
        title: 'Configurações',
        icon: Settings,
        items: [
          {
            title: 'Potenciais',
            href: '/admin/potentials',
            icon: Gauge,
            permission: 'potentials.read',
          },
          {
            title: 'Equipe',
            href: '/admin/members',
            icon: UsersRound,
            permission: 'members.read',
          },
          {
            title: 'Cargos',
            href: '/admin/roles',
            icon: ShieldCheck,
            permission: 'roles.read',
          },
          {
            title: 'Empresa',
            href: '/admin/company',
            icon: Building2,
            permission: 'company.update',
          },
        ],
      },
    ],
  },
  {
    label: 'Plataforma',
    platformOnly: true,
    entries: [
      { title: 'Empresas', href: '/admin/platform/companies', icon: Building },
      { title: 'Usuários', href: '/admin/platform/users', icon: UserCog },
      { title: 'Fabricantes', href: '/admin/platform/manufacturers', icon: Factory },
      { title: 'Culturas', href: '/admin/platform/harvests', icon: Wheat },
    ],
  },
];

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry;
}

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((section) =>
  section.entries.flatMap((entry) => (isNavGroup(entry) ? entry.items : [entry])),
);

function hasEveryPermission(granted: string[], required: NavItem['permission']): boolean {
  return [required ?? []].flat().every((permission) => granted.includes(permission));
}

function getVisibleEntry(entry: NavEntry, permissions: string[]): NavEntry | null {
  if (!isNavGroup(entry)) {
    return hasEveryPermission(permissions, entry.permission) ? entry : null;
  }

  const items = entry.items.filter((item) => hasEveryPermission(permissions, item.permission));

  return items.length > 0 ? { ...entry, items } : null;
}

export function getVisibleNavSections(
  permissions: string[],
  isPlatformAdmin: boolean,
): NavSection[] {
  return NAV_SECTIONS.filter((section) => !section.platformOnly || isPlatformAdmin)
    .map((section) => ({
      ...section,
      entries: section.entries
        .map((entry) => getVisibleEntry(entry, permissions))
        .filter((entry) => entry !== null),
    }))
    .filter((section) => section.entries.length > 0);
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === HOME_HREF) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isNavGroupActive(pathname: string, group: NavGroup): boolean {
  return group.items.some((item) => isNavItemActive(pathname, item.href));
}
