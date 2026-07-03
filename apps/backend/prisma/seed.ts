/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const tenantId = 't1';

  // 1. Create Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { tenantId },
    update: {},
    create: {
      tenantId,
      name: 'Gourmet Haven',
      legalName: 'Gourmet Haven Pvt Ltd',
      brandName: 'Gourmet Haven',
      gstNumber: '27AAAAA0000A1Z1',
      fssaiLicense: '10021022000123',
      panNumber: 'ABCDE1234F',
      email: 'contact@gourmethaven.com',
      phone: '9876543210',
      whatsapp: '9876543210',
      country: 'India',
      state: 'Maharashtra',
      city: 'Mumbai',
      district: 'Mumbai',
      postalCode: '400050',
      address: '123 Linking Road, Bandra West, Mumbai',
      restaurantType: 'FINE_DINE',
    },
  });

  // 2. Create Branch
  const branch = await prisma.branch.upsert({
    where: { tenantId_code: { tenantId, code: 'BR-MUM' } },
    update: {},
    create: {
      tenantId,
      name: 'Mumbai Outlet',
      code: 'BR-MUM',
      phone: '9876543210',
      email: 'mumbai@gourmethaven.com',
      address: '456 Linking Road, Bandra West, Mumbai',
      workingHours: '11:00 AM - 11:00 PM',
      status: 'ACTIVE',
    },
  });

  // 3. Create Role
  const role = await prisma.role.upsert({
    where: { tenantId_name: { tenantId, name: 'OWNER' } },
    update: {},
    create: {
      tenantId,
      name: 'OWNER',
      description: 'Super User Owner Account',
    },
  });

  // 4. Create Owner User
  const passwordHash = await bcrypt.hash('admin123', 10);
  const pinHash = await bcrypt.hash('1234', 10); // PIN code for waiter logins

  const user = await prisma.user.upsert({
    where: { tenantId_username: { tenantId, username: 'admin' } },
    update: {},
    create: {
      tenantId,
      username: 'admin',
      passwordHash,
      pinHash,
      email: 'admin@gourmethaven.com',
      phone: '9876543210',
      status: 'ACTIVE',
      roleId: role.id,
      designation: 'Managing Director',
      department: 'Management',
    },
  });

  // 5. Map User to Branch
  await prisma.userBranch.upsert({
    where: { userId_branchId: { userId: user.id, branchId: branch.id } },
    update: {},
    create: {
      userId: user.id,
      branchId: branch.id,
    },
  });

  console.log('Seeding completed successfully!');
  console.log(`Organization Tenant ID: ${tenantId}`);
  console.log(`Owner Account username: admin`);
  console.log(`Owner Account password: admin123`);
  console.log(`Owner Waiter PIN: 1234`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
