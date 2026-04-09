import { prisma } from "@/lib/prisma";

export async function listOrdersByUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}
