import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';
import { InternalServerError } from '../errors/AppError';

export class CloudinaryService {
  static init() {
    // Check if the URL is provided, otherwise it will use process.env.CLOUDINARY_URL automatically
    // The user provided: CLOUDINARY_URL=cloudinary://185776574467877:mPiEGdIcxG7Tuj8CpEBoMBzxmu0@tripcircle
    if (!process.env.CLOUDINARY_URL) {
      console.warn('CLOUDINARY_URL is not set in environment variables');
    }
  }

  static async uploadStream(buffer: Buffer, folder: string = 'tickets'): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);
            return reject(new InternalServerError('Failed to upload file to storage'));
          }
          resolve(result);
        }
      );
      
      streamifier.createReadStream(buffer).pipe(stream);
    });
  }
}

// Initialize on load
CloudinaryService.init();
