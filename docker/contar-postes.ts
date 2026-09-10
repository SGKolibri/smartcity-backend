/**
 * Imprime a quantidade de postes no banco. Usado pelo entrypoint do container
 * para decidir se roda seed + backfill (DB_BOOTSTRAP=auto).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  console.log(await prisma.poste.count());
} finally {
  await prisma.$disconnect();
}
