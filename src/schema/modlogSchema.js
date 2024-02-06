const { model, Schema } = require('mongoose')

let modlog = new Schema({
    GuildID: String,
    ChannelID: String
});

module.exports = model("modlog", modlog);