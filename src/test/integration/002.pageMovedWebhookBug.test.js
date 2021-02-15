const { createPageUnderSpaceRoot, createPageUnderSpaceHomepage } = require('../helper/confluenceHelper');

describe('Step to reproduce bug in moving content REST endpoint', () => {
  beforeEach(createTestSpace);
  afterEach(removeTestSpace);

  test('Case 1: When moving a page that sits under the space homepage as child of a page that also seats under the space homepage,' +
      ' the page_moved webhook should be triggered to add a content property flag', async () => {
    // Given: a page A located at Space homepage
    const pageA = await createPageUnderSpaceHomepage('A', testSpaceKey);
    // and: a page B on located at Space homepage
    const pageB = await createPageUnderSpaceHomepage('B', testSpaceKey);

    // When: we move B as child of A
    confluenceClient.moveContent(pageB.id, 'append', pageA.id);
    // and wait 5 seconds for the webhook to execute. We are aware this is not 100% reliable but it will do most of the time
    await sleep(5000);

    // Then: the page_moved webhook is triggered and a content property flag is set
    const flag = await confluenceClient.getContentProperty(pageB.id, 'my-sample-app-flag');
    expect(flag).not.toBeUndefined();
    expect(flag.value).toBeTruthy();
  });

  test('Case 2: when moving a page that sits under the space homepage to the space root location,' +
    ' the page_moved webhook should be triggered to add a content property flag', async() => {
    // Given: a page A located at Space Homepage
    const pageA = await createPageUnderSpaceHomepage('A', testSpaceKey);

    // When: we move A to the Space Root
    const testSpace = await confluenceClient.getSpace(testSpaceKey, { expand: ['homepage'] });
    confluenceClient.moveContent(pageA.id, 'before', testSpace.homepage.id);
    // and wait 5 seconds for the webhook to execute. We are aware this is not 100% reliable but it will do most of the time
    await sleep(5000);

    // Then: he page_moved webhook is triggered and a content property flag is set
    const flag = await confluenceClient.getContentProperty(pageA.id, 'my-sample-app-flag');
    expect(flag).not.toBeUndefined();
    expect(flag.value).toBeTruthy();
  });

  test('Case 3: When moving a page that sits on space root as child of the Space Homepage,' +
      ' the page_moved webhook should be triggered to add a content property flag', async () => {
    // Given: a page A located at Space Root === (ancestors = [])
    const pageA = await createPageUnderSpaceRoot('A', testSpaceKey);

    // When: we move A under the Space Homepage
    const testSpace = await confluenceClient.getSpace(testSpaceKey, { expand: ['homepage'] });
    confluenceClient.moveContent(pageA.id, 'append', testSpace.homepage.id)
    // and wait 5 seconds for the webhook to execute. We are aware this is not 100% reliable but it will do most of the time
    await sleep(5000);

    // Then: the page_moved webhook is triggered and a content property flag is set
    const flag = await confluenceClient.getContentProperty(pageA.id, 'my-sample-app-flag');
    expect(flag).not.toBeUndefined();
    expect(flag.value).toBeTruthy();
  });
});
