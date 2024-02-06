const infractionSchema = require('../schema/infractionSchema.js');
const totalSchema = require('../schema/totalsSchema.js')

exports.schemaDateToDate = (date) => {
    const today = new Date(date);
    return today.toLocaleDateString();
}

exports.findActiveInfraction = async (guildId, targetId, type) => {
    const infraction = await infractionSchema.findOne({ 
        GuildID: guildId, 
        UserID: targetId,
        Content: {
            $elemMatch: { 
                Active: true,
                Type: type
            }
        }
    },
    { 'Content.$': 1 })
    if(infraction) {
        if(infraction.Content.length != 1) {
            console.log(`More than 1 infraction if type ${type} is active`);
            return null;
        }
    } else {
        console.log(`No infraction of type ${type} is active`);
        return null;
    }
    return infraction.Content[0]
}

exports.findInfractionByID = async (guildId, Id) => {
    const infraction = await infractionSchema.findOne({ 
        GuildID: guildId, 
        Content: {
            $elemMatch: { 
                ID: Id,
            }
        }
    },
    { 'Content.$': 1 })
    if(infraction) {
        if(infraction.Content.length != 1) {
            console.log(`More than 1 infraction if type ${type} is active`);
            return null;
        }
    } else {
        console.log(`No infraction of type ${type} is active`);
        return null;
    }
    return infraction.Content[0]
}

exports.updateInfraction = async (guildId, Id) => {
    if(!Id) {
        console.log(`Infraction is null`);
        return null;
    }
    const newInfraction = await infractionSchema.findOneAndUpdate({
        GuildID: guildId,
        'Content.ID': Id,
    },
    {
        $set: {
            'Content.$.Active': false
        }
    },
    { returnDocument: "after" });
    return newInfraction;
}

exports.resolveInfraction = async (guildId, Id, user) => {
    if(!Id) {
        console.log(`Infraction ID is null`);
        return null;
    }
    const newInfraction = await infractionSchema.findOneAndUpdate({
        GuildID: guildId,
        'Content.ID': Id,
    },
    {
        $set: {
            'Content.$.ResolvedId': user.id,
            'Content.$.ResolvedTag': user.tag,
            'Content.$.Resolved': true
        }
    },
    { returnDocument: "after" })
    return newInfraction
}

exports.createInfraction = async (guildId, target, user, reason, type) => {
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
                Content: [
                    {
                        Type: type,
                        ExecuterId: user.id,
                        ExecuterTag: user.tag,
                        ResolvedId: null,
                        ResolvedTag: null,
                        Reason: reason,
                        ID: total,
                        Resolved: false,
                        TimeStamp: Date.now()
                    }
                ],
            });
            data.save();
            return data.Content[0]
        } else {
            const warnContent = {
                Type: type,
                ExecuterId: user.id,
                ExecuterTag: user.tag,
                ResolvedId: null,
                ResolvedTag: null,
                Reason: reason,
                ID: total,
                Resolved: false,
                TimeStamp: Date.now()
            }
            data.Content.push(warnContent);
            data.save();
            return warnContent
        }
    }).catch((err) => {
        console.log(err)
        interaction.editReply({ content: `Error` })
        return;
    })
    return total;
}

exports.createTimedInfraction = async (guildId, target, user, reason, time, type) => {
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
                Content: [
                    {
                        Type: type,
                        ExecuterId: user.id,
                        ExecuterTag: user.tag,
                        Duration: time,
                        Active: true,
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
                Type: type,
                ExecuterId: user.id,
                ExecuterTag: user.tag,
                Duration: time,
                Active: true,
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