const { Client, IntentsBitField } = require('discord.js');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();

const filePath = 'register.txt';

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
            fs.readFile(filePath, 'utf8', function (err, data) {
                if (err) {
                   console.error("Error reading file: ", err);
                   return;
                }

                const lines = data.split('\n');

                if (lines.includes(interaction.user.id)) {
                    interaction.reply(`<@${interaction.user.id}> is already registered`);
                } else {
                    lines.push(interaction.user.id);
                    interaction.reply('Registered!');
                }

                const newData = lines.join('\n');
                fs.writeFile(filePath, newData, 'utf8', function (err) {
                    if (err) {
                        console.error("Error writing file: ", err);
                        return;
                    }
                });
            });
            break;
        case 'leave':
            fs.readFile(filePath, 'utf8', function (err, data) {
                if (err) {
                   console.error("Error reading file: ", err);
                   return;
                }

                const lines = data.split('\n');

                if (lines.includes(interaction.user.id)) {
                    lines.splice(lines.indexOf(interaction.user.id), 1);
                    interaction.reply(`@${interaction.user.id} removed`);
                } else {
                    interaction.reply(`@${interaction.user.id} is not registered`);
                }

                const newData = lines.join('\n');
                fs.writeFile(filePath, newData, 'utf8', function (err) {
                    if (err) {
                        console.error("Error writing file: ", err);
                        return;
                    }
                });
            });

            break;
        case 'list':
            fs.readFile(filePath, 'utf8', function (err, data) {
                if (err) { console.error("Error reading file: ", err); }
                if (!data) { response = 'No users registered'; }
                fs.readFile(filePath, 'utf8', function (err, data) {
                    if (err) {
                        console.error("Error reading file: ", err);
                        return;
                    } 
                    let response = 'The registered users are:\n';
                    const lines = data.split('\n');
                    const promises = [];

                    for (const line of lines) {
                        if (line) {
                            const promise = getUser(line).then((user) => {
                                response += `- ${user.globalName}\n`;
                            });
                            promises.push(promise);
                        }
                    }
                    Promise.all(promises).then(() => {
                        interaction.reply(response);
                    })
                })
            });
            break;
        case 'start':
            if (!interaction.memberPermissions.has('ADMINISTRATOR')) {
                interaction.reply('Only admins can start the tournament');
                return;
            }
            fs.readFile(filePath, 'utf8', function (err, data) {
                if (err) { console.error("Error reading file: ", err); }
                if (!data) { data = 'No users registered'; }
                else {
                    let response = '# ATTENTION\n## The Tournament is starting\n';
                    const lines = data.split('\n');
                    const promises = [];

                    for (const line of lines) {
                        if (line) {
                            const promise = getUser(line).then((user) => {
                                response += `<@${user.id}>\n`;
                            });
                            promises.push(promise);
                        }
                    }
                    Promise.all(promises).then(() => {
                        interaction.reply(response);
                    })
                }
            });
            break;
        case 'group':
            if (!interaction.memberPermissions.has('ADMINISTRATOR')) {
                interaction.reply('Only admins can generate groups');
                return;
            }
            const number = interaction.options.get('number').value;
            fs.readFile(filePath, 'utf8', function (err, data) {
                if (err) { console.error("Error reading file: ", err); }
                if (!data) { data = 'No users registered'; }
                else {
                    let response = '';
                    let lines = data.split('\n');
                    lines = shuffle(lines);
                    const promises = [];

                    let i = 0;
                    for (const line of lines) {
                        if (line) {
                            const promise = getUser(line).then((user) => {
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
            });
            break;
    }
});

client.login(process.env.TOKEN);
