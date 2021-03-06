#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { WordpressInfraStack } from '../lib/wordpress_infra-stack';
import { WordpressInfraStackDatabase } from '../lib/wordpress_infra-stack_instance_database';
import { WordpressInfraStackLoadBalancer } from '../lib/wordpress_infra-stack_instance_loadbalancer';
import { WordpressInfraStackFileSystem } from '../lib/wordpress_infra-stack_instance_filesystem';
import { WordpressInfraStackS3 } from '../lib/wordpress_infra-stack_instance_s3';
import { WordpressInfraStackCloudfront } from '../lib/wordpress_infra-stack_instance_cloudfront';
import { WordpressInfraStackCertificateManager } from '../lib/wordpress_infra-stack_instance_certificatemanager';
import { Certificate } from 'crypto';

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-west-2'
};

const app = new cdk.App();

const vpcStack = new WordpressInfraStack(app, 'WordpressInfraStack', { env });
const certificates = new WordpressInfraStackCertificateManager(app, 'WordPressInfraStackCertificateManager', { env })
new WordpressInfraStackFileSystem(app, 'WordpressInfraStackFileSystem', vpcStack.vpc, { env });
const loadBalancerStack = new WordpressInfraStackLoadBalancer(app, 'WordpressInfraStackLoadBalancer', vpcStack.vpc,
    certificates.lavinFoodsLoadBalancerCertificate, { env });
new WordpressInfraStackDatabase(app, 'WordpressInfraStackDatabase', vpcStack.vpc, loadBalancerStack.asg, loadBalancerStack.instance, { env });
const bucket = new WordpressInfraStackS3(app, 'WordpressInfraStackS3', { env });
new WordpressInfraStackCloudfront(app, 'WordpressInfraStackCloudfront', bucket.bucket,
    loadBalancerStack.lb,
    certificates.lavinFoodsCloudFrontCertificate, { env }
)