describe('Initial checks', () => {
  beforeEach(createSpaces);
  afterEach(removeSpaces);

  test('It should see the test space', async () => {
    const { id } = await confluenceClient.getSpace(testSpaceKey);
    expect(id).toBeDefined();
  });
});
