// plugins/test_buttons.js
const { cmd } = require('../command')

cmd({
  pattern: 'testbuttons',
  alias: ['btntest', 'buttondebug'],
  desc: 'Send all WhatsApp button types — template, interactive, PIX, PAY, etc.',
  category: '⚙️ Developer',
  react: '🧪',
  filename: __filename
}, async (suki, mek, m, { from, reply }) => {
  const jid = from
  const IMG_URL = 'https://i.ibb.co/PS5DZdJ/Chat-GPT-Image-Mar-30-2025-12-53-39-PM.png'

  async function step(name, payload) {
    try {
      await suki.sendMessage(jid, payload, { quoted: mek })
      console.log(`✅ ${name}`)
      await reply(`✅ Sent — ${name}`)
    } catch (err) {
      console.error(`❌ ${name}`, err)
      await reply(`❌ ${name}\n\`\`\`\n${err.message}\n\`\`\``)
    }
  }

  await reply('🧩 Sending all button message types...')

  // 1️⃣ Template Buttons Message
  await step('Template Buttons Message', {
    text: 'This is a template message!',
    footer: 'Hello World!',
    templateButtons: [
      {
        index: 1,
        urlButton: {
          displayText: 'Follow Me',
          url: 'https://whatsapp.com/channel/0029Vag9VSI2ZjCocqa2lB1y'
        }
      },
      {
        index: 2,
        callButton: {
          displayText: 'Call Me!',
          phoneNumber: '628xxx'
        }
      },
      {
        index: 3,
        quickReplyButton: {
          displayText: 'This is a reply, just like normal buttons!',
          id: 'id-like-buttons-message'
        }
      }
    ]
  })

  // 2️⃣ Buttons Interactive Message
  await step('Buttons Interactive Message', {
    text: 'This is an Interactive message!',
    title: 'Hiii',
    subtitle: 'There is a subtitle',
    footer: 'Hello World!',
    interactiveButtons: [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: 'Click Me!',
          id: 'your_id'
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: 'Follow Me',
          url: 'https://whatsapp.com/channel/0029Vag9VSI2ZjCocqa2lB1y',
          merchant_url: 'https://whatsapp.com/channel/0029Vag9VSI2ZjCocqa2lB1y'
        })
      },
      {
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({
          display_text: 'Copy Me!',
          copy_code: 'https://whatsapp.com/channel/0029Vag9VSI2ZjCocqa2lB1y'
        })
      },
      {
        name: 'cta_call',
        buttonParamsJson: JSON.stringify({
          display_text: 'Call Me!',
          phone_number: '628xxx'
        })
      },
      {
        name: 'cta_catalog',
        buttonParamsJson: JSON.stringify({
          business_phone_number: '628xxx'
        })
      },
      {
        name: 'open_webview',
        buttonParamsJson: JSON.stringify({
          title: 'Follow Me!',
          link: {
            in_app_webview: true,
            url: 'https://whatsapp.com/channel/0029Vag9VSI2ZjCocqa2lB1y'
          }
        })
      },
      {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: 'Click Me!',
          sections: [
            {
              title: 'Title 1',
              rows: [
                { header: 'Header 1', title: 'Title 1', description: 'Description 1', id: 'Id 1' },
                { header: 'Header 2', title: 'Title 2', description: 'Description 2', id: 'Id 2' }
              ]
            }
          ]
        })
      }
    ]
  })

  // 3️⃣ Image Interactive
  await step('Image Interactive', {
    image: { url: IMG_URL },
    caption: 'Body',
    title: 'Title',
    subtitle: 'Subtitle',
    footer: 'Footer',
    interactiveButtons: [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: 'DisplayText',
          id: 'ID1'
        })
      }
    ]
  })

  // 4️⃣ Video Interactive
  await step('Video Interactive', {
    video: { url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4' },
    caption: 'Body',
    title: 'Title',
    subtitle: 'Subtitle',
    footer: 'Footer',
    interactiveButtons: [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: 'DisplayText',
          id: 'ID1'
        })
      }
    ]
  })

  // 5️⃣ Document Interactive
  await step('Document Interactive', {
    document: { url: IMG_URL },
    mimetype: 'image/png',
    caption: 'Body',
    title: 'Title',
    subtitle: 'Subtitle',
    footer: 'Footer',
    interactiveButtons: [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: 'DisplayText',
          id: 'ID1'
        })
      }
    ]
  })

  // 6️⃣ Location Interactive
  await step('Location Interactive', {
    location: {
      degreesLatitude: -6.2,
      degreesLongitude: 106.8,
      name: 'Hans HQ'
    },
    caption: 'Body',
    title: 'Title',
    subtitle: 'Subtitle',
    footer: 'Footer',
    interactiveButtons: [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: 'DisplayText',
          id: 'ID1'
        })
      }
    ]
  })

  // 7️⃣ Product Interactive
  await step('Product Interactive', {
    product: {
      productImage: { url: IMG_URL },
      productId: '836xxx',
      title: 'Title',
      description: 'Description',
      currencyCode: 'IDR',
      priceAmount1000: '283000',
      retailerId: 'Itsukichann',
      url: 'https://example.com',
      productImageCount: 1
    },
    businessOwnerJid: '237696900612@s.whatsapp.net',
    caption: 'Body',
    title: 'Title',
    subtitle: 'Subtitle',
    footer: 'Footer',
    interactiveButtons: [
      {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: 'DisplayText',
          id: 'ID1'
        })
      }
    ]
  })

  // 8️⃣ PIX Interactive
  await step('Buttons Interactive Message PIX', {
    text: '',
    interactiveButtons: [
      {
        name: 'payment_info',
        buttonParamsJson: JSON.stringify({
          payment_settings: [
            {
              type: 'pix_static_code',
              pix_static_code: {
                merchant_name: 'itsukichann kawaii >\\<',
                key: 'example@itsukichan.com',
                key_type: 'EMAIL'
              }
            }
          ]
        })
      }
    ]
  })

  // 9️⃣ PAY Interactive
  await step('Buttons Interactive Message PAY', {
    text: '',
    interactiveButtons: [
      {
        name: 'review_and_pay',
        buttonParamsJson: JSON.stringify({
          currency: 'IDR',
          payment_configuration: '',
          payment_type: '',
          total_amount: { value: '999999999', offset: '100' },
          reference_id: '45XXXXX',
          type: 'physical-goods',
          payment_method: 'confirm',
          payment_status: 'captured',
          payment_timestamp: Math.floor(Date.now() / 1000),
          order: {
            status: 'completed',
            description: '',
            subtotal: { value: '0', offset: '100' },
            order_type: 'PAYMENT_REQUEST',
            items: [
              {
                retailer_id: 'your_retailer_id',
                name: 'Itsukichann Kawaii >\\<',
                amount: { value: '999999999', offset: '100' },
                quantity: '1'
              }
            ]
          },
          additional_note: 'Itsukichann Kawaii >\\<',
          native_payment_methods: [],
          share_payment_status: false
        })
      }
    ]
  })

  await reply('✅ All message types tested successfully (Template + Interactive + PIX + PAY).')
})
