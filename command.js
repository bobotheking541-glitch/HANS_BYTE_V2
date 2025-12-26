var commands = [];

function cmd(info, func) {
    var data = info;
    data.function = func;
    if (data.react) {
        const originalFunc = data.function;
        data.function = async (conn, mek, m, context) => {
            try {
                await safeReact(data.react, mek, conn); // Automatically handle reactions
            } catch (e) {
                console.error("Reaction Error:", e);
            }
            await originalFunc(conn, mek, m, context);
        };
    }

    const originalFunc = data.function;
    data.function = async (conn, mek, m, context) => {
        const { reply } = context;
        context.reply = async (text, quoted) => {
            await safeReply(conn, mek.key.remoteJid, text, quoted || mek);
        };
        await originalFunc(conn, mek, m, context);
    };

    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!info.desc) info.desc = '';
    if (!data.fromMe) data.fromMe = false;
    if (!info.category) info.category = 'misc';
    if(!info.filename) data.filename = "Not Provided";
    commands.push(data);
    return data;
}
module.exports = {
    cmd,
    AddCommand:cmd,
    Function:cmd,
    Module:cmd,
    commands,
};
