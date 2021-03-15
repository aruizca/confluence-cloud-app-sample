/**
 * Generic **LOW-LEVEL API** access class for confluence based on convention:
 * - It'll get a generic jquery based httpClient
 * - All methods will follow a simple signature:
 *   <nameFromAPI>(option1, optionN, params={}) => PROMISE
 *   - Name will come directly from API doco (https://docs.atlassian.com/confluence/REST/latest)
 *   - GET parameters will be passed as a literal: extend can be passed as an array
 *   - Options will become replacements for url
 *   - It'll return a promise
 *
 * Ex.
 * ```
 * import httpClient, { Confluence } from 'isomorphic-atlassian';
 * const confluence = new Confluence(httpClient);
 * confluence.getContentById(3455, { extend: ['operations']})
 * ```
 */
class ConfluenceWrapper {
    constructor(httpClient) {
        if (typeof httpClient === 'function') {
            this.httpClient = httpClient;
        } else if (typeof httpClient.atlasRequest === 'function') {
            this.httpClient = httpClient.atlasRequest;
        } else {
            throw new Error('Not valid http client provided');
        }
    }

    // --- Content
    createContent(data, options = {}) {
        return this.httpClient(Object.assign({
            type: 'POST',
            url: '/rest/api/content',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        }, options));
    }

