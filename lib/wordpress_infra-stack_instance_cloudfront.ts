import * as cdk from '@aws-cdk/core';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3';
import * as acm from '@aws-cdk/aws-certificatemanager';

export class WordpressInfraStackCloudfront extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    s3: s3.Bucket,
    lb: elbv2.ApplicationLoadBalancer,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const myCertificate = acm.Certificate.fromCertificateArn(
      this,
      'Website certificates',
      'arn:aws:acm:us-east-1:460234074473:certificate/c011bdc7-30f1-4aa9-83f2-c16a3214f500'
    );

    const defaultCachePolicy = new cloudfront.CachePolicy(
      this,
      'Default Cache Policy',
      {
        cachePolicyName: 'loadBalancer',
        comment: 'Cache policy for the load balancer (efs)',
        headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
          'Host',
          'Origin',
          'Access-Control-Request-Headers',
          'Access-Control-Request-Method',
          'Authorization',
          'CloudFront-Forwarded-Proto'
        ),
        cookieBehavior: cloudfront.CacheCookieBehavior.all(),
        queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      }
    );

    const defaultBehavior: cloudfront.BehaviorOptions = {
      origin: new origins.LoadBalancerV2Origin(lb as any, {
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
      }),
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      cachePolicy: defaultCachePolicy,
    };

    //  Add the load balancer as the origin
    const cf = new cloudfront.Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: defaultBehavior,
      domainNames: [
        'dev.sahamidiamonds.co.uk',
        'www.worldwideandweb.com',
        'worldwideandweb.com',
        'dev.lilyofthenile.co.uk',
      ],
      certificate: myCertificate as any,
    });
  }
}
