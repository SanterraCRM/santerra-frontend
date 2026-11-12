import { Package } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { FileAttachments } from '@/components/files/file-attachments';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatCurrency, formatDate } from '@/lib/format';
import { getAttachmentPermissions } from '@/lib/permissions';
import { hasPermission, requireSession } from '@/lib/session';
import type { Product } from '@/types/product';

import ProductForm from '../product-form';
import { getProductOptions } from '../product-options';
import { formatMargin, PRODUCT_DELETE_TEXTS, PRODUCTS_HREF } from '../products-config';

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

function getProduct(id: string, token: string): Promise<Product> {
  return getRecordOrNotFound<Product>(`/products/${id}`, token);
}

function formatPrice(value: number | null): string | null {
  return value === null ? null : formatCurrency(value);
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'products.read')) {
    return { title: 'Produto' };
  }

  const { id } = await params;
  const product = await getProduct(id, session.accessToken);

  return { title: product.name };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const session = await requireSession('products.read');
  const { id } = await params;
  const canUpdate = hasPermission(session, 'products.update');
  const canDelete = hasPermission(session, 'products.delete');
  const [product, options] = await Promise.all([
    getProduct(id, session.accessToken),
    canUpdate ? getProductOptions(session) : null,
  ]);
  const groupNames = product.groups.map((group) => group.name).join(', ');

  return (
    <RecordPageLayout
      backHref={PRODUCTS_HREF}
      backLabel='Produtos'
      icon={Package}
      title={product.name}
      description={`${product.manufacturer.name} · Cadastro criado em ${formatDate(product.createdAt, 'long')}`}
      actions={
        canDelete && (
          <DeleteRecordButton
            {...PRODUCT_DELETE_TEXTS}
            recordName={product.name}
            deletePath={`/products/${product.id}`}
            listHref={PRODUCTS_HREF}
          />
        )
      }
    >
      {options ? (
        <ProductForm
          product={product}
          {...options}
          attachments={getAttachmentPermissions(session.permissions)}
        />
      ) : (
        <RecordDetails
          title='Dados do produto'
          fields={[
            { label: 'Nome', value: product.name },
            { label: 'Fabricante', value: product.manufacturer.name },
            { label: 'Grupos', value: groupNames, wide: true },
            { label: 'Preço de venda', value: formatPrice(product.price) },
            { label: 'Preço de custo', value: formatPrice(product.costPrice) },
            { label: 'Margem', value: formatMargin(product.price, product.costPrice), wide: true },
            { label: 'Descrição', value: product.description, wide: true },
            ...(product.files
              ? [{ label: 'Anexos', value: <FileAttachments files={product.files} />, wide: true }]
              : []),
          ]}
        />
      )}
    </RecordPageLayout>
  );
}
