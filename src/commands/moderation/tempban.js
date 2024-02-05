const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const { schemaDateToDate, findActiveInfraction, updateInfraction, createTimedInfraction } = require('../../helpers/helpers.js');
const ms = require('ms')

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
    async execute(interaction) {
        await interaction.deferReply();
        
        const { options, user, guild, guildId } = interaction;

        const target = options.getUser('user');
        const reason = options.getString('reason') || 'No reason given';
        const duration = options.getString('duration') || 0;
        const time = ms(duration);

        const infraction = await findActiveInfraction(guildId, target.id, 'tempban');

        console.log(infraction);

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
            const infractionID = await createTimedInfraction(guildId, target, user, reason, time, 'tempban');

            const dmrEmbed = new EmbedBuilder()
                .setColor("DarkerGrey")
                .setDescription(`You have been banned from ${guild.name} | ${reason}`)
                .setFooter({ text: `Case: ${infractionID} - ${schemaDateToDate(Date.now())}` })

            target.send({ embeds: [dmrEmbed] }).catch(err => {
                return;
            });

            guild.members.ban(target.id, { reason: reason })
            await interaction.editReply({ content: `**${target.tag}** was tempbanned | ${reason}` });


            const unbanInfraction = await findActiveInfraction(guildId, target.id, 'unban');
            const banInfraction = await findActiveInfraction(guildId, target.id, 'ban');

            setTimeout(async () => {
                try {
                    const infraction = await findActiveInfraction(guildId, target.id, 'tempban');
                    if(infraction.ID == infractionID) {
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