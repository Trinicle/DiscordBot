const { model, Schema } = require('mongoose')

let chatlog = new Schema({
    GuildID: String,
    ChannelID: String,
    Status: Boolean,
    Ignore: Array
});

module.exports = model("chatlog", chatlog);