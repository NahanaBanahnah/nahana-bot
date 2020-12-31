const { client, Discord } = require('./discord')
const cron = require('node-cron')

const fs = require('fs')
const { DateTime } = require('luxon')

exports.startUp = () => {
        console.log(`Logged in as ${client.user.tag}`)
        exports.setCron() 
}
exports.rsp = (error, img, color = '#efb055') => {
        const msg = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor(error, img)
    return msg
}
 
exports.setCron = () => {
    cron.schedule('0 0 * * *', () => {
        const d = new Date()
        const thisMonth = d.getMonth() + 1
        const thisDate = d.getDate()
        
        exports.getBirthdays(thisMonth, thisDate)
    })        
}

exports.getBirthdays = (month, day) => {
    const general = client.channels.cache.get('528964687824551938')

    const buffer = fs.readFileSync('./db/bday.json')
    const birthdays = JSON.parse(buffer)

    const todayBDays = birthdays.filter(el => el.month === month && el.day === day)
    for(const el of todayBDays) {
        const user = client.users.cache.get(el.user)
        general.send(rsp(`Today (${month}-${day}) Is ${user.username} 's Birthday!!`, 'https://cdn.discordapp.com/emojis/582263922212732940.gif?v=1'))
        general.send(`Happy Birthday <@${user.id}>`)
    }
    
    let today = DateTime.local()
    const nextWeek = []
    for(let i = 1; i < 8; i++) {
        let next = today.plus({ days : i})
        let obj = {
            month : next.month,
            day: next.day,
            days_away: i,
        }
        nextWeek.push(obj)
    }

    const upcoming = birthdays.filter(el => {
        return nextWeek.some(d => {
            return el.day === d.day && el.month == d.month
        })
    })
    
    for(const el of upcoming) {
        const year = (el.month < today.month) ? today.plus({year: 1}).toFormat('yyyy') : today.toFormat('yyyy')
        const bday = DateTime.fromObject({month: el.month, day: el.day, year: year})
        const diff = bday.diff(today, ['days', 'hours']).toObject()
        const user = client.users.cache.get(el.user)
        let inDays = 'tomorrow!'
        
        if(diff.days > 0) { 
            inDays = `in ${diff.days} days!`
        }
        general.send(exports.rsp(`${user.username}'s birthday is ${inDays}`, 'https://cdn.discordapp.com/emojis/582263922212732940.gif?v=1'))
    }
}