import type {
  ContactInformation,
  ProductResponse,
  ProductVariantResponse,
  ShopSetting,
} from '@halo-dev/api-client';

export function isInquiryVariant(variant: ProductVariantResponse | null | undefined): boolean {
  return variant?.pricingType === 'INQUIRY';
}

/** An empty list is not evidence that a product only has inquiry variants. */
export function isInquiryProduct(product: ProductResponse | null | undefined): boolean {
  return (
    product?.productType !== 'EXTERNAL' &&
    !!product?.productVariants?.length &&
    product.productVariants.every(isInquiryVariant)
  );
}

export type InquiryAction =
  | { type: 'redirect'; target: string }
  | { type: 'contacts'; contacts: ContactInformation[] }
  | { type: 'unavailable' };

/** A configured redirect always takes priority over the contact list. */
export function resolveInquiryAction(setting: ShopSetting): InquiryAction {
  const target = setting.inquiryRedirectUrl?.trim();
  if (target) {
    return { type: 'redirect', target };
  }
  const contacts = (setting.contacts ?? []).filter((contact) =>
    contact.type === 'LINK'
      ? !!contact.linkUrl?.trim()
      : contact.type === 'IMAGE' && !!contact.image?.trim(),
  );
  return contacts.length ? { type: 'contacts', contacts } : { type: 'unavailable' };
}
