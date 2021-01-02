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
            (this, 'Rebudd Certificate', 'arn:aws:acm:us-east-1:460234074473:certificate/43468197-89a2-4d04-8b1a-336f09bd5c0b');


        const defaultCachePolicy = new cloudfront.CachePolicy(this, 'Default Cache Policy', {
            cachePolicyName: 'Load Balancer',
            comment: 'Cache policy for the load balancer (efs)',
            headerBehavior: {
                behavior: 'allow list',
                headers: ['Host', 'Origin']
            },
            cookieBehavior: {
                behavior: 'allow list',
                cookies: ['comment_author_*', 'comment_author_email_*', 'comment_author_url_*', 'wordpress_*', 'wordpress_logged_in_*', 'wordpress_test_cookie', 'wp-settings-*'],
            },
            queryStringBehavior: {
                behavior: 'allow all'
            }
        });

        const s3Policy = new cloudfront.CachePolicy(this, 'S3 Cache policy', {
            cachePolicyName: 'S3 Policy',
            headerBehavior: {
                behavior: 'allow list',
                headers: ['Origin', 'Access-Control-Request-Headers', 'Access-Control-Request-Method']
            },
            cookieBehavior: {
                behavior: 'none'
            },
            queryStringBehavior: {
                behavior: 'none'
            }
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

        const wpincludes: cloudfront.BehaviorOptions = {
            origin: new origins.S3Origin(s3 as any),
            allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
            cachePolicy: s3Policy   
        }


        const wpContent: cloudfront.BehaviorOptions = {
            origin: new origins.S3Origin(s3 as any),
            allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
            cachePolicy: s3Policy   
        }

        //  Add the load balancer as the origin
        const cf = new cloudfront.Distribution(this, 'Load balancer distribution', {
            defaultBehavior: defaultBehavior,
            additionalBehaviors: {
                'wpincludes': wpincludes,
                'wpcontent': wpContent
            },
            domainNames: ['www.rebudd.com', 'rebudd.com'],
            certificate: myCertificate
        });
    }
}
