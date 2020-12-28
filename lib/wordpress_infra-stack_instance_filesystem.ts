import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as efs from '@aws-cdk/aws-efs';
import { RemovalPolicy } from '@aws-cdk/core';


export class WordpressInfraStackFileSystem extends cdk.Stack {
  public fileSystem: efs.FileSystem;
  constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    this.fileSystem = new efs.FileSystem(this, 'MyEfsFileSystem', {
      vpc,
      encrypted: false,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      removalPolicy: RemovalPolicy.DESTROY,
      securityGroup: 
    });

    this.fileSystem.addAccessPoint('AccessPoint');
  }
}
