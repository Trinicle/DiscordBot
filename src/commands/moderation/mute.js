const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const { schemaDateToDate, findActiveInfraction, updateInfraction, createTimedInfraction } = require('../../helpers/helpers.js');
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute member, old mute will be overwritten')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`mutes the member`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('duration')
            .setDescription('Duration of mute'))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Reason for mute'))
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
                await interaction.editReply(`Mute role does not exist.`)
                return;
            }

            if(time < 0) {
                await interaction.editReply(`Duration must be non negative.`)
                return;
            } 

            if(!time) {
                await interaction.editReply(`Incorrect format, use s, m, d, y. Example: 1m`);
                return;
            } 
            
            const role = guild.roles.cache.find(role => role.id == roleid);

            let infraction = await findActiveInfraction(guildId, target.id, 'mute');

            if(infraction) {
                await updateInfraction(guildId, infraction.ID);
            } else {
                await target.roles.add(role).catch(async (err) => {
                    console.log(err);
                    await interaction.editReply(`Mute role is higher than bot role.`)
                    return null;
                })
            }

            const infractionID = await createTimedInfraction(guildId, target, user, reason, time, 'mute');

            setTimeout(async () => {
                try {
                    const infraction = await findActiveInfraction(guildId, target.id, 'mute');
                    if(infraction.ID == infractionID) {
                        updateInfraction(guildId, infraction.ID)
                        await target.roles.remove(role);

                        const dmrEmbed = new EmbedBuilder()
                            .setColor("DarkerGrey")
                            .setDescription(`You are no longer muted in ${guild.name}`)
                            .setFooter({ text: `Case: ${infractionID} - ${schemaDateToDate(Date.now())}` })

                            target.send({ embeds: [dmrEmbed] }).catch(err => {
                                return;
                            });
                    }
                } catch(err) {
                    console.log(err)
                    await interaction.editReply(`Mute role is higher than bot role.`)
                    return;
                }
            }, time);

            const muteEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`You have been muted in ${guild.name} | ${reason}`);

            const dmEmbed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`**${target.user.tag}** has been muted | ${reason}`)
                .setFooter({ text: `Case: ${infractionID} - ${schemaDateToDate(Date.now())}` });
    
            target.send({ embeds: [muteEmbed] }).catch(err => {
                return;
            });
    
            interaction.editReply({ embeds: [dmEmbed] });
            return;
        }
}