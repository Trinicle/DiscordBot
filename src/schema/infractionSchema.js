const { model, Schema } = require('mongoose')

let infractionSchema = new Schema({
    GuildID: String,
    UserID: String,
    Content: Array
});

module.exports = model("infraction", infractionSchema);
