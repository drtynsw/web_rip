import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttackVectorsController } from './attack_vectors.controller';
import { AttackVectorsService } from './attack_vectors.service';
import { AttackVector } from './entities/attack-vector.entity';
import { Like } from './entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttackVector, Like])],
  controllers: [AttackVectorsController],
  providers: [AttackVectorsService],
})
export class AttackVectorsModule {}
