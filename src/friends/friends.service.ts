import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  private sortPair(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('No puedes enviarte solicitud a ti mismo');
    }
    return userId < targetUserId
      ? { aId: userId, bId: targetUserId }
      : { aId: targetUserId, bId: userId };
  }

  private selectUser = { id: true, username: true, email: true };

  async sendRequest(userId: string, dto: SendFriendRequestDto) {
    const target = await this.prisma.user.findUnique({ where: { id: dto.targetUserId } });
    if (!target) throw new NotFoundException('Usuario destino no encontrado');

    const { aId, bId } = this.sortPair(userId, dto.targetUserId);

    const existing = await this.prisma.friendship.findUnique({
      where: { aId_bId: { aId, bId } },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new BadRequestException('Ya son amigos');
      }
      if (existing.status === 'BLOCKED') {
        throw new ForbiddenException('Alguno bloqueó la relación');
      }
      if (existing.status === 'PENDING') {
        // Deja que el flujo de aceptación se haga explícito
        throw new BadRequestException('Ya existe una solicitud pendiente');
      }
    }

    return this.prisma.friendship.create({
      data: { aId, bId, status: 'PENDING' },
      include: { a: { select: this.selectUser }, b: { select: this.selectUser } },
    });
  }

  async listFriends(userId: string) {
    const rows = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ aId: userId }, { bId: userId }],
      },
      include: { a: { select: this.selectUser }, b: { select: this.selectUser } },
      orderBy: { updatedAt: 'desc' },
    });

    return rows.map((row) => {
      const friend = row.aId === userId ? row.b : row.a;
      return {
        id: row.id,
        friend,
        since: row.updatedAt,
      };
    });
  }

  async listRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: {
        status: 'PENDING',
        OR: [{ aId: userId }, { bId: userId }],
      },
      include: { a: { select: this.selectUser }, b: { select: this.selectUser } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getRequestForUser(userId: string, requestId: string) {
    const fr = await this.prisma.friendship.findUnique({ where: { id: requestId } });
    if (!fr) throw new NotFoundException('Solicitud no encontrada');
    if (fr.aId !== userId && fr.bId !== userId) throw new ForbiddenException();
    if (fr.status !== 'PENDING') throw new BadRequestException('La solicitud ya fue atendida');
    return fr;
  }

  async accept(userId: string, requestId: string) {
    await this.getRequestForUser(userId, requestId);
    return this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });
  }

  async reject(userId: string, requestId: string) {
    await this.getRequestForUser(userId, requestId);
    await this.prisma.friendship.delete({ where: { id: requestId } });
    return { success: true };
  }

  private async getByPair(userId: string, targetUserId: string) {
    const { aId, bId } = this.sortPair(userId, targetUserId);
    return this.prisma.friendship.findUnique({
      where: { aId_bId: { aId, bId } },
    });
  }

  async unfriend(userId: string, targetUserId: string) {
    const fr = await this.getByPair(userId, targetUserId);
    if (!fr) throw new NotFoundException('No hay relación con ese usuario');
    if (fr.aId !== userId && fr.bId !== userId) throw new ForbiddenException();

    await this.prisma.friendship.delete({ where: { id: fr.id } });
    return { success: true };
  }

  async block(userId: string, targetUserId: string) {
    const { aId, bId } = this.sortPair(userId, targetUserId);
    const fr = await this.getByPair(userId, targetUserId);

    if (fr) {
      if (fr.aId !== userId && fr.bId !== userId) throw new ForbiddenException();
      if (fr.status === 'BLOCKED') return fr;
      return this.prisma.friendship.update({
        where: { id: fr.id },
        data: { status: 'BLOCKED' },
      });
    }

    return this.prisma.friendship.create({
      data: { aId, bId, status: 'BLOCKED' },
    });
  }

  async unblock(userId: string, targetUserId: string) {
    const fr = await this.getByPair(userId, targetUserId);
    if (!fr || fr.status !== 'BLOCKED') {
      throw new NotFoundException('No hay bloqueo con ese usuario');
    }
    if (fr.aId !== userId && fr.bId !== userId) throw new ForbiddenException();

    await this.prisma.friendship.delete({ where: { id: fr.id } });
    return { success: true };
  }
}
