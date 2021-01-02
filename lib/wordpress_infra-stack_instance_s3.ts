import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';

export class WordpressInfraStackS3 extends cdk.Stack {
  public bucket: s3.Bucket;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, 'WordpressInfraBucket', {
      bucketName: 'www-wordpress-infra-stack-sahamidiamonds',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
  }
}
