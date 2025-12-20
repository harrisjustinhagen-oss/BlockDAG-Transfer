import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const prisma = new PrismaClient();

export async function registerRoutes(app: FastifyInstance) {
  // health
  app.get('/health', async () => ({ ok: true }));

  // create or get user by handle
  app.post('/users', async (req, reply) => {
    const bodySchema = z.object({ handle: z.string().min(3).max(64) });
    const { handle } = bodySchema.parse(req.body);
    const user = await prisma.user.upsert({
      where: { handle },
      update: {},
      create: { handle },
    });
    return reply.code(200).send(user);
  });

  // get slots for user
  app.get('/team/slots/:handle', async (req, reply) => {
    const paramsSchema = z.object({ handle: z.string() });
    const { handle } = paramsSchema.parse(req.params);
    const user = await prisma.user.findUnique({ where: { handle } });
    if (!user) return reply.code(404).send({ error: 'user not found' });

    const now = new Date();
    const slots = await prisma.teamSlot.findMany({ where: { userId: user.id } });
    // prune expired
    await Promise.all(
      slots.map(async s => {
        if (s.expiresAt && s.expiresAt < now) {
          await prisma.teamSlot.update({ where: { id: s.id }, data: { accepted: false, invitedId: null, expiresAt: null } }).catch(() => {});
        }
      })
    );
    const fresh = await prisma.teamSlot.findMany({ where: { userId: user.id } });
    return reply.code(200).send(fresh);
  });

  // set/update invite for a slot with one-team-per-user enforcement
  app.post('/team/slots', async (req, reply) => {
    const bodySchema = z.object({
      handle: z.string(),
      set: z.string(),
      invitedId: z.string().min(1),
    });
    const { handle, set, invitedId } = bodySchema.parse(req.body);

    const user = await prisma.user.upsert({ where: { handle }, update: {}, create: { handle } });

    // remove invitedId from any other slots (global uniqueness)
    await prisma.teamSlot.updateMany({ where: { invitedId }, data: { invitedId: null, accepted: false, expiresAt: null } });

    const existing = await prisma.teamSlot.findFirst({ where: { userId: user.id, set } });
    const slot = existing
      ? await prisma.teamSlot.update({ where: { id: existing.id }, data: { invitedId, accepted: false, expiresAt: null } })
      : await prisma.teamSlot.create({ data: { userId: user.id, set, invitedId, accepted: false } });

    return reply.code(200).send(slot);
  });

  app.post('/team/slots/accept', async (req, reply) => {
    const bodySchema = z.object({ handle: z.string(), set: z.string() });
    const { handle, set } = bodySchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { handle } });
    if (!user) return reply.code(404).send({ error: 'user not found' });

    // find slot for this user as invitedId
    const slot = await prisma.teamSlot.findFirst({ where: { invitedId: handle, set } });
    if (!slot) return reply.code(404).send({ error: 'invite not found' });

    const expiresAt = new Date(Date.now() + WEEK_MS);
    const updated = await prisma.teamSlot.update({
      where: { id: slot.id },
      data: { accepted: true, expiresAt },
    });
    return reply.code(200).send(updated);
  });

  app.post('/team/slots/revoke', async (req, reply) => {
    const bodySchema = z.object({ handle: z.string(), set: z.string() });
    const { handle, set } = bodySchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { handle } });
    if (!user) return reply.code(404).send({ error: 'user not found' });
    const slot = await prisma.teamSlot.findFirst({ where: { userId: user.id, set } });
    if (!slot) return reply.code(404).send({ error: 'slot not found' });

    const updated = await prisma.teamSlot.update({
      where: { id: slot.id },
      data: { invitedId: null, accepted: false, expiresAt: null },
    });
    return reply.code(200).send(updated);
  });

  // rental board
  app.get('/rental-board', async (_req, reply) => {
    const now = new Date();
    const listings = await prisma.rentalListing.findMany({ where: { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }, orderBy: { createdAt: 'desc' } });
    return reply.code(200).send(listings);
  });

  app.post('/rental-board', async (req, reply) => {
    const bodySchema = z.object({ handle: z.string(), message: z.string().min(1), rate: z.string().optional() });
    const { handle, message, rate } = bodySchema.parse(req.body);
    const user = await prisma.user.upsert({ where: { handle }, update: {}, create: { handle } });
    const expiresAt = new Date(Date.now() + WEEK_MS);
    const listing = await prisma.rentalListing.create({ data: { userId: user.id, message, rate, expiresAt } });
    return reply.code(201).send(listing);
  });

  app.delete('/rental-board/:id', async (req, reply) => {
    const paramsSchema = z.object({ id: z.string() });
    const { id } = paramsSchema.parse(req.params);
    await prisma.rentalListing.delete({ where: { id } }).catch(() => {});
    return reply.code(204).send();
  });

  // equipped sets
  app.post('/equipped-sets', async (req, reply) => {
    const bodySchema = z.object({ handle: z.string(), sets: z.array(z.string()) });
    const { handle, sets } = bodySchema.parse(req.body);
    const user = await prisma.user.upsert({ where: { handle }, update: {}, create: { handle } });
    const record = await prisma.equippedSet.upsert({
      where: { userId: user.id },
      update: { sets },
      create: { userId: user.id, sets },
    }).catch(async () => {
      const existing = await prisma.equippedSet.findFirst({ where: { userId: user.id } });
      if (existing) return prisma.equippedSet.update({ where: { id: existing.id }, data: { sets } });
      return prisma.equippedSet.create({ data: { userId: user.id, sets } });
    });
    return reply.code(200).send(record);
  });

  app.get('/equipped-sets/:handle', async (req, reply) => {
    const paramsSchema = z.object({ handle: z.string() });
    const { handle } = paramsSchema.parse(req.params);
    const user = await prisma.user.findUnique({ where: { handle } });
    if (!user) return reply.code(404).send({ error: 'user not found' });
    const record = await prisma.equippedSet.findFirst({ where: { userId: user.id } });
    return reply.code(200).send(record || { sets: [] });
  });
}
