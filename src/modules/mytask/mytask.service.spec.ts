import { Test, TestingModule } from '@nestjs/testing';
import { MytaskService } from './mytask.service';

describe('MytaskService', () => {
  let service: MytaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MytaskService],
    }).compile();

    service = module.get<MytaskService>(MytaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
