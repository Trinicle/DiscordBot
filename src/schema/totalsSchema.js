const { model, Schema } = require('mongoose')

let totalSchema = new Schema({
    GuildID: String,
    infractionTotal: {
        type: Number,
        default: 0
    },
    warnTotal: {
        type: Number,
        default: 0
    },
    banTotal: {
        type: Number,
        default: 0
    }
});

module.exports = model("total", totalSchema);

