import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';

export class WordpressInfraStackS3 extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'WordpressInfraBucket', {
      bucketName: 'wordpress-infra-stack',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
  }
}
