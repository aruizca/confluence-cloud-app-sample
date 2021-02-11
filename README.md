# Confluence Cloud Sample App

This repo provides the skelleton of a minimal Confluence Cloud app that help us reproduce bugs and report them properly

## Bugs reproduced

Next are the bugs we have discovered on Confluence Cloud:

### 1. page_moved webhook bug

**Description**

When a page is moved to or from the Space Root content hierarchy, the page_moved webhook is not triggered.

**Steps to reproduce**

This Confluence Cloud sample app registers a _page_moved_ webhook to add contentproperty flag to the page that was
moved.

- Install this sample app in your Confluence instance
- Create a space
- Create a page under the Space Homepage
- Move the page to Space Root
- The content property `my-sample-app-flag` with value true is not created because _page_moved_ webhooks is not 
  triggered.

**Expected result**

- The content property `my-sample-app-flag` with value true is created in the moved page.

**Automatic Tests**

This webhook is used by a suite of integration tests we have created to automatically verify whether that flag is being
created or not in different scenarios. It can be found at: `/src/test/integration/002.pageMovedWebhookBug.test.js`

Only 1 out of the 3 tests pass successfully. We consider that the three of them should pass.

⚠️ Please note the app must be running before executing the automatic tests

### 2. content property removal not carried over by copy-single-page API

## Setting up the app backend

- Install dependencies

```shell
npm i
```

- Set environment variables

Since we are using dotenv, you would need to copy the `.env.sample` file to `.env` and replacing the values that
correspond yo tou environment.

```properties
LOCAL_BASE_URL=https://xxxxx.ngrok.io
CONFLUENCE_BASE_URL=https://your-instance.atlassian.net/wiki
ATLASSIAN_USER=your@email.com
ATLASSIAN_API_TOKEN=<your_api_token>
```

`LOCAL_BASE_URL` is required to install the sample app in your Confluence Cloud instance.

The rest are required to execute the tests.

## Running the sample app

- You need to start you http tunnel to expose port 3001
- Start the server:

```shell
npm start
```

...or for development using nodemon:

```shell
npm start:dev
```

Now the app can be installed in your Confluence Cloud instance.

## Running all the automatic tests

- First you need to run the app following previosu steps
- After that just run:

```shell
npm run test:integration
```
