import { Test, TestingModule } from '@nestjs/testing';
import { PinataService } from './pinata.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('PinataService', () => {
  let service: PinataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PinataService],
    }).compile();

    service = module.get<PinataService>(PinataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return placeholder CID if PINATA_JWT is not set', async () => {
    // Ensuring process.env.PINATA_JWT is undefined in this test scope if possible, 
    // but the service reads it on instantiation/method call.
    const originalJwt = process.env.PINATA_JWT;
    delete process.env.PINATA_JWT;
    
    // Create a new instance to ensure it picks up the missing JWT
    const localService = new PinataService();
    const result = await localService.pinJSON({ test: 1 }, 'Test Name');
    expect(result).toContain('placeholder-cid');
    
    process.env.PINATA_JWT = originalJwt;
  });

  it('should call fetch and return IpfsHash if JWT is set', async () => {
    process.env.PINATA_JWT = 'test-jwt';
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ IpfsHash: 'QmTest' }),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const result = await service.pinJSON({ test: 1 }, 'Test Name');
    expect(result).toBe('QmTest');
    expect(global.fetch).toHaveBeenCalled();
  });
});
