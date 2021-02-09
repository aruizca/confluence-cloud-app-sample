const renameProps = (obj, mappings) => {
  Object.keys(mappings).forEach(key => {
    obj[mappings[key]] = obj[key];
    delete obj[key];
  });
}

const methodMapping = {
  get: 'get',
  post: 'post',
  put: 'put',
  delete: 'del',
  head: 'head',
  patch: 'patch'
};

const defaultOptions = {
  type: 'GET',
  contentType: 'application/json',
  headers: {},
};

module.exports = { renameProps, methodMapping, defaultOptions }