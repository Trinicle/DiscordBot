const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const totalSchema = require('../../schema/totalsSchema.js')
const infractionSchema = require('../../schema/infractionSchema.js');
const { schemaDateToDate } = require('../../helpers/helpers.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('warns user')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`warns user`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('reason for warn'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),     
    async execute(interaction) {
        await interaction.deferReply();

        const { options, guildId, user } = interaction;
        
        const target = options.getUser('user');
        const reason = options.getString('reason') || 'No reason given';

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

        infractionSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: target.tag }).then((data) => {
            if(!data) {
                data = new infractionSchema({ 
                    GuildID: guildId,
                    UserID: target.id,
                    UserTag: target.tag,
                    Content: [
                        {
                            Type: 'warn',
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
            } else {
                const warnContent = {
                    Type: 'warn',
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
            }
            data.save();
        }).catch((err) => {
            throw err
        })

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`You have been warned in ${interaction.guild.name} | ${reason}`)

        const embed2 = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`**${target.username}** has been warned | ${reason}`)
            .setFooter({ text: `Case: ${total} - ${schemaDateToDate(Date.now())}` })

        target.send({ embeds: [embed] }).catch(err => {
            return;
        });

        interaction.editReply({ embeds: [embed2] });
    }
}
