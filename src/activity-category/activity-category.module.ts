import { Module } from '@nestjs/common';
import { ActivityCategoryService } from './activity-category.service';
import { ActivityCategoryController } from './activity-category.controller';

@Module({
  controllers: [ActivityCategoryController],
  providers: [ActivityCategoryService],
  exports: [ActivityCategoryService],
})
export class ActivityCategoryModule {}