    getContent(params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/content?${serializedParams}`,
        }, options));
    }

    updateContent(id, data, options = {}) {
        return this.httpClient(Object.assign({
            type: 'PUT',
            url: `/rest/api/content/${id}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        }, options));
    }

    setContent(id, data, options={}) {
        const retrials = 2;
        return this.getContentById(id, { expand: ['version']}, options).then(content => {
            if (content) {
                const augmentedData = Object.assign(
                    {
                        type: content.type,
                        title: content.title,
                        version: {
                            number: content.version.number + 1,
                        },
                    },
                    data
                );
                return this.updateContent(id, augmentedData, options)
                    .catch(error => {
                        if (error.status === 409 && retrials > 0) {
                            // Version didn't match expected value: transaction error => retry
                            console.warn(`Retrying setContent (409 received), ${retrials} tries left`);
                            return this.setContent(id, data, Object.assign({}, options, { retrials: retrials - 1 }));
                        }
                        throw error;
                    });
            } else {
                return this.createContent(data, options);
            }
        });
    }

    /**
     *
     * @param id(Required) - The ID of the page to be moved
     * @param position(Required) - before|after|append
     * @param targetId(Required) - The ID of the target page for this operation
     */
    moveContent(id, position, targetId, options = {}) {
        return this.httpClient(Object.assign({
            type: 'PUT',
            url: `/rest/api/content/${id}/move/${position}/${targetId}`,
            headers: {
                'Content-Type': 'application/json'
            }
        }, options));
    }

    getContentById(id, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params)
        return this.httpClient(Object.assign({
            url: `/rest/api/content/${id}?${serializedParams}`,
        }, options));
    }

    deleteContent(id, options = {}) {
        return this.httpClient(Object.assign({
            type: 'DELETE',
            url: `/rest/api/content/${id}`,
            headers: {
                'Content-Type': 'application/json'
            },
        }, options));
    }

    getContentRestrictions(id, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params)
        return this.httpClient(Object.assign({
            url: `/rest/api/content/${id}/restriction?${serializedParams}`,
        }, options));
    }

    addContentRestrictions(id, data = {}, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params)
        return this.httpClient(Object.assign({
            type: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            url: `/rest/api/content/${id}/restriction?${serializedParams}`,
            data: JSON.stringify(data)
        }, options));
    }

    updateContentRestrictions(id, data = {}, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params)
        return this.httpClient(Object.assign({
            type: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            url: `/rest/api/content/${id}/restriction?${serializedParams}`,
            data: JSON.stringify(data)
        }, options));
    }

    removeContentRestrictions(id, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params)
        return this.httpClient(Object.assign({
            type: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            url: `/rest/api/content/${id}/restriction?${serializedParams}`
        }, options));
    }

    addUserToContentRestriction(id, operation, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params)
        return this.httpClient(Object.assign({
            type: 'PUT',
            headers: {
                'Accept': 'application/json',
            },
            url: `/rest/api/content/${id}/restriction/byOperation/${operation}/user?${serializedParams}`
        }, options));
    }

    removeUserToContentRestriction(id, operation, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params)
        return this.httpClient(Object.assign({
            type: 'DELETE',
            headers: {
                'Accept': 'application/json'
            },
            url: `/rest/api/content/${id}/restriction/byOperation/${operation}/user?${serializedParams}`
        }, options));
    }

    addGroupToContentRestriction(id, operation, groupName, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params)
        return this.httpClient(Object.assign({
            type: 'PUT',
            headers: {
                'Accept': 'application/json',
            },
            url: `/rest/api/content/${id}/restriction/byOperation/${operation}/group/${encodeURIComponent(groupName)}?${serializedParams}`
        }, options));
    }

    removeGroupToContentRestriction(id, operation, groupName, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params)
        return this.httpClient(Object.assign({
            type: 'DELETE',
            headers: {
                'Accept': 'application/json'
            },
            url: `/rest/api/content/${id}/restriction/byOperation/${operation}/group/${encodeURIComponent(groupName)}?${serializedParams}`
        }, options));
    }

    getHistory(id, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/content/${id}/history?${serializedParams}`,
        }, options));
    }

    getContentLabels(id, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params)
        return this.httpClient(Object.assign({
            url: `/rest/api/content/${id}/label?${serializedParams}`,
        }, options));
    }

    addContentLabels(id, data = {}, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params)
        return this.httpClient(Object.assign({
            type: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            url: `/rest/api/content/${id}/label?${serializedParams}`,
            data: JSON.stringify(data)
        }, options));
    }

    removeContentLabel(id, label, options = {}) {
        return this.httpClient(Object.assign({
            type: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            url: `/rest/api/content/${id}/label/${label}`
        }, options));
    }

    // --- Search api: search / searchContent / searchUsers

    // Deprecated: Just kept for backwards compat
    cqlSearch(cql, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/search?${serializedParams}`,
            headers: {
                Accept: 'application/json'
            },
            data: {
                cql
            }
        }, options));
    }

    search(params = {}, options = {}) {
        return this.cqlSearch(params, options);
    }

    searchContent(params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/content/search?${serializedParams}`,
        }, options));
    }

    searchUsers(params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/search/user?${serializedParams}`,
        }, options));
    }


    // --- Child
    getChildren(id, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/content/${id}/child?${serializedParams}`,
        }, options));
    }

    getChildrenOfType(id, type, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/content/${id}/child/${type}?${serializedParams}`,
        }, options));
    }


    // --- Notification
    getNotificationsForChildContentCreated(id, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/content/${id}/notification/child-created?${serializedParams}`,
        }, options));
    }

    getNotificationsForContentCreated(id, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/content/${id}/notification/created?${serializedParams}`,
        }, options));
    }


    // --- Version
    getContentHistory(id, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/content/${id}/version?${serializedParams}`,
        }, options));
    }

    getContentVersion(id, versionNumber, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/content/${id}/version/${versionNumber}?${serializedParams}`,
        }, options));
    }


    // --- Group
    getGroups(params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/group?${serializedParams}`,
        }, options));
    }

    getGroup(groupName, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/group/${encodeURIComponent(groupName)}?${serializedParams}`,
        }, options));
    }

    getMembers(groupName, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/group/${encodeURIComponent(groupName)}/member?${serializedParams}`,
        }, options));
    }


    // --- Long task
    getTasks(params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/longtask?${serializedParams}`,
        }, options));
    }

    getTask(id, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/longtask/${id}?${serializedParams}`,
        }, options));
    }


    // --- Space
    getSpaces(params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/space?${serializedParams}`,
        }, options));
    }

    createSpace(data, options = {}) {
        return this.httpClient(Object.assign({
            type: 'POST',
            url: '/rest/api/space',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        }, options));
    }

    updateSpace(spaceKey, data, options = {}) {
        return this.httpClient(Object.assign({
            type: 'PUT',
            url: `/rest/api/space/${spaceKey}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        }, options));
    }

    deleteSpace(spaceKey, options = {}) {
        return this.httpClient(Object.assign({
            type: 'DELETE',
            url: `/rest/api/space/${spaceKey}`,
            headers: {
                'Content-Type': 'application/json'
            },
        }, options));
    }

    getSpace(spaceKey, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/space/${spaceKey}?${serializedParams}`,
        }, options));
    }

    getSpaceContent(spaceKey, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/space/${spaceKey}/content?${serializedParams}`,
        }, options));
    }

    getSpaceContentByType(spaceKey, type, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/space/${spaceKey}/content/${type}?${serializedParams}`,
        }, options));
    }

    // --- Properties
    getAllContentProperties(id, params = {}, options = {}) {
        return this._getAllProperties.bind(this, 'content')(id, params, options);
    }

    getContentProperty(id, key, params = {}, options = {}) {
        return this._getProperty.bind(this, 'content')(id, key, params, options);
    }

    createContentProperty(id, data, options = {}) {
        return this._createProperty.bind(this, 'content')(id, data, options);
    }

    updateContentProperty(id, key, data, options = {}) {
        return this._updateProperty.bind(this, 'content')(id, key, data, options);
    }

    deleteContentProperty(id, key, options = {}) {
        return this._deleteProperty.bind(this, 'content')(id, key, options);
    }

    getAllSpaceProperties(spaceKey, params = {}, options = {}) {
        return this._getAllProperties.bind(this, 'space')(spaceKey, params, options);
    }

    getSpaceProperty(spaceKey, key, params = {}, options = {}) {
        return this._getProperty.bind(this, 'space')(spaceKey, key, params, options);
    }

    createSpaceProperty(spaceKey, data, options = {}) {
        return this._createProperty.bind(this, 'space')(spaceKey, data, options);
    }

    updateSpaceProperty(spaceKey, key, data, options = {}) {
        return this._updateProperty.bind(this, 'space')(spaceKey, key, data, options);
    }

    deleteSpaceProperty(spaceKey, key, options = {}) {
        return this._deleteProperty.bind(this, 'space')(spaceKey, key, options);
    }

    _getAllProperties(type, id, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/${type}/${id}/property?${serializedParams}`,
        }, options));
    }

    _getProperty(type, id, key, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/${type}/${id}/property/${key}?${serializedParams}`,
        }, options));
    }

    _createProperty(type, id, data, options = {}) {
        return this.httpClient(Object.assign({
            type: 'POST',
            url: `/rest/api/${type}/${id}/property`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        }, options));
    }

    _updateProperty(type, id, key, data, options = {}) {
        return this.httpClient(Object.assign({
            type: 'PUT',
            url: `/rest/api/${type}/${id}/property/${key}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        }, options));
    }

    _deleteProperty(type, id, key, options = {}) {
        return this.httpClient(Object.assign({
            type: 'DELETE',
            url: `/rest/api/${type}/${id}/property/${key}`,
        }, options));
    }


    // --- Addon properties
    getAddonProperties(addonKey, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/atlassian-connect/1/addons/${addonKey}/properties?${serializedParams}`,
        }, options));
    }

    getAddonProperty(addonKey, key, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/atlassian-connect/1/addons/${addonKey}/properties/${key}?${serializedParams}`,
        }, options))
            .catch(error => {
                // Yeah... (dull), status is returned by a different key
                if (error && error['status-code'] === 404) return;
                throw error;
            });
    }

    setAddonProperty(addonKey, key, data, options = {}) {
        return this.httpClient(Object.assign({
            type: 'PUT',
            url: `/rest/atlassian-connect/1/addons/${addonKey}/properties/${key}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        }, options));
    }

    deleteAddonProperty(addonKey, key, options = {}) {
        return this.httpClient(Object.assign({
            type: 'DELETE',
            url: `/rest/atlassian-connect/1/addons/${addonKey}/properties/${key}`,
            headers: {
                'Content-Type': 'application/json'
            },
        }, options));
    }

    getAddonInfo(addonKey, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/atlassian-connect/1/addons/${addonKey}?${serializedParams}`,
        }, options));
    }

    // --- User (Prefixed methods with getUser to avoid collisions)
    getUser(params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/user?${serializedParams}`,
        }, options));
    }

    getUserAnonymous(params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/user/anonymous?${serializedParams}`,
        }, options));
    }

    getUserCurrent(params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/user/current?${serializedParams}`,
        }, options));
    }

    getUserGroups(params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/api/user/memberof?${serializedParams}`,
        }, options));
    }

    userSearch(term, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/prototype/1/search/user?${serializedParams}`,
            headers: {
                Accept: 'application/json'
            },
            data: {
                query: term, // search term
                'max-results': 10
            }
        }, options));
    }

    groupSearch(term, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params);
        return this.httpClient(Object.assign({
            url: `/rest/prototype/1/search/group?${serializedParams}`,
            headers: {
                Accept: 'application/json'
            },
            data: {
                query: term, // search term
                'max-results': 10
            }
        }, options));
    }

    getEmail(user, options = {}) {
        return this.httpClient(Object.assign({
            url: `/rest/api/user/email?accountId=${user}`,
        }, options));
    }

    getBulkEmails(users, options = {}) {
        return this.httpClient(Object.assign({
            url: `/rest/api/user/email/bulk?${users.map((accountId) => `accountId=${accountId}`).join('&')}`,
        }, options));
    }

    _serializeGETParams(params) {
        // Special case for expands, deal with them :P
        if (params.expand && Array.isArray(params.expand)) {
            params.expand = params.expand.join(',');
        }
        return Object.keys(params)
            .filter(key => params[key] && params[key].length !== 0)
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');
    }
    /**
     * SHORTCUT METHOD TO CLONE IN SAME INSTANCE
     * Uses get call stream to post as multipart/form-data
     * @param {string} id - The target content Id
     * @param {object} attachment - attachment Object
     * @param {object} [options] - Request Options
     * @param {object} [params] - Addition get params
     * @returns {Promise<Object|Error>} result
     */
    createOrUpdateAttachment(id, attachment, options = {}, params = {}) {
        const serializedParams = this._serializeGETParams(params);
        this.getReadableStreamFromAttachment(attachment)
            .then(data => {
                const formData = {
                    file: {
                        value: data,
                        options: {
                            filename: attachment.title,
                        },
                        minorEdit: 'true',
                    }
                }
                return this.httpClient(Object.assign({
                    type: 'PUT',
                    headers: {
                        'X-Atlassian-Token': 'nocheck'
                    },
                    url: `/rest/api/content/${id}/child/attachment?${serializedParams}`,
                    formData: formData
                }, options));
            })
    }

    /**
     * Gets the readable Stream of an attachment
     * @param {object} attachment - attachment Object
     * @param {object} [options] - Request Options
     * @returns {ReadableStream} Stream - Binary Stream
     */
    getReadableStreamFromAttachment(attachment, options = {}) {
        return this.httpClient(Object.assign({
            type: 'GET',
            url: attachment._links.download,
        }, { ...options, encoding: null }))
    }

    /**
     * Use for copy bewteen instances
     * Needs Readable Stream ( fs, request )
     * @param {string} id - The target content Id
     * @param {ReadableStream} stream - Binary Stream
     * @param {object} attachment - attachment Object
     * @param {object} [options] - Request Options
     * @param {object} [params] - Addition get params
     * @returns {Promise<Object|Error>} result
     */
    createOrUpdateAttachmentFromStream(id, stream, attachment, options = {}, params = {}) {
        const serializedParams = this._serializeGETParams(params);
        const formData = {
            file: {
                value: stream,
                options: {
                    filename: attachment.title,
                },
                minorEdit: 'true',
            }
        }
        return this.httpClient(Object.assign({
            type: 'PUT',
            headers: {
                'X-Atlassian-Token': 'nocheck'
            },
            url: `/rest/api/content/${id}/child/attachment?${serializedParams}`,
            formData: formData
        }, options));
    }

    /** COPY SINGLE PAGE API */
    copySinglePage(id, data, params = {}, options = {}) {
        const serializedParams = this._serializeGETParams(params)
        return this.httpClient(Object.assign({
            type: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            url: `/rest/api/content/${id}/copy?${serializedParams}`,
            data: JSON.stringify(data)
        }, options));
    }
}

module.exports = ConfluenceWrapper;
