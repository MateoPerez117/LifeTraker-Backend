import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateActivityCategoryDto } from './dto/create-activity-category.dto';
import { UpdateActivityCategoryDto } from './dto/update-activity-category.dto';

@Injectable()
export class ActivityCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateActivityCategoryDto) {
    try {
      return await this.prisma.activityCategory.create({
        data: {
          name: dto.name,
          color: dto.color ?? null,
        },
      });
    } catch (error) {
      // name es unique => P2002 si se repite
      if (error?.code === 'P2002') {
        throw new BadRequestException('Ya existe una categoría con ese nombre');
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.activityCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const cat = await this.prisma.activityCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async update(id: string, dto: UpdateActivityCategoryDto) {
    // asegura que exista
    await this.findOne(id);

    try {
      return await this.prisma.activityCategory.update({
        where: { id },
        data: {
          name: dto.name ?? undefined,
          color: dto.color ?? undefined,
        },
      });
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new BadRequestException('Ya existe una categoría con ese nombre');
      }
      throw error;
    }
  }

  async remove(id: string) {
    // delete directo; si luego quieres soft-delete, aquí se cambia
    await this.findOne(id);
    return this.prisma.activityCategory.delete({ where: { id } });
  }
}
