import { Module } from '@nestjs/common';
import { LinksService } from './links.service';
import { LinksController } from './links.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './entities/link.entity';
import { SharedModule } from 'src/shared/shared.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Link]), SharedModule, AuthModule],
  controllers: [LinksController],
  providers: [LinksService],
})
export class LinksModule {}
