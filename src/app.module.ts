import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AirportModule } from './airport/airport.module';
import loggerConfig from './common/config/logger.config';
import { FlightModule } from './flight/flight.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphModule } from './graph/graph.module';

@Module({
  imports: [
    LoggerModule.forRoot(loggerConfig),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        synchronize: configService.get('DB_SYNCHRONIZE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        ssl: {
          rejectUnauthorized: false,
          ca: configService.get('DB_SSL'),
        },
      }),
    }),
    AirportModule,
    FlightModule,
    GraphModule,
  ],
})
export class AppModule {}
