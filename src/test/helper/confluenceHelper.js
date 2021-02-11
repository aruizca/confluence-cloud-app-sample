

const createPageUnderSpaceHomepage = (title, spaceKey) => _createContent(title, spaceKey, {ancestors: null})

const createPageUnderSpaceRoot = (title, spaceKey) => _createContent(title, spaceKey)

const _createContent = (title, spaceKey, {ancestors = []} = []) =>
    confluenceClient.createContent(
        {
            title,
            type: 'page',
            space: {
                key: spaceKey,
            },
            body: {
                storage: {
                    value: 'This is a test...',
                    representation: 'storage',
                },
            },
            ancestors
        },
        {expand: ['ancestors']}
    )

module.exports = { createPageUnderSpaceHomepage, createPageUnderSpaceRoot }