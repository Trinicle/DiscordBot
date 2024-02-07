const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const chatlogSchema = require('../../schema/chatlogSchema.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchatlogs')
        .setDescription('Sets the chat log to channel')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('Channel name'))
        .addBooleanOption(option => option
            .setName('enabled')
            .setDescription('Toggle logging on or off'))
        .addStringOption(option => option
            .setName('ignore')
            .setDescription('Ignores channel and/or category'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),     
    async execute(client, interaction) {
        await interaction.deferReply();

        const { options, guildId, guild } = interaction;

        const channel = options.getChannel('channel');
        const option = options.getBoolean('enabled');
        let ignorechannelsList = options.getString('ignore');

        if(channel && channel.type != 0) {
            await interaction.editReply({ content: 'Wrong channel type' });
            return;
        }

        let setOption = false;
        let setChannel = false;
        let setIgnore = false;

        if(ignorechannelsList) {
            ignorechannelsList = ignorechannelsList.split(' ');
            const newIgnorechannelList = []

            for(const ignorechannel of ignorechannelsList) {
                const tempchannel = ignorechannel.replace(/^<#|>$/g, '')
                let ischannel = guild.channels.cache.get(tempchannel);

                if(!ischannel || (ischannel.type != 4 && ischannel.type != 0)) {
                    await interaction.editReply({ content: `${ignorechannel} is not a valid channel`});
                    return;
                }

                if(ischannel.type == 4) {
                    const channelsInCategory = guild.channels.cache.filter(ch => ch.parentId === ischannel.id && ch.type === 0)
                    channelsInCategory.map(ch => newIgnorechannelList.push(ch.id));
                } else {
                    newIgnorechannelList.push(ischannel.id);
                }
            }
            const filtered = [...new Set(newIgnorechannelList)] 
            await chatlogSchema.findOne({ GuildID: guildId }).then((data) => {
                if(!data) {
                    data = new chatlogSchema({
                        GuildID: guildId,
                        ChannelID: '',
                        Status: true,
                        Ignore: filtered
                    });
                } else {
                    const newArr = [...data.Ignore, ...filtered]
                    data.Ignore = [...new Set(newArr)];   
                }
                data.save();
                setIgnore = !setIgnore;
            })
        }

        if(option || option == false) {
            await chatlogSchema.findOne({ GuildID: guildId }).then((data) => {
                if(!data) {
                    data = new chatlogSchema({
                        GuildID: guildId,
                        ChannelID: '',
                        Status: option,
                        Ignore: []
                    });
                } else{
                    data.Status = option;
                }
                data.save();
                setOption = !setOption;
            })
        }

        if(channel) {
            await chatlogSchema.findOne({ GuildID: guildId }).then((data) => {
                if(!data) {
                    data = new chatlogSchema({
                        GuildID: guildId,
                        ChannelID: channel.id,
                        Status: true,
                        Ignore: []
                    });
                } else{
                    data.ChannelID = channel.id
                }
                data.save();
                setChannel = !setChannel;
            })
       }

        if(!setChannel && !setOption && !setIgnore) {
            await interaction.editReply({
                embeds: [await modlogEmbed(guildId)]
            })
        } else {
            await interaction.editReply({
                content: `Successfully updated chatlogs`
            })
        }
    }
}

modlogEmbed = async (guildId) => {
    let data = await chatlogSchema.findOne({ GuildID: guildId });

    const ignorechannel = (data) => {
        let temp = ''
        for(const ignore of data.Ignore) {
            temp += `<#${ignore}> `;
        }
        return temp;
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Message Logging` })
        .setDescription(`Configure message logging for your sever`)
        .addFields({ 
            name: `》**Command Options**`, 
            value: `**channel [TEXT_CHANNEL]**\nSets the chat log to channel\n
                    **enabled [BOOLEAN]** (default value: \`true\`)\nToggles logging on or off\n
                    **ignore [STRING]** (default value: \`null\`)\nIgnores list of channels\n__Can use category__`
            },
            {
                name: '\u2002',
                value: '\u2002',
            },
            {
                name: `》**Status**`,
                value: `${data ? data.Status == true ? 'Enabled' : 'Disabled' : 'Disabled'}`,
                inline: true
            },
            {
                name: `》**Channel**`,
                value: `${data ? data.ChannelID ? `<#${data.ChannelID}>` : '**N/A**' : '**N/A**'}`,
                inline: true
            },
            {
                name: `》**Ignored Channels**`,
                value: `${data ? data.Ignore ? `${ignorechannel(data)}` : '**N/A**' : '**N/A**'}`
            }
            )
    return embed;
}