import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get('products')
  getProducts() {
    return [
      { id: 1, name: 'Oud Al Khaas', inspiration: 'Dior Sauvage', price: 3499, image: '/p1.jpg' },
      { id: 2, name: 'Royal Desire', inspiration: 'Dunhill Desire', price: 2999, image: '/p2.jpg' },
      { id: 3, name: 'Aqua Fresh', inspiration: 'Acqua di Giò', price: 3200, image: '/p3.jpg' },
    ];
  }
}