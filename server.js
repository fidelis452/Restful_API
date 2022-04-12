'use strict'
const Hapi =  require("hapi")
const Request = require("request")
const Vision = require("vision")
const Handlebars = require("handlebars")
const LodashFilter = require("lodash.filter")
const LodashTake = require("lodash.take")
// const Hapi = require('@hapi/hapi');

// Hapi: this is obvious since our app is built on Hapi.js.
// Vision: a Hapi.js plugin that allow for views in Hapi.js application.
// Handlebars: project’s templating engine.
// Request: HTTP request client for Node.js.
// Lodash.filter: Lodash collection filter method.
// Lodash.take: Lodash Array take method.

const server =  new Hapi.Server();

server.connection({
    host: '127.0.0.1',
    port: 3002
});

//Register vision for our views
server.register(Vision, (err) => {
    server.views({
        engines: {
            html: Handlebars
        },
        relativeTo:__dirname,
        path:'./views',
    });
});
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(`Server Running at: ${server.info.uri}`);
});
//Show team standing
server.route({
    method: 'GET',
    path:'/',
    handler: function (request, reply) {
        Request.get("http://api.football-data.org/v2/competitions/438/leagueTable'"),
        function (error, response, body) {
            if (error) {
                throw error;
            }
            const data = JSON.parse(body);
            reply.view('index', {result: data});
        };
    }
});
// A simple helper function that extracts team ID from team URL
Handlebars.registerHelper('teamID', 
function (teamUrl) {
    return teamUrl.slice(38);
})
//show particular team
server.route({
    method:'GET',
    path:'/teams/{id}',
    handler:function (request, reply) {
        const teamID = encodeURIComponent(request.params.id);
        Request.get(`http://api.football-data.org/v2/teams/${teamID}/fixtures`,
        function (error, response, body) {
            if (error) {
                throw error;
            }
            const result = JSON.parse(body);
            Request.get(`http://api.football-data.org/v2/teams/${temaID}/fixtures`, 
            function (error, response, body) {
                if (error) {
                    throw error;
                }
                const fixtures = LodashTake(LodashFilter(JSON.parse(body).fixtures,
                function (match) {
                    return match.status==='SCHEDULED';
                }),
                5
                );
                reply.view('team', {result: result, fixtures: fixtures });
            });
        });
        
    }
});