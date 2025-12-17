import { Module } from '@nestjs/common';
import { User } from '../user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './refresh.entity';
import { refreshTokensService } from './refresh.service';

@Module({
    imports: [TypeOrmModule.forFeature([RefreshToken]) ],
    // providers: [refreshTokensService],
    // exports: [refreshTokensService],

})
export class RefreshTokenModule {}
