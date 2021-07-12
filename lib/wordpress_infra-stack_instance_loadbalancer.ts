import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import { AutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { Duration } from '@aws-cdk/core';

export class WordpressInfraStackLoadBalancer extends cdk.Stack {
  public asg: AutoScalingGroup;
  public lb: elbv2.ApplicationLoadBalancer;
  public instance: ec2.Instance;
  constructor(
    scope: cdk.Construct,
    id: string,
    vpc: ec2.Vpc,
    certificate: Certificate,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // The code that defines your stack goes here
    this.lb = new elbv2.ApplicationLoadBalancer(
      this,
      'Wordpress Application Load Balancer',
      {
        vpc,
        internetFacing: true,
        vpcSubnets: {
          onePerAz: true,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        //@ts-ignore
        idleTimeout: Duration.minutes(2),
      },
    );

    const listener = this.lb.addListener('Listener 443', {
      port: 443,
      certificates: [
        elbv2.ListenerCertificate.fromArn('arn:aws:acm:eu-west-1:460234074473:certificate/e425bca7-a5e5-48b7-8b5f-c8ed48356e45'),
      ],
    });

    this.asg = new AutoScalingGroup(this, 'Wordpress Autoscaling Group', {
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: ec2.MachineImage.genericLinux({
        'eu-west-1': 'ami-03c7ca8d73da5c5a5',
      }),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      keyName: 'Wordpress Load Balancer',
    });

    this.asg.connections.allowFrom(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'SSH from anywhere'
    );
    this.asg.connections.allowFrom(
      this.lb,
      ec2.Port.tcp(80),
      'Load Balancer Port'
    );
    this.asg.connections.allowFrom(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTraffic(),
      'Load Balancer Port 2'
    );

    listener.addTargets('Listener Target', {
      port: 80,
      targets: [this.asg],
    });

    this.asg.userData.addCommands(
      'apt-get -y update',
      'apt-get -y upgrade', // Ubuntu: apt-get -y upgrade
      'apt-get -y install amazon-efs-utils', // Ubuntu: apt-get -y install amazon-efs-utils
      'apt-get -y install nfs-common', // Ubuntu: apt-get -y install nfs-common
      'file_system_id_1=fs-1ebd482a',
      'efs_mount_point_1=/mnt/efs/fs1',
      'mkdir -p "${efs_mount_point_1}"',
      'test -f "/sbin/mount.efs" && echo "${file_system_id_1}:/ ${efs_mount_point_1} efs defaults,_netdev" >> /etc/fstab || ' +
        'echo "${file_system_id_1}.efs.eu-west-1.amazonaws.com:/ ${efs_mount_point_1} nfs4 nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport,_netdev 0 0" >> /etc/fstab',
      'mount -a -t efs,nfs4 defaults'
    );
  }
}
  