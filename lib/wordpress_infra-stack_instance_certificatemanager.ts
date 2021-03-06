import * as cdk from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as hz from '@aws-cdk/aws-route53';

export class WordpressInfraStackCertificateManager extends cdk.Stack {
  public lavinFoodsLoadBalancerCertificate: acm.Certificate;
  public lavinFoodsCloudFrontCertificate: acm.Certificate;
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);
    
    const lavingFoodsHostedZone = hz.HostedZone.fromHostedZoneId(this, 'lavinFoodsHostedZone','Z07111791K2ZCI71L8UU3');

    this.lavinFoodsLoadBalancerCertificate = new acm.Certificate(this, 'LavinFoodsLoadBalancerCertificate', {
      domainName: 'dev.lavinfoods.com',
      subjectAlternativeNames: ['dev.lavinfoods.com', 'www.lavinfoods.com', 'lavinfoods.com'],
      validation: acm.CertificateValidation.fromDns(lavingFoodsHostedZone)
    });

    this.lavinFoodsCloudFrontCertificate = new acm.DnsValidatedCertificate(this, 'LavinFoodsCloudFrontCertificate', {
      domainName: 'dev.lavinfoods.com',
      hostedZone: lavingFoodsHostedZone,
      region: 'eu-west-1',
    });

  }
}