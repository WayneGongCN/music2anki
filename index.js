const path = require('path')
const child_process = require('child_process')


const input = path.join(__dirname, 'Coldplay_Yellow.mp3')
const output = fileName => path.join(__dirname, 'output', fileName.replace(/[\.\?\'\!\,]/g, '').replace(/\s/ig, '_') + '.mp3')
const ffmpegPath = path.join(__dirname, './bin/ffmpeg.exe')


const offset = 2 * 1000
const lrcContent = `
[00:33.24]Look at the stars
[00:36.01]Look how they shine for you
[00:41.50]And everything you do
[00:47.24]Yeah, they were all yellow
[00:49.99]I came along
[00:52.49]I wrote a song for you
[00:58.00]And all the things you do
[01:03.74]And it was called "Yellow"
[01:09.25]So then I took my turn
[01:14.99]Oh, what a thing to have done
[01:20.24]And it was all yellow
[01:29.00]Your skin, oh yeah, your skin and bones
[01:34.50]Turn into something beautiful
[01:40.00]Do you know, you know I love you so?
[01:47.99]You know I love you so
[02:12.83]I swam across
[02:15.58]I jumped across for you
[02:21.08]Oh, what a thing to do
[02:26.83]'Cause you were all yellow
[02:29.58]I drew a line
[02:32.33]I drew a line for you
[02:37.83]Oh, what a thing to do
[02:43.58]And it was all yellow
[02:51.83]Your skin, oh yeah, your skin and bones
[02:57.33]Turn into something beautiful
[03:02.83]And you know
[03:05.33]For you, I'd bleed myself dry
[03:10.84]For you, I'd bleed myself dry
[03:35.19]It's true, look how they shine for you
[03:44.19]Look how they shine for you
[03:49.69]Look how they shine for
[03:55.19]Look how they shine for you
[04:00.69]Look how they shine for you
[04:06.20]Look how they shine
[04:08.94]Look at the stars
[04:11.69]Look how they shine for you
[04:17.44]And all the things that you do
`


const fmtTime = (timeStr, offset) => {
  let [m, s, S] = timeStr.split(/[:.]/ig);
  const timeStamp = (m * 60 * 1000) + (s * 1000) + (S * 10) + offset
  m = parseInt(timeStamp / (60 * 1000))
  s = parseInt((timeStamp - m * 60 * 1000) / 1000)
  S = ((timeStamp - (m * 60 * 1000) - (s * 1000))) / 10

  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${S ? '.' + S : ''}`
}



lrcContent.split('\n').filter(Boolean)
  .map((row, i) => {
    const [_, start, content] = /^\[(.*)\](.*)/ig.exec(row)
    return { start, content }
  })
  .filter(x => x.content)
  .map((row, idx, arr) => {
    let start = fmtTime(row.start, offset)
    let end = null
    if (idx < arr.length - 1) {
      end = fmtTime(arr[idx + 1].start, offset)
    }
    return { ...row, start, end }
  })
  .forEach((slice) => {
    const { start, end, content } = slice
    const cmd = `${ffmpegPath} -ss ${start} ${end ? `-to ${end}` : ''} -i ${input} -c:a copy ${output(content)}`
    try {
      child_process.execSync(cmd)
    } catch (e) { }
  })
