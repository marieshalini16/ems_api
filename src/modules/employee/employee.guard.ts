import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class EmployeeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
   
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if(!user){
        throw new ForbiddenException("User not authenticated");
    }

    if(user.role_id!==2){
        throw new ForbiddenException("Only employee can access this resourse");
    }

    return true;
  }
}