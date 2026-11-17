import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    const port = process.env.PORT || 3005;
    await app.listen(port);
    console.log(`MTBExpert rodando na porta ${port}`);
}
bootstrap();
