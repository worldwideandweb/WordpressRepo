import * as cdk from '@aws-cdk/core';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as certificateManager from '@aws-cdk/aws-certificatemanager';
import * as s3 from '@aws-cdk/aws-s3';

export class WordpressInfraStackCloudfront extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, s3: s3.Bucket, lb: elbv2.ApplicationLoadBalancer, props?: cdk.StackProps) {
        super(scope, id, props);

        const myCertificate = certificateManager.Certificate.fromCertificateArn
            (this, 'Rebudd Certificate', 'arn:aws:acm:us-east-1:460234074473:certificate/91c6eb62-2649-497b-943b-738a89fb0570');


        const defaultCachePolicy = new cloudfront.CachePolicy(this, 'Default Cache Policy', {
            cachePolicyName: 'loadBalancer',
            comment: 'Cache policy for the load balancer (efs)',
            headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Host', 'Origin', 'Access-Control-Request-Headers', 'Access-Control-Request-Method', 'Authorization', 'CloudFront-Forwarded-Proto'),
            cookieBehavior: cloudfront.CacheCookieBehavior.allowList('comment_author_*', 'comment_author_email_*', 'comment_author_url_*', 'wordpress_*', 'wordpress_logged_in_*', 'wordpress_test_cookie', 'wp-settings-*'),
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.all()
        });

        const s3Policy = new cloudfront.CachePolicy(this, 'S3 Cache policy', {
            cachePolicyName: 's3',
            headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Origin', 'Access-Control-Request-Headers', 'Access-Control-Request-Method', 'Authorization', 'CloudFront-Forwarded-Proto'),
            cookieBehavior: cloudfront.CacheCookieBehavior.none(),
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.none()
        });

        const allCachePolicy = new cloudfront.CachePolicy(this, 'All Cache Policy', {
            cachePolicyName: 'wpJson',
            comment: 'Cache policy for the load balancer (efs)',
            headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Host', 'Referer', 'Accept-Language', 'User-Agent', 'X-Wp-Nonce', 'Origin', 'Access-Control-Request-Headers', 'Access-Control-Request-Method', 'Authorization', 'CloudFront-Forwarded-Proto'),
            cookieBehavior: cloudfront.CacheCookieBehavior.all(),
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.all()
        });

        const defaultBehavior: cloudfront.BehaviorOptions = {
            origin: new origins.LoadBalancerV2Origin(lb as any, {
                protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY
            }),
            allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
            cachePolicy: defaultCachePolicy
        }

        const allBehaviour: cloudfront.BehaviorOptions = {
            origin: new origins.LoadBalancerV2Origin(lb as any, {
                protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY
            }),
            allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
            cachePolicy: allCachePolicy,
        }

        const wpincludes: cloudfront.BehaviorOptions = {
            origin: new origins.S3Origin(s3 as any),
            allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
            cachePolicy: s3Policy   
        }


        const wpContent: cloudfront.BehaviorOptions = {
            origin: new origins.S3Origin(s3 as any),
            allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
            cachePolicy: s3Policy   
        }

        //  Add the load balancer as the origin
        const cf = new cloudfront.Distribution(this, 'Load balancer distribution', {
            defaultBehavior: defaultBehavior,
            additionalBehaviors: {
                '/wp-includes/*': wpincludes,
                '/wp-content/*': wpContent,
                '/wp-login.php': defaultBehavior,
                '/wp-admin/*': defaultBehavior,
                '/wp-json/*': allBehaviour,
            },
            domainNames: ['www.rebudd.com', 'rebudd.com', 'dorna.rebudd.com', 'worldwideandweb.rebudd.com'],
            certificate: myCertificate
        });
    }
}
