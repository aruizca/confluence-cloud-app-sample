describe('Initial checks', () => {
  beforeAll(async () => {
    await createSpaces();
  });

  afterAll(async () => {
    await removeSpaces();
  });

  test('It should see the test space', async () => {
    const { id } = await confluence.getSpace(testSpaceKey);
    expect(id).toBeDefined();
  });
});
