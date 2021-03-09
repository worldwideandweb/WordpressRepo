import * as cdk from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import { HostedZone } from '@aws-cdk/aws-route53';

export class WordpressInfraStackCertificateManager extends cdk.Stack {
  public lavinFoodsLoadBalancerCertificate: acm.Certificate;
  public lavinFoodsCloudFrontCertificate: acm.Certificate;
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);
    
    const lavinFoodsHostedZone = HostedZone.fromHostedZoneAttributes(this, 'lavinFoodsHostedZone', {
      zoneName: 'lavinfoods.com',
      hostedZoneId: 'Z07111791K2ZCI71L8UU3',
    });

    this.lavinFoodsLoadBalancerCertificate = new acm.Certificate(this, 'LavinFoodsLoadBalancerCertificate', {
      domainName: 'lavinfoods.com',
      subjectAlternativeNames: ['dev.lavinfoods.com', 'www.lavinfoods.com', 'lavinfoods.com'],
      validation: acm.CertificateValidation.fromDns(lavinFoodsHostedZone)
    });
  }
}