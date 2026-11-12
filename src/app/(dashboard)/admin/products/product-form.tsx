'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormFileAttachments } from '@/components/form/form-file-attachments';
import { FormInput } from '@/components/form/form-input';
import { FormMoneyInput } from '@/components/form/form-money-input';
import { FormMultiSelect } from '@/components/form/form-multi-select';
import { FormSelect } from '@/components/form/form-select';
import { FormTextarea } from '@/components/form/form-textarea';
import { useCreateProduct } from '@/hooks/products/use-create-product';
import { useUpdateProduct } from '@/hooks/products/use-update-product';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage } from '@/lib/api';
import { parseMoney, toMoneyInputValue } from '@/lib/format';
import type { AttachmentPermissions } from '@/lib/permissions';
import { optionalMoneySchema, optionalTextSchema, storedFilesSchema } from '@/lib/schemas';
import type { Product, ProductInput, ProductRelation } from '@/types/product';

import type { ProductOptions } from './product-options';
import { formatMargin, PRODUCTS_HREF } from './products-config';

const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do produto'),
  manufacturerId: z.string().min(1, 'Selecione o fabricante'),
  groupIds: z.array(z.string()),
  price: optionalMoneySchema,
  costPrice: optionalMoneySchema,
  description: optionalTextSchema,
  files: storedFilesSchema,
});

type ProductFormInput = z.input<typeof productFormSchema>;
type ProductFormOutput = z.output<typeof productFormSchema>;

function toFormValues(product?: Product): ProductFormInput {
  return {
    name: product?.name ?? '',
    manufacturerId: product?.manufacturerId ?? '',
    groupIds: product?.groupIds ?? [],
    price: product?.price == null ? '' : toMoneyInputValue(product.price),
    costPrice: product?.costPrice == null ? '' : toMoneyInputValue(product.costPrice),
    description: product?.description ?? '',
    files: product?.files ?? [],
  };
}

function withCurrent(relations: ProductRelation[], current: ProductRelation[]) {
  const missing = current.filter(({ id }) => !relations.some((relation) => relation.id === id));

  return [...relations, ...missing].map(({ id, name }) => ({ value: id, label: name }));
}

type ProductFormProps = ProductOptions & {
  product?: Product;
  attachments: AttachmentPermissions | null;
};

export default function ProductForm({
  product,
  manufacturers,
  groups,
  attachments,
}: ProductFormProps) {
  const returnToList = useReturnToList(PRODUCTS_HREF);
  const { mutate: createProduct } = useCreateProduct();
  const { mutate: updateProduct } = useUpdateProduct();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: toFormValues(product),
  });
  const [price, costPrice] = useWatch({ control, name: ['price', 'costPrice'] });
  const margin = formatMargin(parseMoney(price), parseMoney(costPrice));
  const manufacturerOptions = withCurrent(manufacturers, product ? [product.manufacturer] : []);
  const groupOptions = withCurrent(groups ?? [], product?.groups ?? []);
  const showGroups = groups !== null || groupOptions.length > 0;

  async function handleSave({ groupIds, files, ...values }: ProductFormOutput) {
    if (isUploading) {
      setErrorMessage('Aguarde o envio dos anexos terminar para salvar.');
      return;
    }

    setErrorMessage(null);

    const input: ProductInput = {
      ...values,
      ...(groups && { groupIds }),
      ...(attachments && { fileIds: files.map((file) => file.id) }),
    };

    try {
      if (product) {
        await updateProduct(product.id, input);
      } else {
        await createProduct(input);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(product ? 'Alterações salvas.' : 'Produto cadastrado.');
  }

  return (
    <FormCard
      title='Dados do produto'
      description='Nome, fabricante, grupos e preços do produto.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={Boolean(product)}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref={PRODUCTS_HREF}
      createLabel='Cadastrar produto'
    >
      <div className='grid gap-5 sm:grid-cols-2'>
        <FormInput
          control={control}
          name='name'
          label='Nome'
          required
          autoComplete='off'
          placeholder='Ex.: Semente de soja'
          className='sm:col-span-2'
        />
        <FormSelect
          control={control}
          name='manufacturerId'
          label='Fabricante'
          required
          options={manufacturerOptions}
          placeholder='Selecione o fabricante'
          disabled={manufacturerOptions.length === 0}
          description={
            manufacturerOptions.length === 0 &&
            'Nenhum fabricante cadastrado na plataforma ainda.'
          }
        />
        {showGroups && (
          <FormMultiSelect
            control={control}
            name='groupIds'
            label='Grupos'
            options={groupOptions}
            placeholder='Selecione os grupos'
            emptyMessage='Nenhum grupo cadastrado.'
            disabled={!groups}
            description={!groups && 'Só quem tem acesso aos grupos de produtos pode trocá-los.'}
          />
        )}
        <FormMoneyInput control={control} name='price' label='Preço de venda' />
        <FormMoneyInput
          control={control}
          name='costPrice'
          label='Preço de custo'
          description={
            margin ? `Margem de ${margin}.` : 'Informe os dois preços para ver a margem.'
          }
        />
        <FormTextarea
          control={control}
          name='description'
          label='Descrição'
          placeholder='Detalhes que ajudam a equipe a identificar o produto'
          className='sm:col-span-2'
        />
        {attachments && (
          <FormFileAttachments
            control={control}
            name='files'
            label='Anexos'
            permissions={attachments}
            onUploadingChange={setIsUploading}
            className='sm:col-span-2'
          />
        )}
      </div>
    </FormCard>
  );
}
