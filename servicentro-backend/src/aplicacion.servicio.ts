import { Injectable } from '@nestjs/common';

@Injectable()
export class AplicacionServicio {
  obtenerSaludo(): string {
    return 'Hola Mundo!';
  }
}
