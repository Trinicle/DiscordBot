const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const modlogSchema = require('../../schema/modlogSchema.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setmodlogs')
        .setDescription('Sets the mod log to channel')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('Channel name')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),     
    async execute(client, interaction) {
        await interaction.deferReply();

        const { options, guildId } = interaction;

        const channel = options.getChannel('channel');

        if(channel.type == 0) {
            const data = await modlogSchema.findOne({ GuildID: guildId }).then((data) => {
                if(!data) {
                    data = new modlogSchema({
                        GuildID: guildId,
                        ChannelID: channel.id
                    })
                } else{
                    data.ChannelID = channel.id
                }
                data.save();
            })
            await interaction.editReply({ content: `Modlogs channel has been set to <#${channel.id}>` });
        } else {
            await interaction.editReply({ content: 'Wrong channel type' });
        }

    }
}