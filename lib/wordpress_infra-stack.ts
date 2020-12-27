import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export class WordpressInfraStack extends cdk.Stack {
  public vpc: ec2.Vpc;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    this.vpc = new ec2.Vpc(this, 'Wordpress VPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [{
        cidrMask: 28,
        name: 'RDS',
        subnetType: ec2.SubnetType.ISOLATED
      },
      {
        cidrMask: 28,
        name: 'Auto Scaling Group',
        subnetType: ec2.SubnetType.PRIVATE,
      },
      {
        cidrMask: 28,
        name: 'Load Balancer',
        subnetType: ec2.SubnetType.PUBLIC
      }
    ]
    });
  }
}
