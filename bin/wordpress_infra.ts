#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { WordpressInfraStack } from '../lib/wordpress_infra-stack';
import { WordpressInfraStackDatabase } from '../lib/wordpress_infra-stack_instance_database';
import { WordpressInfraStackLoadBalancer } from '../lib/wordpress_infra-stack_instance_loadbalancer';
import { WordpressInfraStackFileSystem } from '../lib/wordpress_infra-stack_instance_filesystem';

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-west-2'
};

const app = new cdk.App();

const vpcStack = new WordpressInfraStack(app, 'WordpressInfraStack', {env});
const fileSystemStack = new WordpressInfraStackFileSystem(app, 'WordpressInfraStackFileSystem', vpcStack.vpc, {env});
const asgStack = new WordpressInfraStackLoadBalancer(app, 'WordpressInfraStackLoadBalancer', fileSystemStack.fileSystem, vpcStack.vpc,{env});
// new WordpressInfraStackDatabase(app, 'WordpressInfraStackDatabase', vpcStack.vpc, asgStack.asg, asgStack.instance, {env});
// new WordpressInfraStackRoute53(app, 'WordpressInfraSackRoute53', {env});