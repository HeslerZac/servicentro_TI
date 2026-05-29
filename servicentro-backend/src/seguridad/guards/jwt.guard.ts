import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAutenticacionGuard extends AuthGuard('jwt') {}
