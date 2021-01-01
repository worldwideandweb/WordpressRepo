import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import { AutoScalingGroup } from '@aws-cdk/aws-autoscaling';

export class WordpressInfraStackDatabase extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, vpc: ec2.Vpc, asg: AutoScalingGroup, instance: ec2.Instance, props?: cdk.StackProps) {
    super(scope, id, props);

    const securityGroup = new ec2.SecurityGroup(this, 'Aurora Security Group', {
      vpc
    });

    securityGroup.connections.allowFrom(asg, ec2.Port.tcp(3306), 'Inbound');

    // The code that defines your stack goes here
    new rds.DatabaseInstance(this, 'Wordpress MySQL Aurora', {
      engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0_21 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      vpcSubnets: {
        subnetType: ec2.SubnetType.ISOLATED
      },
      vpc,
      securityGroups: [securityGroup]
    });
  }
}
