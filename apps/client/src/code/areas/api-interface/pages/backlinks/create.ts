export async function createPageBacklink(input: {
  sourcePageId: string;
  targetUrl: string;
}) {
  const pageLinkMatch = /\/pages\/([\w-]{21})(?:$|\/)/.exec(input.targetUrl);

  if (pageLinkMatch == null) {
    return;
  }

  await trpcClient.pages.backlinks.create.mutate({
    sourcePageId: input.sourcePageId,
    targetPageId: pageLinkMatch[1],
  });
}
