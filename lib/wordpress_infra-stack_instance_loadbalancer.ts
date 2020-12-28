import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import { AutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import * as efs from '@aws-cdk/aws-efs';

export class WordpressInfraStackLoadBalancer extends cdk.Stack {
  public asg: AutoScalingGroup;
  public instance: ec2.Instance;
  constructor(scope: cdk.Construct, id: string, fileSystem: efs.FileSystem, vpc: ec2.Vpc, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const lb = new elbv2.ApplicationLoadBalancer(this, 'Wordpress Application Load Balancer', {
      vpc,
      internetFacing: true,
      vpcSubnets: {
        availabilityZones: ['eu-west-2a', 'eu-west-2b'],
        onePerAz: true,
        subnetType: ec2.SubnetType.PUBLIC
      }
    });

    const listener = lb.addListener('Listener 80', {
      port: 80
    });

    this.asg = new AutoScalingGroup(this, 'Wordpress Autoscaling Group', {
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: ec2.MachineImage.genericLinux({
        'eu-west-2': 'ami-07dfd20049bd5574b'
      }),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      keyName: 'Wordpress Connection'
    });


    listener.addTargets('Listener target', {
      port: 8080,
      targets: [this.asg],
      healthCheck: {
        path: '/',
        interval: cdk.Duration.minutes(1),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 10
      }
    });

    this.instance = new ec2.Instance(this, 'Instance', {
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: ec2.MachineImage.genericLinux({
        'eu-west-2': 'ami-07dfd20049bd5574b'
      }),
      vpc,
      keyName: 'Wordpress Connection',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      }
    });

    this.asg.userData.addCommands(
      "sudo ufw disable",
      "apt-get -y update",
      "apt-get -y upgrade",                                 // Ubuntu: apt-get -y upgrade
      "apt-get -y install amazon-efs-utils",                // Ubuntu: apt-get -y install amazon-efs-utils
      "apt-get -y install nfs-common",                       // Ubuntu: apt-get -y install nfs-common
      "file_system_id_1=" + fileSystem.fileSystemId,
      "efs_mount_point_1=/mnt/efs/fs1",
      "mkdir -p \"${efs_mount_point_1}\"",
      "test -f \"/sbin/mount.efs\" && echo \"${file_system_id_1}:/ ${efs_mount_point_1} efs defaults,_netdev\" >> /etc/fstab || " +
      "echo \"${file_system_id_1}.efs.eu-west-2.amazonaws.com:/ ${efs_mount_point_1} nfs4 nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport,_netdev 0 0\" >> /etc/fstab",
      "mount -a -t efs,nfs4 defaults");

    this.instance.userData.addCommands(
      "sudo ufw disable",
      "apt-get -y update",
      "apt-get -y upgrade",                                 // Ubuntu: apt-get -y upgrade
      "apt-get -y install amazon-efs-utils",                // Ubuntu: apt-get -y install amazon-efs-utils
      "apt-get -y install nfs-common",                       // Ubuntu: apt-get -y install nfs-common
      "file_system_id_1=" + fileSystem.fileSystemId,
      "efs_mount_point_1=/something",
      "mkdir -p \"${efs_mount_point_1}\"",
      "test -f \"/sbin/mount.efs\" && echo \"${file_system_id_1}:/ ${efs_mount_point_1} efs defaults,_netdev\" >> /etc/fstab || " +
      "echo \"${file_system_id_1}.efs.eu-west-2.amazonaws.com:/ ${efs_mount_point_1} nfs4 nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport,_netdev 0 0\" >> /etc/fstab",
      "mount -a -t efs,nfs4 defaults");
  }
}
