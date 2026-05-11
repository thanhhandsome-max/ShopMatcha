import prisma from '../db/prisma';

export type CustomerAddress = {
  address_id: string;
  ten: string | null;
  Sdt: string | null;
  tinhthanhpho: string | null;
  quanhuyen: string | null;
  coinh: string | null;
};

export async function getAddressesForCustomerEmail(customerEmail: string): Promise<{ customer: { MaKH: string; TenKH: string | null; Email: string | null } | null; addresses: CustomerAddress[] }> {
  const customer = await prisma.khachhang.findFirst({
    where: { Email: customerEmail },
    select: { MaKH: true, TenKH: true, Email: true }
  });

  if (!customer) {
    return { customer: null, addresses: [] };
  }

  const addresses = await prisma.address.findMany({
    where: { Makh: customer.MaKH },
    orderBy: { address_id: 'asc' },
    select: {
      address_id: true,
      ten: true,
      Sdt: true,
      tinhthanhpho: true,
      quanhuyen: true,
      coinh: true
    }
  });

  return { customer, addresses };
}