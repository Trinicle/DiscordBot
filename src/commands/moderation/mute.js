const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const totalSchema = require('../../schema/totalsSchema.js')
const infractionSchema = require('../../schema/infractionSchema.js');
const { schemaDateToDate, findMute, updateMute, mute } = require('../../helpers/helpers.js');
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
            let total = null;

            if(target.roles.cache.find(role => role.id == roleid)) {
                total = await updateToNewMute(guildId, target, user, reason, time)
            } else {
                await target.roles.add(role).catch((err) => {
                    console.log(err);
                    return null;
                })
                total = await mute(guildId, target, user, reason, time);
            }


            setTimeout(async () => {
                try {
                    const infraction = await findMute(guildId, target);
                    if(infraction) {
                        updateMute(guildId, infraction)
                        await target.roles.remove(role);
                        await interaction.followUp({ content: `<@!${target.id}> is no longer muted \`[case-${infraction.ID}]\`` })
                    }
                } catch(err) {
                    console.log(err)
                    await interaction.editReply(`Mute role is higher than bot role`)
                    return;
                }
            }, time);

            if(total && total != 0) {
                const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`You have been muted in ${interaction.guild.name} | ${reason}`);
    
                const embed2 = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`**${target.user.tag}** has been muted | ${reason}`)
                    .setFooter({ text: `Case: ${total} - ${schemaDateToDate(Date.now())}` });
        
                target.send({ embeds: [embed] }).catch(err => {
                    return;
                });
        
                interaction.editReply({ embeds: [embed2] });

                return;
            } else {
                await interaction.editReply(`Mute role is higher than bot role`)
                return;
            }
        }
}

updateToNewMute = async (guildId, target, user, reason, time) => {
    const infraction = await findMute(guildId, target);

    const updatedMute = await updateMute(guildId, infraction);

    if(!updatedMute) {
        return null;
    }

    return await mute(guildId, target, user, reason, time);
}