import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const RequestUserId = createParamDecorator((required: boolean = true, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const userId = (req.headers['x-user-id'] as string) || undefined;
  if (required && !userId) throw new BadRequestException('Falta header x-user-id para identificar al usuario (temporal).');
  return userId;
});
