#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { WordpressInfraStack } from '../lib/wordpress_infra-stack';
import { WordpressInfraStackCertificateManager } from '../lib/wordpress_infra-stack_instance_certificateManager';
import { WordpressInfraStackCloudfront } from '../lib/wordpress_infra-stack_instance_cloudfront';
import { WordpressInfraStackDatabase } from '../lib/wordpress_infra-stack_instance_database';
import { WordpressInfraStackFileSystem } from '../lib/wordpress_infra-stack_instance_filesystem';
import { WordpressInfraStackLoadBalancer } from '../lib/wordpress_infra-stack_instance_loadbalancer';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'eu-west-1',
};

const usEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-1',
};

const app = new cdk.App();

const cloudfrontCertificate = new WordpressInfraStackCertificateManager(
  app,
  'WordpressInfraStackCertificateManagerCloudFront',
  { env: usEnv }
);
const loadBalancerCertificate = new WordpressInfraStackCertificateManager(
  app,
  'WordpressInfraStackCertificateManager',
  { env }
);
const vpcStack = new WordpressInfraStack(app, 'WordpressInfraStack', { env });
new WordpressInfraStackFileSystem(
  app,
  'WordpressInfraStackFileSystem',
  vpcStack.vpc,
  { env }
);
const loadBalancerStack = new WordpressInfraStackLoadBalancer(
  app,
  'WordpressInfraStackLoadBalancer',
  vpcStack.vpc,
  loadBalancerCertificate.certificate,
  { env }
);
new WordpressInfraStackDatabase(
  app,
  'WordpressInfraStackDatabase',
  vpcStack.vpc,
  loadBalancerStack.asg,
  loadBalancerStack.instance,
  { env }
);
new WordpressInfraStackCloudfront(
  app,
  'WordpressInfraStackCloudfront',
  loadBalancerStack.lb,
  cloudfrontCertificate.certificate,
  { env }
);
