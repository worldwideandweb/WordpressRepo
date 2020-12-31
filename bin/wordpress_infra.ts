#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { WordpressInfraStack } from '../lib/wordpress_infra-stack';
import { WordpressInfraStackDatabase } from '../lib/wordpress_infra-stack_instance_database';
import { WordpressInfraStackLoadBalancer } from '../lib/wordpress_infra-stack_instance_loadbalancer';
import { WordpressInfraStackFileSystem } from '../lib/wordpress_infra-stack_instance_filesystem';
import { WordpressInfraStackS3 } from '../lib/wordpress_infra-stack_instance_s3';

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-west-2'
};

const app = new cdk.App();

const vpcStack = new WordpressInfraStack(app, 'WordpressInfraStack', { env });
new WordpressInfraStackFileSystem(app, 'WordpressInfraStackFileSystem', vpcStack.vpc, { env });
const asgStack = new WordpressInfraStackLoadBalancer(app, 'WordpressInfraStackLoadBalancer', vpcStack.vpc, { env });
new WordpressInfraStackDatabase(app, 'WordpressInfraStackDatabase', vpcStack.vpc, asgStack.asg, asgStack.instance, { env });
new WordpressInfraStackS3(app, 'WordpressInfraStackS3', { env });