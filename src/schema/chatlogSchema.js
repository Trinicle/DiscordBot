const { model, Schema } = require('mongoose')

let chatlog = new Schema({
    GuildID: String,
    ChannelID: String
});

module.exports = model("chatlog", chatlog);