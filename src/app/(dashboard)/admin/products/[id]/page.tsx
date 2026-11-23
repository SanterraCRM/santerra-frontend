import { Package } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { BadgeList } from '@/components/list/badge-list';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { hasPermission, requireSession } from '@/lib/session';
import type { ProductView } from '@/types/product';

import {
  formatMeasure,
  getProductName,
  isProductActive,
  PRODUCT_DELETE_TEXTS,
  PRODUCTS_HREF,
} from '../products-config';

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

function getProduct(id: string, token: string): Promise<ProductView> {
  return getRecordOrNotFound<ProductView>(`/products/${id}`, token);
}

function formatPurchaseUnit(product: ProductView): string | null {
  if (!product.purchaseUnity) {
    return null;
  }

  return product.purchaseQuantity === null
    ? product.purchaseUnity
    : `${product.purchaseUnity} com ${product.purchaseQuantity} ${product.stockUnity ?? 'un.'}`;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'products.read')) {
    return { title: 'Produto' };
  }

  const { id } = await params;
  const product = await getProduct(id, session.accessToken);

  return { title: getProductName(product) };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const session = await requireSession('products.read');
  const { id } = await params;
  const canDelete = hasPermission(session, 'products.delete');
  const product = await getProduct(id, session.accessToken);
  const productName = getProductName(product);
  const status = isProductActive(product) ? 'Ativo' : 'Inativo';

  return (
    <RecordPageLayout
      backHref={PRODUCTS_HREF}
      backLabel='Produtos'
      icon={Package}
      title={productName}
      description={[product.manufacturer, `Código ${product.id}`, status].filter(Boolean).join(' · ')}
      actions={
        canDelete && (
          <DeleteRecordButton
            {...PRODUCT_DELETE_TEXTS}
            recordName={productName}
            deletePath={`/products/${product.id}`}
            listHref={PRODUCTS_HREF}
          />
        )
      }
    >
      <RecordDetails
        title='Dados do produto'
        description='Dados disponíveis apenas para consulta.'
        fields={[
          { label: 'Nome', value: product.product },
          { label: 'Código', value: product.id },
          { label: 'Fabricante', value: product.manufacturer },
          { label: 'Situação', value: status },
          { label: 'Departamento', value: product.department },
          { label: 'Seção', value: product.section },
          { label: 'Categoria', value: product.category },
          { label: 'Linha', value: product.line },
          {
            label: 'Culturas atendidas',
            value: product.crops.length > 0 ? <BadgeList labels={product.crops} /> : null,
            wide: true,
          },
          { label: 'Unidade de estoque', value: product.stockUnity },
          { label: 'Unidade de compra', value: formatPurchaseUnit(product) },
          { label: 'Peso bruto', value: formatMeasure(product.weight, 'kg') },
          { label: 'Peso líquido', value: formatMeasure(product.weightNet, 'kg') },
          { label: 'Volume', value: formatMeasure(product.volume) },
          { label: 'NCM', value: product.ncm },
        ]}
      />
    </RecordPageLayout>
  );
}
