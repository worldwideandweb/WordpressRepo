import * as cdk from '@aws-cdk/core';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as certificateManager from '@aws-cdk/aws-certificatemanager';
import * as s3 from '@aws-cdk/aws-s3';

export class WordpressInfraStackCloudfront extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    lb: elbv2.ApplicationLoadBalancer,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const myCertificate = certificateManager.Certificate.fromCertificateArn(
      this,
      'Website certificates',
      'arn:aws:acm:us-east-1:460234074473:certificate/e4c79ebb-7511-4b36-9022-7c60c02db737'
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

    const s3Policy = new cloudfront.CachePolicy(this, 'S3 Cache policy', {
      cachePolicyName: 's3',
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
        'Origin',
        'Access-Control-Request-Headers',
        'Access-Control-Request-Method',
        'Authorization',
        'CloudFront-Forwarded-Proto'
      ),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
    });

    const allCachePolicy = new cloudfront.CachePolicy(
      this,
      'All Cache Policy',
      {
        cachePolicyName: 'wpJson',
        comment: 'Cache policy for the load balancer (efs)',
        headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
          'Host',
          'Referer',
          'Accept-Language',
          'User-Agent',
          'X-Wp-Nonce',
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

    const allBehaviour: cloudfront.BehaviorOptions = {
      origin: new origins.LoadBalancerV2Origin(lb as any, {
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
      }),
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      cachePolicy: allCachePolicy,
    };

    const wpincludes: cloudfront.BehaviorOptions = {
      origin: new origins.S3Origin(s3 as any),
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      cachePolicy: s3Policy,
    };

    const wpContent: cloudfront.BehaviorOptions = {
      origin: new origins.S3Origin(s3 as any),
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      cachePolicy: s3Policy,
    };

    //  Add the load balancer as the origin
    const cf = new cloudfront.Distribution(this, 'Load balancer distribution', {
      defaultBehavior: defaultBehavior,
      domainNames: [
        'dev.sahamidiamonds.co.uk',
        'www.worldwideandweb.com',
        'worldwideandweb.com',
        'dev.lilyofthenile.co.uk',
      ],
      certificate: myCertificate,
    });
  }
}
