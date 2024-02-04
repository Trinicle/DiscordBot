const infractionSchema = require('../schema/infractionSchema.js');
const totalSchema = require('../schema/totalsSchema.js')

exports.schemaDateToDate = (date) => {
    const today = new Date(date);
    return today.toLocaleDateString();
}

exports.findMute = async (guildId, target) => {
    const infraction = await infractionSchema.findOne({ 
        GuildID: guildId, 
        UserID: target.id, 
        Content: {
            $elemMatch: { Timeout: true }
        }
    },
    { 'Content.$': 1 })
    if(infraction) {
        if(infraction.Content.length != 1) {
            console.log('err')
            return null;
        }
    } else {
        console.log('no mute active')
        return null;
    }
    return infraction.Content[0]
}

exports.updateMute = async (guildId, infraction) => {
    const mute = await infractionSchema.findOneAndUpdate({
        GuildID: guildId,
        'Content.ID': infraction.ID
    },
    {
        $set: {
            'Content.$.Timeout': false
        }
    },
    { returnDocument: "after" });
    return mute;
}

exports.mute = async (guildId, target, user, reason, time) => {
    const total = await infractionSchema.findOne({ GuildID: guildId, UserID: target.id }).then(async (data) => {
        const total = await totalSchema.findOne({ GuildID: guildId }).then((data) => {
            let total = 0;
            if(!data) {
                data = new totalSchema({
                    GuildID: guildId
                })
            } else {
                data.infractionTotal += 1;
                data.warnTotal += 1;
                total = data.infractionTotal
            }
            data.save();
            return total;
        })

        if(!data) {
            data = new infractionSchema({ 
                GuildID: guildId,
                UserID: target.id,
                UserTag: target.user.tag,
                Content: [
                    {
                        Type: 'mute',
                        ExecuterId: user.id,
                        ExecuterTag: user.tag,
                        Duration: time,
                        Timeout: true,
                        ResolvedId: null,
                        ResolvedTag: null,
                        Reason: reason,
                        ID: total,
                        Resolved: false,
                        TimeStamp: Date.now()
                    }
                ],
            });
        } else {
            const warnContent = {
                Type: 'mute',
                ExecuterId: user.id,
                ExecuterTag: user.tag,
                Duration: time,
                Timeout: true,
                ResolvedId: null,
                ResolvedTag: null,
                Reason: reason,
                ID: total,
                Resolved: false,
                TimeStamp: Date.now()
            }
            data.Content.push(warnContent);
        }
        data.save();
        return total;
    }).catch((err) => {
        console.log(err);;
        return null;
    })

    return total;
}