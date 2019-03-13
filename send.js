const nightmare = require('nightmare-plus')
require('nightmare-real-mouse')(nightmare)
const text = 'Terima kasih atas kepercayaan Anda terhadap Puskesmas Sibela.\n Jika ada kritik dan saran terhadap pelayanan kami, mohon dapat mengisi form berikut:\n https://goo.gl/forms/T6WsWFt8bGkmNPtM2\n'
module.exports = async number => {
  const page = nightmare({
    //electronPath: require('electron'),
    show: true,
    webPreference: {
      partition: 'persist: wa'
    }
  })

  try {
    await page.useragent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36")

    await page.goto(`https://web.whatsapp.com/send?phone=${number}&text=${text}`);

    let numNotExists, canSend

    while (!canSend && !numNotExists) {
      numNotExists = await page.evaluate(() => {
        let a = document.querySelector('#app > div > span:nth-child(2) > div > span > div > div > div > div > div > div._3lLzD')
        if (a) {
          if (a.textContent !== '') {
            return a.textContent
          }
        }
        return false
      })

      canSend = await page.exists("#main > footer > ._3pkkz.copyable-area button._35EW6")
    }

    if (numNotExists) {
      console.log(numNotExists)
    }

    if (canSend) {
      await page.wait(5000).click("#main > footer > ._3pkkz.copyable-area button._35EW6");
    }

    await page.wait(5000).end()

  } catch (err) {
    console.log(err)
  }
}
