import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';

export class WordpressInfraStackCertificateManager extends cdk.Stack {
  public certificate: acm.Certificate;

  constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const lavinFoodsHz = route53.HostedZone.fromHostedZoneId(
      this,
      'LavinFoods',
      'Z07111791K2ZCI71L8UU3'
    );
    const worldwideandwebHz = route53.HostedZone.fromHostedZoneId(
      this,
      'WorldWideandWeb',
      'Z03778471PHMCN6LLU526'
    );
    const lilyofthenileHz = route53.HostedZone.fromHostedZoneId(
      this,
      'LilyeOfTheNile',
      'Z0104154T3JSCTR4C93F'
    );
    const vintageGroomingHz = route53.HostedZone.fromHostedZoneId(
      this,
      'VintageGrooming',
      'Z00165253W1BNHOFJLQ54'
    );
    const helpmycaseHz = route53.HostedZone.fromHostedZoneId(
      this,
      'HelpMyCase',
      'Z1018955P0A0ARLVX9SO'
    );

    const truemanbarbersHz = route53.HostedZone.fromHostedZoneId(
      this,
      'TruemanBarbers',
      'Z001721717RN5QLJLMRK0'
    );

    this.certificate = new acm.Certificate(this, 'Certificate', {
      domainName: 'worldwideandweb.com',
      subjectAlternativeNames: [
        '*.worldwideandweb.com',
        'vintagegrooming.co.uk',
        '*.vintagegrooming.co.uk',
        'helpmycase.co.uk',
        '*.helpmycase.co.uk',
        '*.truemanbarbers.co.uk',
        'truemanbarbers.co.uk',
      ],
      validation: acm.CertificateValidation.fromDnsMultiZone({
        '*.worldwideandweb.com': worldwideandwebHz,
        'vintagegrooming.co.uk': vintageGroomingHz,
        '*.vintagegrooming.co.uk': vintageGroomingHz,
        'helpmycase.co.uk': helpmycaseHz,
        '*.helpmycase.co.uk': helpmycaseHz,
        '*.truemanbarbers.co.uk': truemanbarbersHz,
        'truemanbarbers.co.uk': truemanbarbersHz,
      }),
    });
  }
}
