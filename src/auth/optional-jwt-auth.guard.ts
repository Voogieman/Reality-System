import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** JWT optional: if Bearer present — validate; otherwise continue as guest. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<{ headers: { authorization?: string } }>();
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return true;
        }
        return super.canActivate(context) as boolean | Promise<boolean>;
    }

    handleRequest<TUser>(err: Error | null, user: TUser): TUser | undefined {
        if (err) {
            throw err;
        }
        return user ?? undefined;
    }
}
