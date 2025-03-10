export enum FileDriver {
  LOCAL = 'local',
  S3 = 's3',
  S3_PRESIGNED = 's3-presigned',
}

export type FileConfig = {
  driver: FileDriver;
  awsDefaultS3Bucket?: string;
  awsS3Region?: string;
  maxFileSize: number;
  awsDefaultS3Url?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
};
