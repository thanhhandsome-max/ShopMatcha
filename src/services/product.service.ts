import { prisma } from "@/lib/prisma";

export async function listProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
  });
}
