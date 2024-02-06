const { model, Schema } = require('mongoose')

let chatlog = new Schema({
    GuildID: String,
    ChannelID: String,
    Status: Boolean
});

module.exports = model("chatlog", chatlog);