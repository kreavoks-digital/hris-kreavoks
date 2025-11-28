import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Seed Departments
  const departments = [
    { code: 'IT', name: 'Information Technology', description: 'IT Department' },
    { code: 'HR', name: 'Human Resources', description: 'HR Department' },
    { code: 'FIN', name: 'Finance', description: 'Finance Department' },
    { code: 'MKT', name: 'Marketing', description: 'Marketing Department' },
    { code: 'OPS', name: 'Operations', description: 'Operations Department' }
  ]

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept
    })
  }

  console.log('✅ Departments seeded')

  // Seed Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kreavoks.com' },
    update: {},
    create: {
      email: 'admin@kreavoks.com',
      password: '$2a$10$YourHashedPasswordHere', // TODO: Hash password properly
      name: 'Admin User',
      role: 'ADMIN'
    }
  })

  console.log('✅ Admin user created')

  // Seed Sample Employees
  const employees: any[] = [
    {
      nik: 'EMP001',
      name: 'John Doe',
      email: 'john.doe@kreavoks.com',
      phone: '08123456789',
      birthDate: new Date('1990-01-15'),
      address: 'Jakarta, Indonesia',
      department: 'IT',
      position: 'Software Engineer',
      joinDate: new Date('2023-01-01'),
      employmentType: 'PERMANENT' as const,
      salary: 8000000,
      status: 'ACTIVE' as const
    },
    {
      nik: 'EMP002',
      name: 'Jane Smith',
      email: 'jane.smith@kreavoks.com',
      phone: '08123456790',
      birthDate: new Date('1992-05-20'),
      address: 'Bandung, Indonesia',
      department: 'HR',
      position: 'HR Manager',
      joinDate: new Date('2023-02-01'),
      employmentType: 'PERMANENT' as const,
      salary: 10000000,
      status: 'ACTIVE' as const
    },
    {
      nik: 'EMP003',
      name: 'Bob Johnson',
      email: 'bob.johnson@kreavoks.com',
      phone: '08123456791',
      birthDate: new Date('1995-08-10'),
      address: 'Surabaya, Indonesia',
      department: 'Finance',
      position: 'Financial Analyst',
      joinDate: new Date('2023-03-01'),
      employmentType: 'CONTRACT' as const,
      salary: 7000000,
      status: 'ACTIVE' as const
    }
  ]

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { nik: emp.nik },
      update: {},
      create: emp
    })
  }

  console.log('✅ Sample employees seeded')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
