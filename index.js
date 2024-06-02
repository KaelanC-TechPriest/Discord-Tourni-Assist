const { Client, IntentsBitField } = require('discord.js');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();

const filePath = 'register.txt';
const register = [];

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

async function getUser(userId) {
    try {
        // Fetch the user by their ID
        const user = await client.users.fetch(userId);
        // Log or return the global name (username)
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

function randomSort() {
    return Math.random() - 0.5;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
        case 'test':

            const userID = "542882188690194442";
            getUser(userID).then((user) => {
                interaction.reply(`Global name: <@${user.id}>`);
            });
            break;

        case 'help':

            interaction.reply('Commands:\n - register\t register for the tournament\n - leave\t leave the tournament\n - list\t list the registered users');
            break;

        case 'register':

            if (register.includes(interaction.user.id)) {
                interaction.reply(`<@${interaction.user.id}> is already registered`);
            } else {
                register.push(interaction.user.id);
                interaction.reply('Registered!');
            }
            break;

        case 'leave':

            if (register.includes(interaction.user.id)) {
                register.splice(register.indexOf(interaction.user.id), 1);
                interaction.reply(`@${interaction.user.id} removed`);
            } else {
                interaction.reply(`@${interaction.user.id} is not registered`);
            }

            break;
        case 'list':

            let response = 'The registered users are:\n';
            if (register.length === 0) { interaction.reply('No users registered'); }
            else {

                const promises = [];
                for (const userID of register) {
                    if (userID) {
                        const promise = getUser(userID).then((user) => {
                            response += `- ${user.globalName}\n`;
                        });
                        promises.push(promise);
                    }
                }

                Promise.all(promises).then(() => {
                    interaction.reply(response);
                })
            }
            
            break;

        case 'start':

            if (!interaction.memberPermissions.has('ADMINISTRATOR')) {
                interaction.reply('Only admins can start the tournament');
                return;
            }

            if (register.length === 0) { interaction.reply('No users registered'); }
            else {
                let response = '# ATTENTION\n## The Tournament is starting\n';
                const promises = [];

                for (const userID of register) {
                    if (userID) {
                        const promise = getUser(userID).then((user) => {
                            response += `<@${user.id}>\n`;
                        });
                        promises.push(promise);
                    }
                }
                Promise.all(promises).then(() => {
                    interaction.reply(response);
                });
            }

            break;

        case 'group':
            if (!interaction.memberPermissions.has('ADMINISTRATOR')) {
                interaction.reply('Only admins can generate groups');
                return;
            }
            const number = interaction.options.get('number').value;

            if (register.length === 0) { interaction.reply('No users registered'); }
            else {
                let response = '';
                let randomizedUserIDs = shuffle(register);
                const promises = [];

                let i = 0;
                for (const userID of randomizedUserIDs) {
                    if (userID) {
                        const promise = getUser(userID).then((user) => {
                            if (i % number === 0) {
                                response += `### Group ${Math.ceil((i + 1) / number)}\n`;
                            }
                            response += `${i % number + 1}. <${user.id}>\n`;
                            i++;
                        });
                        promises.push(promise);
                    }
                }

                Promise.all(promises).then(() => {
                    interaction.reply(response);
                })
            }

            break;

        case 'save':

            if (!interaction.memberPermissions.has('ADMINISTRATOR')) {
                interaction.reply('Only admins can save the register');
                return;
            }

            let data = '';
            for (const userID of register) {
                if (userID) {
                    data += `${userID}\n`;
                }
            }

            fs.writeFileSync(filePath, data);
            interaction.reply('Register saved');

            break;

        case 'clear':

            if (!interaction.memberPermissions.has('ADMINISTRATOR')) {
                interaction.reply('Only admins can clear the register');
                return;
            }

            register.splice(0, register.length);
            fs.writeFileSync(filePath, '');
            interaction.reply('Register cleared');

            break;
    }
});

// load previous register, if available
if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    register.push(...data.split('\n'));
}

client.login(process.env.TOKEN);

console.log("Online...");
