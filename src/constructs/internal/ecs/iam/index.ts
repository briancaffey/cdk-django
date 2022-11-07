import {
  Stack,
} from 'aws-cdk-lib';
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

// not using any props for now
// export interface EcsRolesProps {};

export class EcsRoles extends Construct {
  readonly ecsTaskRole: Role;
  readonly taskExecutionRole: Role;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const stackName = Stack.of(this).stackName;

    // IAM
    const ecsTaskRole = new Role(this, 'EcsTaskRole', {
      roleName: `${stackName}EcsTaskRole`,
      assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    ecsTaskRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ecs:*',
        'ec2:*',
        'elasticloadbalancing:*',
        'ecr:*',
        'cloudwatch:*',
        's3:*',
        'rds:*',
        'logs:*',
        'elasticache:*',
        'secretsmanager:*',
      ],
      resources: ['*'],
    }));

    this.ecsTaskRole = ecsTaskRole;;

    const taskExecutionRole = new Role(this, 'TaskExecutionRole', {
      roleName: `${stackName}TaskExecutionRole`,
      assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // S3
    taskExecutionRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:*'],
      resources: ['arn:aws:s3:::*', 'arn:aws:s3:::*/*'],
    }));

    // Secrets manager
    taskExecutionRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: ['*'],
    }));

    // EcsExec SSM
    taskExecutionRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ssmmessages:CreateControlChannel',
        'ssmmessages:CreateDataChannel',
        'ssmmessages:OpenControlChannel',
        'ssmmessages:OpenDataChannel',
      ],
      resources: ['*'],
    }));

    this.taskExecutionRole = taskExecutionRole;
  }
}