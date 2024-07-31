require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'help',
        description: 'Help command',
    },
    {
        name: 'test',
        description: 'test command',
    },
    {
        name: 'register',
        description: 'Register yourself',
    },
    {
        name: 'leave',
        description: 'Leave the tournament',
    },
    {
        name: 'list',
        description: 'Print the registered users',
    },
    {
        name: 'start',
        description: '[admin only] Start the tournament',
    },
    {
        name: 'group',
        description: '[admin only] Create groups',
        options: [
            {
                name: 'number',
                description: 'Number of groups',
                type: ApplicationCommandOptionType.Number,
                required: true,
            }
        ]
    },
    {
        name: 'save',
        description: '[admin only] Save the register to a file'
    },
    {
        name: 'clear',
        description: '[admin only] Clear the register'
    }
]

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands, });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
