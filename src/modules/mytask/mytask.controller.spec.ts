import { Test, TestingModule } from '@nestjs/testing';
import { MytaskController } from './mytask.controller';

describe('MytaskController', () => {
  let controller: MytaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MytaskController],
    }).compile();

    controller = module.get<MytaskController>(MytaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
