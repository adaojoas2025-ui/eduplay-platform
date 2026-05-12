const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const expires = new Date();
expires.setDate(expires.getDate() + 30);
p.irpLicense.create({
  data: {
    licenseKey: 'IRP-TEST-AAAA-BBBB-CCCC',
    email: 'adao1980aguiar@gmail.com',
    status: 'active',
    expiresAt: expires
  }
})
.then(r => { console.log('Chave criada:', r.licenseKey); console.log('Validade:', r.expiresAt.toLocaleDateString('pt-BR')); return p.$disconnect(); })
.then(() => process.exit(0))
.catch(e => { console.error('Erro:', e.message); process.exit(1); });
