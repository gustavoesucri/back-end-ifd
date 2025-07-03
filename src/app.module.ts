import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HomeModule } from './home/home.module';
import { ProjetosModule } from './projetos/projetos.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { CampanhasModule } from './campanhas/campanhas.module';
import { NoticiasModule } from './noticias/noticias.module';
import { ParceirosModule } from './parceiros/parceiros.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContatoModule } from './contato/contato.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      // rootPath: join(__dirname, '..', 'public'),
      rootPath: path.resolve(process.cwd(), 'public'),
      serveRoot: '/static',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASS,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true, // Não recomendado em ambiente de produção.
    }),
    // TypeOrmModule.forRoot({
    //   name: 'connectionMongo',
    //   type: 'mongodb',
    //   host: process.env.MONGODB_HOST,
    //   port: Number(process.env.MONGODB_PORT),
    //   database: process.env.MONGODB_DB,
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }),
    HomeModule,
    ProjetosModule,
    CampanhasModule,
    NoticiasModule,
    ParceirosModule,
    ContatoModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
