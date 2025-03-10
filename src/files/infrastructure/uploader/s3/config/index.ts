import { S3ClientConfig } from '@aws-sdk/client-s3';
import fileConfig from '../../../../config/file.config';
import { FileConfig } from '../../../../config/file-config.type';
import awsConfig from '../../../../../config/aws.config';
import { AwsConfig } from '../../../../../config/aws-config.type';

export function fileDriverS3ClientConfig(): S3ClientConfig {
  const fileConfigObj = fileConfig() as FileConfig;
  const awsConfigObj = awsConfig() as AwsConfig;

  const s3Config: S3ClientConfig = {
    region: fileConfigObj.awsS3Region ?? '',
    forcePathStyle: true,
    apiVersion: '2012-11-05',
  };

  const accessKey =
    awsConfigObj?.accessKey && awsConfigObj?.accessKey.length
      ? awsConfigObj.accessKey
      : undefined;
  const secretKey =
    awsConfigObj?.secretKey && awsConfigObj?.secretKey.length
      ? awsConfigObj.secretKey
      : undefined;

  if (accessKey && secretKey) {
    s3Config.credentials = {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    };
  }

  if (awsConfigObj?.devEndpoint) {
    // This is for local-stack setup
    s3Config.endpoint = awsConfigObj.devEndpoint;
    s3Config.credentials = {
      accessKeyId: awsConfigObj?.devAccessKey ?? '',
      secretAccessKey: awsConfigObj?.devSecretKey ?? '',
    };
  }

  return s3Config;
}
