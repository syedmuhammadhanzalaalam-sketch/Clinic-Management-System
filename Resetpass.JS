const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = bcrypt.hashSync('password', 12);
  await prisma.user.updateMany({ data: { password_hash: hash } });
  console.log('✅ Password reset for ALL users to: password');
  await prisma.$disconnect();
}

main().catch(console.error);