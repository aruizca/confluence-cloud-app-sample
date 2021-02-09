export default function routes(app, addon) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json');
    });

    // This is an example route used by "generalPages" module (see atlassian-connect.json).
    // Verify that the incoming request is authenticated with Atlassian Connect.
    app.get('/hello-world', addon.authenticate(), (req, res) => {
        // Rendering a template is easy; the render method takes two params: the name of the component or template file, and its props.
        // Handlebars and jsx are both supported, but please note that jsx changes require `npm run watch-jsx` in order to be picked up by the server.
        res.render(
            'hello-world.hbs', // change this to 'hello-world.jsx' to use the Atlaskit & React version
            {
                title: 'Atlassian Connect'
                //, issueId: req.query['issueId']
                //, browserOnly: true // you can set this to disable server-side rendering for react views
            }
        );
    });

    // Add additional route handlers here...
    app.post(
        '/rest/my-sample-app/1/event/page_moved',
        addon.authenticate(),
        async (req, res) => {
            try {
                console.log("page_moved triggered");

                const httpClient = addon.httpClient(req);
                // Add a flag as content property
                await httpClient.post({
                    url: `/rest/api/content/${req.body.page.id}/property`,
                    body: JSON.stringify({
                        "key": `${addon.key}-flag`,
                        "value": true
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                res.status(200).send();
            } catch (error) {
                console.error(e);
                res.status(500).send(e.message);
            }
        }
    );
}
