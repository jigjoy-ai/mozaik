#!/usr/bin/env bash
# Builds the image, pushes it to ECR and deploys the mozaik-network stack (deploy/stack.yaml).
# Needs: Docker, the AWS CLI with a profile for the mozaik-cloud account, and the certificate's ARN
# (ACM, eu-west-1, for network.app.jigjoy.ai, validated). Run from the repo root:
#   AWS_PROFILE=mozaik-cloud-prod CERTIFICATE_ARN=arn:aws:acm:... deploy/deploy.sh
set -euo pipefail
: "${CERTIFICATE_ARN:?the ACM certificate for the host name}"
export AWS_REGION=${AWS_REGION:-eu-west-1}
STACK=mozaik-network
# The load balancer the stack joins (mozaik-cloud-ingest's).
INGEST=mozaik-cloud-ingest

ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGISTRY=$ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com
REPO=mozaik-network
TAG=$(git rev-parse --short HEAD)$(git diff --quiet || echo -dirty)
IMAGE=$REGISTRY/$REPO:$TAG

aws ecr describe-repositories --repository-names $REPO >/dev/null 2>&1 ||
	aws ecr create-repository --repository-name $REPO --image-scanning-configuration scanOnPush=true >/dev/null
aws ecr get-login-password | docker login --username AWS --password-stdin $REGISTRY >/dev/null
docker build --platform linux/arm64 -t $IMAGE .
docker push $IMAGE

resource() {
	aws cloudformation describe-stack-resource --stack-name $INGEST --logical-resource-id "$1" \
		--query StackResourceDetail.PhysicalResourceId --output text
}
LISTENER=$(resource HttpsListener)
ALB_SG=$(resource AlbSg)
VPC=$(aws ec2 describe-security-groups --group-ids "$ALB_SG" --query 'SecurityGroups[0].VpcId' --output text)
SUBNETS=$(aws elbv2 describe-load-balancers --load-balancer-arns "$(resource LoadBalancer)" \
	--query 'LoadBalancers[0].AvailabilityZones[].SubnetId' --output text | tr '\t' ',')

aws cloudformation deploy --stack-name $STACK --template-file deploy/stack.yaml \
	--capabilities CAPABILITY_IAM --no-fail-on-empty-changeset \
	--parameter-overrides ImageUri=$IMAGE CertificateArn=$CERTIFICATE_ARN VpcId=$VPC \
	SubnetIds=$SUBNETS LoadBalancerSecurityGroupId=$ALB_SG HttpsListenerArn=$LISTENER
aws cloudformation describe-stacks --stack-name $STACK --query 'Stacks[0].Outputs' --output table
