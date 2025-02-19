import * as AWS from 'aws-sdk';

// TODO: use getHighestRulePriority to set listener rule priority for load balancer listener rules
export default async function getHighestRulePriority(listenerArn: string): Promise<number> {
  const elb = new AWS.ELBv2();
  const result = await elb.describeRules({ ListenerArn: listenerArn }).promise();
  let highest = 0;
  for (const rule of result.Rules ?? []) {
    // Skip the default rule
    if (rule.Priority && rule.Priority !== 'default') {
      const prio = parseInt(rule.Priority, 10);
      if (prio > highest) {
        highest = prio;
      }
    }
  }
  return highest;
}

// example showing how to use the getHighestRulePriority function
// (async () => {
//   const listenerArn = process.argv[2];
//   if (!listenerArn) {
//     console.error('Usage: npx ts-node main.ts <listenerArn>');
//     process.exit(1);
//   }

//   try {
//     const highest = await getHighestRulePriority(listenerArn);
//     console.log(`Highest rule priority for listener ${listenerArn} is ${highest}`);
//   } catch (error) {
//     console.error('Error fetching highest rule priority:', error);
//     process.exit(1);
//   }
// })();
