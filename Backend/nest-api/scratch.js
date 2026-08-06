const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany().then(users => console.log(users.map(u => ({ id: u.id, username: u.username, lastActive: u.lastActive })))).catch(console.error).finally(() => prisma['$disconnect']());
