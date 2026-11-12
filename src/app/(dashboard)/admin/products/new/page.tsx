import { Package } from 'lucide-react';
import type { Metadata } from 'next';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { getAttachmentPermissions } from '@/lib/permissions';
import { requireSession } from '@/lib/session';

import ProductForm from '../product-form';
import { getProductOptions } from '../product-options';
import { PRODUCTS_HREF } from '../products-config';

export const metadata: Metadata = {
  title: 'Novo produto',
};

export default async function NewProductPage() {
  const session = await requireSession('products.create');
  const options = await getProductOptions(session);

  return (
    <RecordPageLayout
      backHref={PRODUCTS_HREF}
      backLabel='Produtos'
      icon={Package}
      title='Novo produto'
      description='Preencha os dados para cadastrar um produto no catálogo.'
    >
      <ProductForm {...options} attachments={getAttachmentPermissions(session.permissions)} />
    </RecordPageLayout>
  );
}
