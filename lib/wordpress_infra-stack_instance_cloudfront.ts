import * as cdk from '@aws-cdk/core';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as certificateManager from '@aws-cdk/aws-certificatemanager';

export class WordpressInfraStackCloudfront extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, lb: elbv2.ApplicationLoadBalancer, props?: cdk.StackProps) {
        super(scope, id, props);

        const myCertificate = certificateManager.Certificate.fromCertificateArn
            (this, 'Rebudd Certificate', 'arn:aws:acm:us-east-1:460234074473:certificate/43468197-89a2-4d04-8b1a-336f09bd5c0b');

        //  Add the load balancer as the origin
        const cf = new cloudfront.Distribution(this, 'Load balancer distribution', {
            defaultBehavior: { origin: new origins.LoadBalancerV2Origin(lb as any) },
            domainNames: ['www.rebudd.com', 'rebudd.com'],
            certificate: myCertificate
        });
    }
}
