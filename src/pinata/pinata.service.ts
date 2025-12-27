import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class PinataService {
  private readonly pinataJwt = process.env.PINATA_JWT || '';
  private readonly pinataApiUrl = process.env.PINATA_URL || '';

  async pinJSON(data: any, name: string): Promise<string> {
    if (!this.pinataJwt) {
      console.error('PINATA_JWT is not set in environment variables');
      // Fallback for development if no token is provided
      return `placeholder-cid-for-${name.replace(/\s+/g, '-')}`;
    }

    try {
      const response = await fetch(this.pinataApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.pinataJwt}`,
        },
        body: JSON.stringify({
          pinataContent: data,
          pinataMetadata: {
            name: name,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata API error: ${response.status} ${errorText}`);
      }

      const result = await response.json() as { IpfsHash: string };
      return result.IpfsHash;
    } catch (error) {
      console.error('Failed to pin JSON to Pinata:', error);
      throw new InternalServerErrorException('Failed to upload metadata to IPFS');
    }
  }
}
