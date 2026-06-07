const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = bcrypt.hashSync('password', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@clinic.test' },
    update: { password_hash: hash },
    create: {
      name: 'Admin',
      email: 'admin@clinic.test',
      password_hash: hash,
      role: 'admin',
      is_active: true,
    },
  });
  console.log('✅ Admin:', admin.email);

  // Doctor
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@clinic.test' },
    update: { password_hash: hash },
    create: {
      name: 'Dr. John',
      email: 'doctor@clinic.test',
      password_hash: hash,
      role: 'doctor',
      is_active: true,
    },
  });

  await prisma.doctor.upsert({
    where: { user_id: doctorUser.id },
    update: {},
    create: {
      user_id: doctorUser.id,
      license_number: 'LIC-001',
      qualification: 'MBBS',
      consultation_fee: 2500,
      experience_years: 5,
    },
  });
  console.log('✅ Doctor:', doctorUser.email);

  // Patient
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@clinic.test' },
    update: { password_hash: hash },
    create: {
      name: 'Ali Hassan',
      email: 'patient@clinic.test',
      password_hash: hash,
      role: 'patient',
      is_active: true,
    },
  });

  await prisma.patient.upsert({
    where: { user_id: patientUser.id },
    update: {},
    create: {
      user_id: patientUser.id,
      date_of_birth: '1990-01-01',
      gender: 'Male',
      blood_group: 'B+',
    },
  });
  console.log('✅ Patient:', patientUser.email);

  console.log('\n🎉 Done! Login credentials:');
  console.log('   Admin:   admin@clinic.test   / password');
  console.log('   Doctor:  doctor@clinic.test  / password');
  console.log('   Patient: patient@clinic.test / password');
}

main().catch(console.error).finally(() => prisma.$disconnect());
