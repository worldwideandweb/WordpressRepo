import * as cdk from '@aws-cdk/core';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as certificateManager from '@aws-cdk/aws-certificatemanager';
import * as s3 from '@aws-cdk/aws-s3';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { Duration } from '@aws-cdk/core';

export class WordpressInfraStackCloudfront extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    lb: elbv2.ApplicationLoadBalancer,
    certificate: Certificate,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const myCertificate = certificateManager.Certificate.fromCertificateArn(
      this,
      'Website certificates',
      'arn:aws:acm:us-east-1:460234074473:certificate/d7b1ffde-be9d-4edc-971d-5a8a7ea0b05c'
    );

    const defaultBehavior: cloudfront.BehaviorOptions = {
      origin: new origins.LoadBalancerV2Origin(lb as any, {
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
        connectionAttempts: 3,
        //@ts-ignore
        connectionTimeout: Duration.seconds(10),
        //@ts-ignore
        keepaliveTimeout: Duration.seconds(60),
        //@ts-ignore
        readTimeout: Duration.seconds(60),
      }),
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
    };

    //  Add the load balancer as the origin
    const cf = new cloudfront.Distribution(this, 'irelandDistribution', {
      defaultBehavior: defaultBehavior,
      domainNames: [
        'worldwideandweb.com',
        'www.worldwideandweb.com',
        'vintagegrooming.co.uk',
        'www.vintagegrooming.co.uk',
      ],
      certificate: myCertificate,
    });
  }
}
