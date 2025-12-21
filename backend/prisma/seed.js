/**
 * Database Seed
 * Creates initial admin user
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@educaplaja.com.br' },
    update: {},
    create: {
      name: 'Administrador EducaplaJA',
      email: 'admin@educaplaja.com.br',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Admin user created/updated:', {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });

  // Create test producer/seller user
  const sellerPassword = await bcrypt.hash('Senha123', 10);
  const seller = await prisma.user.upsert({
    where: { email: 'teste@exemplo.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'teste@exemplo.com',
      password: sellerPassword,
      role: 'PRODUCER',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Seller user created/updated:', {
    id: seller.id,
    name: seller.name,
    email: seller.email,
  });

  // Create sample products
  const products = [
    {
      slug: 'curso-completo-desenvolvimento-web',
      title: 'Curso Completo de Desenvolvimento Web',
      description: 'Aprenda HTML, CSS, JavaScript, React e Node.js do zero ao avançado. Mais de 200 aulas práticas com projetos reais.',
      price: 297.00,
      category: 'Programação',
      level: 'Iniciante',
      language: 'Português',
      certificateIncluded: true,
      hasSupport: true,
      status: 'PUBLISHED',
      producerId: seller.id,
    },
    {
      slug: 'marketing-digital-iniciantes',
      title: 'Marketing Digital para Iniciantes',
      description: 'Domine as estratégias de marketing digital, SEO, Google Ads e redes sociais para alavancar seu negócio online.',
      price: 197.00,
      category: 'Marketing',
      level: 'Iniciante',
      language: 'Português',
      certificateIncluded: true,
      hasSupport: true,
      status: 'PUBLISHED',
      producerId: seller.id,
    },
    {
      slug: 'python-data-science',
      title: 'Python para Data Science',
      description: 'Curso completo de análise de dados com Python, Pandas, NumPy e visualização de dados. Inclui projetos práticos.',
      price: 347.00,
      category: 'Programação',
      level: 'Intermediário',
      language: 'Português',
      certificateIncluded: true,
      hasSupport: true,
      status: 'PUBLISHED',
      producerId: seller.id,
    },
    {
      slug: 'design-grafico-profissional',
      title: 'Design Gráfico Profissional',
      description: 'Aprenda Photoshop, Illustrator e Figma do básico ao avançado. Crie logos, banners e identidades visuais incríveis.',
      price: 247.00,
      category: 'Design',
      level: 'Intermediário',
      language: 'Português',
      certificateIncluded: true,
      hasSupport: true,
      status: 'PUBLISHED',
      producerId: seller.id,
    },
    {
      slug: 'ingles-fluente-6-meses',
      title: 'Inglês Fluente em 6 Meses',
      description: 'Método comprovado para falar inglês fluentemente. Videoaulas, exercícios práticos e conversação ao vivo.',
      price: 397.00,
      category: 'Idiomas',
      level: 'Iniciante',
      language: 'Português',
      certificateIncluded: true,
      hasSupport: true,
      status: 'PUBLISHED',
      producerId: seller.id,
    },
    {
      slug: 'excel-avancado-negocios',
      title: 'Excel Avançado para Negócios',
      description: 'Domine tabelas dinâmicas, macros, VBA e dashboards profissionais. Torne-se um especialista em Excel.',
      price: 147.00,
      category: 'Produtividade',
      level: 'Avançado',
      language: 'Português',
      certificateIncluded: true,
      hasSupport: true,
      status: 'PUBLISHED',
      producerId: seller.id,
    },
    {
      slug: 'fotografia-profissional',
      title: 'Fotografia Profissional',
      description: 'Aprenda técnicas avançadas de fotografia, iluminação, composição e edição com Lightroom e Photoshop.',
      price: 277.00,
      category: 'Design',
      level: 'Intermediário',
      language: 'Português',
      certificateIncluded: true,
      hasSupport: true,
      status: 'PUBLISHED',
      producerId: seller.id,
    },
    {
      slug: 'gestao-projetos-pmp',
      title: 'Gestão de Projetos - PMP',
      description: 'Preparatório completo para certificação PMP. Metodologias ágeis, Scrum e ferramentas de gestão.',
      price: 497.00,
      category: 'Gestão',
      level: 'Avançado',
      language: 'Português',
      certificateIncluded: true,
      hasSupport: true,
      status: 'PUBLISHED',
      producerId: seller.id,
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: {
        slug: productData.slug,
      },
      update: {},
      create: productData,
    });
  }

  console.log('✅ Sample products created/updated');

  console.log('\n📋 Login credentials:');
  console.log('Admin: admin@eduplay.com.br / admin123');
  console.log('Seller: teste@exemplo.com / Senha123');
  console.log('\n⚠️  IMPORTANTE: Altere essas senhas após o primeiro login!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Seed completed successfully!');
  })
  .catch(async (e) => {
    console.error('❌ Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
