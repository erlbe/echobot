var restify = require('restify');
var builder = require('botbuilder');

// Get secrets from server environment
var botConnectorOptions = { 
    appId: process.env.BOTFRAMEWORK_APPID, 
    appSecret: process.env.BOTFRAMEWORK_APPSECRET 
};

// Create bot
var bot = new builder.BotConnectorBot(botConnectorOptions);
bot.add('/', [
    function (session, args, next) {
        if (!session.userData.name || !session.userData.human) {
            session.beginDialog('/profile');
        }
        else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello ' + session.userData.name +", it is " + session.userData.human + " that you are a human.");
    }
]);
bot.add('/profile', [
    function (session) {
        builder.Prompts.text(session, "Hi, what is your name?");
    },
    function (session, nameResults) {
        session.userData.name = nameResults.response;
        builder.Prompts.confirm(session, "You are a human, right " + session.userData.name + "?");
    },
    function (session, humanResults) {
        // Not working atm...
        session.userData.human = humanResults.response;
        session.endDialog();
    }
]);

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
