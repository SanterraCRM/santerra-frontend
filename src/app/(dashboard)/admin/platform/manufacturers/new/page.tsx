import { Factory } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';

import ManufacturerForm from '../manufacturer-form';

export const metadata: Metadata = {
  title: 'Novo fabricante',
};

export default function NewManufacturerPage() {
  return (
    <RecordPageLayout
      backHref='/admin/platform/manufacturers'
      backLabel='Fabricantes'
      icon={Factory}
      title='Novo fabricante'
      description='Preencha os dados para cadastrar um fabricante para todas as empresas.'
    >
      <ManufacturerForm />
    </RecordPageLayout>
  );
}
