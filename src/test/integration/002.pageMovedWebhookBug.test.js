describe('Initial checks', () => {
  beforeAll(async () => {
    await createSpaces();
  });

  afterAll(async () => {
    await removeSpaces();
  });

  test('page_moved webhook should be triggered when using the moving content REST endpoint', async () => {
    // Given: a page A

    // and: a page B

    // When: we move B as child of A

    // Then: the page_moved webhook is triggered and a content property flag is set

  });
});
