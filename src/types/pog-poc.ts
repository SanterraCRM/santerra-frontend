export type PogPocReseller = {
  id: number;
  name: string;
};

export type PogPoc = {
  codigo_produto: number | null;
  produto: string | null;
  cnpj: string | null;
  regiao: string | null;
  pog: string | null;
  poc: string | null;
  reseller: PogPocReseller | null;
};

export type PogPocFilterOptions = {
  regioes: string[];
};
