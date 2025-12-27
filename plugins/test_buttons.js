// plugins/test_buttons.js
const { cmd } = require('../command')
const {
  generateWAMessageFromContent,
  proto
} = require('@whiskeysockets/baileys')

cmd({
  pattern: 'testbuttons',
  alias: ['btntest'],
  desc: 'Test native WhatsApp interactive buttons (Baileys)',
  category: '⚙️ Developer',
  react: '🧪',
  filename: __filename
}, async (conn, mek, m, { from }) => {

  const jid = from

  // Build native interactive message
  const msg = generateWAMessageFromContent(
    jid,
    {
      interactiveMessage: proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({
          text: '🧪 *Baileys Native Buttons Test*\nChoose an option below:'
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
          text: 'Powered by Hans Byte V2'
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
          buttons: [
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '🔥 Button One',
                id: 'BTN_ONE'
              })
            },
            {
              name: 'cta_copy',
              buttonParamsJson: JSON.stringify({
                display_text: '📋 Copy Text',
                copy_code: 'HELLO_FROM_HANS'
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '🌐 Visit Repo',
                url: 'https://github.com'
              })
            }
          ]
        })
      })
    },
    {}
  )

  // Relay message (THIS is the magic)
  await conn.relayMessage(
    jid,
    msg.message,
    { messageId: msg.key.id }
  )

})
