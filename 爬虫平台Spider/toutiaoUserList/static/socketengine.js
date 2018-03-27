function SocketEngine() {

    var self = this;

    var socket = io.connect("http://ws.api.talkmoment.com:51179");

    socket.on('connect', function (msg) {
        console.log(msg);
    });


    socket.on('message', function (msg) {
        console.log(msg);
        self.onMessage(msg);
    });

    this.onMessage = function(msg) {

    };

    this.sendMessage = function(msg, to) {
        var message = {};
        message.room = room;
        message.uid = 9999;
        message.content = "helloworld";

        socket.emit("message", message)
    };
}