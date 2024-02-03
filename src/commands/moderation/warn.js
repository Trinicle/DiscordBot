const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const warningSchema = require('../../schema/warnSchema.js');

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
        const reason = options.getString('reason') || 'No reason given'

        warningSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: target.tag }).then((data) => {
            if(!data) {
                data = new warningSchema({ 
                    GuildID: guildId,
                    UserID: target.id,
                    UserTag: target.tag,
                    Content: [
                        {
                            ExecuterId: user.id,
                            ExecuterTag: user.tag,
                            Reason: reason
                        }
                    ],
                });
            } else {
                const warnContent = {
                    ExecuterId: user.id,
                    ExecuterTag: user.tag,
                    Reason: reason
                }
                data.Content.push(warnContent);
            }
            data.save();
        }).catch((err) => {
            throw err
        })

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`You have been warned in ${interaction.guild.name} | ${reason}`)

        const embed2 = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`${target.username} has been warned | ${reason}`)

        target.send({ embeds: [embed] }).catch(err => {
            return;
        });

        interaction.editReply({ embeds: [embed2] });
    }
}

// TODO: Change .addStringOption to .addUserOption for moderation commands