const { createPageUnderSpaceRoot, createPageUnderSpaceHomepage } = require('../helper/confluenceHelper');

describe('Step to reproduce bug in moving content REST endpoint', () => {
  beforeAll(async () => {
    await createSpaces();
  });

  afterAll(async () => {
    await removeSpaces();
  });

  test('When moving a page that sits under space root as child of a page that also seats under space root,' +
      ' the page_moved webhook should be triggered to add a content property flag', async () => {
    // Given: a page A located at Space Root === (ancestors = [])
    const pageA = await createPageUnderSpaceRoot('A', testSpaceKey);
    // and: a page B on located at Space Root === (ancestors = [])
    const pageB = await createPageUnderSpaceRoot('B', testSpaceKey);

    // When: we move B as child of A
    confluence.moveContent(pageB.id, 'append', pageA.id)
    // and wait 5 seconds for the webhook to execute. We are aware this is not 100% reliable but it will do most of the time
    await sleep(5000);

    // Then: the page_moved webhook is triggered and a content property flag is set
    const flag = await confluence.getContentProperty(pageB.id, 'my-sample-app-flag');
    expect(flag).not.toBeUndefined();
    expect(flag.value).toBeTruthy();
  });

  test('When moving a page that sits under space root as child of a page tha sits under space homepage,' +
      ' the page_moved webhook should be triggered to add a content property flag', async () => {
    // Given: a page A located at Space Root === (ancestors = [])
    const pageA = await createPageUnderSpaceHomepage('A', testSpaceKey);
    // and: a page B on located at Space Root === (ancestors = [])
    const pageB = await createPageUnderSpaceRoot('B', testSpaceKey);

    // When: we move B as child of A
    confluence.moveContent(pageB.id, 'append', pageA.id)
    // and wait 5 seconds for the webhook to execute. We are aware this is not 100% reliable but it will do most of the time
    await sleep(5000);

    // Then: the page_moved webhook is triggered and a content property flag is set
    const flag = await confluence.getContentProperty(pageB.id, 'my-sample-app-flag');
    expect(flag).not.toBeUndefined();
    expect(flag.value).toBeTruthy();
  });
});
