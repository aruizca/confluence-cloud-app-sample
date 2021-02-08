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
        addon.checkValidToken(),
        async (req, res) => {
            try {
                console.log("page_moved triggered");
                const httpClient = addon.httpClient(req);

                const response = await httpClient.post({
                    url: `/rest/api/content/${req.body.page.id}/property`,
                    data: JSON.stringify({
                        "key": `${addon.key}-cp`,
                        "value": {
                            "flag": true
                        }
                    }),
                    headers: JSON.stringify({
                        "Content-Type": "application/json"
                    })
                }, function (err, response, body) {
                    console.log("Flag created as content property");
                    return body;
                });

                res.status(200).send();
            } catch ({message}) {
                res.status(500).send(message);
            }
        }
    );
}
