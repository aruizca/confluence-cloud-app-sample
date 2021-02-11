require('dotenv').config();

const NodeEnvironment = require('jest-environment-node');
const basicAuth = require('../../main/lib/basicAuth');
const ConfluenceWrapper = require('../../main/lib/ConfluenceWrapper');
const { ATLASSIAN_USER, ATLASSIAN_API_TOKEN, CONFLUENCE_BASE_URL } = process.env;

/** Returns <length> size Random String
 * @param [length]
 * @returns <string>
 */
const getRandomString = (length = 5) => {
  if (!Number.isInteger(length) || length < 1) throw new Error('String length must be a number higher than 0');
  return [...Array(length)].map(() => (~~(Math.random() * 36)).toString(36)).join('');
};

class ConfluenceEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    const httpClient = basicAuth(CONFLUENCE_BASE_URL, ATLASSIAN_USER, ATLASSIAN_API_TOKEN);
    const confluenceClient = new ConfluenceWrapper(httpClient);

    // Setup global environment
    this.global.confluenceClient = confluenceClient;

    this.global.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    this.global.createSpaces = () => {
      const testSpaceKey = getRandomString().toUpperCase();

      this.global.testSpaceKey = testSpaceKey;
      return Promise.all([
        confluenceClient.createSpace({
          key: testSpaceKey,
          name: `${testSpaceKey} Test Space`,
        })
      ]);
    };

    this.global.removeSpaces = () =>
      Promise.all([confluenceClient.deleteSpace(this.global.testSpaceKey)]);
  }
}

module.exports = ConfluenceEnvironment;
