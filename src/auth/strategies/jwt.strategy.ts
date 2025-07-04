import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    // SE FOR USAR O .ENV DESCOMENTAR e colocar a variável 'secret' no lugar
    //         const secret = process.env.JWT_SECRET;
    //   if (!secret) {
    //     throw new Error('JWT_SECRET is not defined in environment variables');
    //   }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrai token do header Authorization Bearer
      ignoreExpiration: false, // Rejeita tokens expirados
      secretOrKey: 'CHAVEDECRIPTOGRAFIA', // process.env.JWT_SECRET ou secret
    });
  }

  // Método chamado automaticamente após validação do token
  async validate(payload: any) {
    // Retorna os dados do usuário que serão anexados ao req.user
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
