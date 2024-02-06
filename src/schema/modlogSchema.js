const { model, Schema } = require('mongoose')

let modlog = new Schema({
    GuildID: String,
    ChannelID: String,
    Status: Boolean
});

module.exports = model("modlog", modlog);