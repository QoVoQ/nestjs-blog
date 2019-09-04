import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './ormconfig';

@Module({})
export class TestDBModule {
  static forRoot(): DynamicModule {
    return {
      module: TestDBModule,
      imports: [TypeOrmModule.forRoot(ormConfig)],
    };
  }
}
