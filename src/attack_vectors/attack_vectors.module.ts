import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttackVectorsController } from './attack_vectors.controller';
import { AttackVectorsService } from './attack_vectors.service';
import { AttackVector } from './entities/attack-vector.entity';
import { Like } from './entities/like.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttackVector, Like, User])],
  controllers: [AttackVectorsController],
  providers: [AttackVectorsService],
  exports: [AttackVectorsService],
})
export class AttackVectorsModule {}
