const fs = require('fs');
const path = require('path')
const { createPageUnderSpaceHomepage, COPY_PAGE_PARAMS, ENUM_COPY_PAGE_DESTINATION } = require('../helper/confluenceHelper');

describe('Step to reproduce bug when copying attachments twice', () => {
    beforeEach(createTestSpaces);
    afterEach(removeTestSpaces);

    test('Updating a page using the Copy Single Page API endpoint, always creates new attachment version', async () => {
        const fileStream = fs.readFileSync(path.resolve(__dirname, './files/test.png'));
        // Given: a page in the source Space
        const sourcePageA = await createPageUnderSpaceHomepage('A', sourceSpaceKey, {
            expand: ['body']
        });

        // And: An attachment named "test.png" uploaded, which is inserted in the body
        const sourceAttachment = await confluenceClient.createOrUpdateAttachmentFromStream(sourcePageA.id, fileStream, { title: 'test.png' });
        await confluenceClient.setContent(sourcePageA.id, {
            body: {
                storage: {
                    value: '<p><ac:image><ri:attachment ri:filename="test.png" ri:version-at-save="1" /></ac:image></p>',
                    representation: 'storage',
                },
            }
        })

        // When: we copy that page to a target space

        let copyPageParams = COPY_PAGE_PARAMS;
        copyPageParams.destination.value = targetSpaceKey;
        copyPageParams.body.storage.value = sourcePageA.body.storage.value
        let targetPageA = await confluenceClient.copySinglePage(sourcePageA.id, copyPageParams, {
            expand: ['body.storage']
        });

        await sleep(2000);

        const targetAttachmentOnFirstCopy = await confluenceClient.getChildrenOfType(targetPageA.id, 'attachment', { expand: ['version'] })
        expect(targetAttachmentOnFirstCopy.results[0].version.number).toEqual(sourceAttachment.results[0].version.number)


        // And: we copy it OVER with *copyAttachments* option enabled
        copyPageParams.destination = {
            type: ENUM_COPY_PAGE_DESTINATION.EXISTING_PAGE,
            value: targetPageA.id,
        }

        await confluenceClient.copySinglePage(sourcePageA.id, copyPageParams, {
            expand: ['body.storage']
        })

        // Then: Attachment version on source and destination don't match, breaking image linking in body storage
        const targetAttachmentOnSecondCopy = await confluenceClient.getChildrenOfType(targetPageA.id, 'attachment', { expand: ['version'] })
        expect(targetAttachmentOnSecondCopy.results[0].version.number).toEqual(sourceAttachment.results[0].version.number)
    });

});