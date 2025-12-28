const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();

console.log('App model exists:', typeof p.app !== 'undefined');
console.log('Available models:', Object.keys(p).filter(k => !k.startsWith('$') && typeof p[k] === 'object'));

if (p.app) {
  console.log('App model methods:', Object.keys(p.app));
} else {
  console.log('ERROR: App model does not exist!');
}

process.exit(0);
