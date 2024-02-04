const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const totalSchema = require('../../schema/totalsSchema.js')
const infractionSchema = require('../../schema/infractionSchema.js');
const { schemaDateToDate } = require('../../helpers/helpers.js');
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute member')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`mutes the member`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('duration')
            .setDescription('duration of mute ('))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('reason for mute'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),     
        async execute(interaction) {
            await interaction.deferReply();

            let roleid = '1203206583916699718';     //temporary while there is no schema
    
            const { options, guildId, user, guild } = interaction;
            
            const target = options.getMember('user');
            const reason = options.getString('reason') || 'No reason given';
            const duration = options.getString('duration') || 0;
            const time = ms(duration)

            if(!target) {
                const inputTarget = options.getUser('user')
                await interaction.editReply(`<@!${inputTarget.id}> is not in the server`);
                return;
            }

            if(!guild.roles.cache.get(roleid)) {    
                await interaction.editReply(`Mute role does not exist`)
                return;
            }

            if(time < 0) {
                await interaction.editReply(`duration must be non negative`)
                return;
            } 

            if(!time) {
                await interaction.editReply(`incorrect format, use s, m, d, y. Example: 1m`);
                return;
            }

            const role = guild.roles.cache.find(role => role.id == roleid);

            try {
                await target.roles.add(role);
            } catch(err) {
                console.log(err)
                await interaction.editReply(`Mute role is higher than bot role`)
                return;
            }
    
            let total = await totalSchema.findOne({ GuildID: guildId }).then((data) => {
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
    
            infractionSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: target.user.tag }).then((data) => {
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
            }).catch((err) => {
                throw err
            })
    
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`You have been muted in ${interaction.guild.name} | ${reason}`)
    
            const embed2 = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`**${target.username}** has been muted | ${reason}`)
                .setFooter({ text: `Case: ${total} - ${schemaDateToDate(Date.now())}` })
    
            target.send({ embeds: [embed] }).catch(err => {
                return;
            });
    
            interaction.editReply({ embeds: [embed2] });

            setTimeout(async () => {
                try {
                    await target.roles.remove(role);
                } catch(err) {
                    console.log(err)
                    await interaction.editReply(`Mute role is higher than bot role`)
                    return;
                }
            }, time)
        }
}