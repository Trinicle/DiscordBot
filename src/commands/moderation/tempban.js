const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const { schemaDateToDate, findActiveInfraction, updateInfraction, createTimedInfraction } = require('../../helpers/infractionhelpers.js');
const ms = require('ms')
const { infractionDMEmbed } = require('../../embeds/embeds.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setDescription('Tempbans user, old tempban will be overwritten')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`Tempbans user`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('duration')
            .setDescription('Duration for ban')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('reason of ban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),     
    async execute(client, interaction) {
        await interaction.deferReply();
        
        const { options, user, guild, guildId } = interaction;

        const target = options.getUser('user');
        const reason = options.getString('reason') || 'N/A';
        const duration = options.getString('duration') || 0;
        const time = ms(duration);

        const infraction = await findActiveInfraction(guildId, target.id, 'tempban');

        if(time < 0) {
            await interaction.editReply(`Duration must be non negative.`);
            return;
        } 

        if(!time) {
            await interaction.editReply(`Incorrect format, use s, m, d, y. Example: 1m`);
            return;
        }

        if(infraction) {
            await updateInfraction(guildId, infraction.ID)
        }

        try {
            const newInfraction = await createTimedInfraction(guildId, target, user, reason, time, 'tempban');

            const embed = infractionDMEmbed(guild, target, user, newInfraction, reason, 'DarkRed');

            await target.send({ embeds: [embed] }).then(() => {
                guild.members.ban(target.id, { reason: reason })
            }).catch(err => {
                return;
            });

            const embed2 = new EmbedBuilder()
                .setColor("DarkRed")
                .setDescription(`**${target.username}** has been tempbanned | ${reason}`)
                .setFooter({ text: `Case: ${infraction.ID} - ${schemaDateToDate(Date.now())}` });

            await interaction.editReply({ embeds: [embed2] });

            client.modlogs(guild, target, user, newInfraction, reason, "DarkRed")

            setTimeout(async () => {
                try {
                    const infraction = await findActiveInfraction(guildId, target.id, 'tempban');
                    if(infraction.ID == newInfraction.ID) {
                        updateInfraction(guildId, infraction.ID);
                        await guild.members.unban(target);
                    }
                } catch(err) {
                    console.log(err)
                    return;
                }
            }, time);
        } catch(err) {
            await interaction.editReply({ content: `Bot does not have permission to tempban **${target.tag}**`})
        }
        return;
    }
}