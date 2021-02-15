const {createPageUnderSpaceHomepage, COPY_PAGE_PARAMS, ENUM_COPY_PAGE_DESTINATION} = require('../helper/confluenceHelper');

describe('Step to reproduce bug in moving content REST endpoint', () => {
    beforeEach(createTestSpaces);
    afterEach(removeTestSpaces);

    test('Updating a page using the Copy Single Page API endpoint, do not reflect removed Content Properties', async () => {
        // Given: a page in the source Space
        const sourcePageA = await createPageUnderSpaceHomepage('A', sourceSpaceKey, {
            expand: ['body']
        });
        // and: we add a content property to that page
        await confluenceClient.createContentProperty(sourcePageA.id, {
            key: 'foo',
            value: 'bar'
        });

        // When: we copy that page to a target space
        let copyPageParams = COPY_PAGE_PARAMS;
        copyPageParams.destination.value = targetSpaceKey;
        copyPageParams.body.storage.value = sourcePageA.body.storage.value
        let targetPageA = await confluenceClient.copySinglePage(sourcePageA.id, copyPageParams, {
            expand: ['body.storage']
        })
        await sleep(2000);

        // Then: the content body is the same
        expect(targetPageA.body.storage.value).toEqual(sourcePageA.body.storage.value)
        // and: the content property is also present in the target page
        let targetPageAContentProperty = await confluenceClient.getContentProperty(targetPageA.id, 'foo');
        expect(targetPageAContentProperty.value).toStrictEqual('bar');

        // When: we remove that content property in the source page
        await confluenceClient.deleteContentProperty(sourcePageA.id, 'foo')
        // and: we copy the page again to the target space
        copyPageParams.destination.type = ENUM_COPY_PAGE_DESTINATION.EXISTING_PAGE;
        copyPageParams.destination.value = targetPageA.id;
        targetPageA = await confluenceClient.copySinglePage(sourcePageA.id, copyPageParams, {
            expand: ['body.storage']
        })
        await sleep(2000);

        // Then: the content property is still present in the target page
        targetPageAContentProperty = await confluenceClient.getContentProperty(targetPageA.id, 'foo');
        expect(targetPageAContentProperty).toBeNull();
    });

});