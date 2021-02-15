describe('Initial checks', () => {
  beforeEach(createTestSpace);
  afterEach(removeTestSpace);

  test('It should see the test space', async () => {
    const { id } = await confluenceClient.getSpace(testSpaceKey);
    expect(id).toBeDefined();
  });
});
