

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
    );

const ENUM_COPY_PAGE_DESTINATION = {
    SPACE: 'space',
    EXISTING_PAGE: 'existing_page',
    PARENT_PAGE: 'parent_page',
};

const COPY_PAGE_PARAMS = {
    copyCustomContents: false,
    copyAttachments: true,
    copyLabels: true,
    copyProperties: true,
    destination: {
        type: ENUM_COPY_PAGE_DESTINATION.SPACE,
        value: '',
    },
    pageTitle: undefined,
    body: {
        storage: {
            value: '',
            representation: 'storage',
        },
    },
};

module.exports = {
    createPageUnderSpaceHomepage,
    createPageUnderSpaceRoot,
    COPY_PAGE_PARAMS,
    ENUM_COPY_PAGE_DESTINATION
}