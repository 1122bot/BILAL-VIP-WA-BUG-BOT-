/*

# Base By TdX Division
# Owner ? : t.me/bilal_babar_982
!- do not delete this credit

*/

// Thanks to davizinmaker

const chalk = require('chalk')
const cfonts = require("cfonts")
const spin = require("spinnies")

const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

const bgcolor = (text, bgcolor) => {
	return !bgcolor ? chalk.green(text) : chalk.bgKeyword(bgcolor)(text)
}

//const spinnerConfig = { 'interval': 500, 'frames': ['⌛','⏳','⌛','⏳','⌛','⏳','⌛','⏳','⌛','⏳','⌛','⏳', "〽️"] }
const spinnerConfig = { 'interval': 300, 'frames': [' 🕐',' 🕑',' 🕒',' 🕓',' 🕔', ' 🕕', ' 🕖', ' 🕗',' 🕘',' 🕙',' 🕚',' 🕛', " 〽️"] }

let globalSpinnerInstance

const spinnerInstance = (disableSpins = false) => {
 if (!globalSpinnerInstance)
  globalSpinnerInstance = new spin({ 'color': "blue", 'succeedColor': "green", 'spinner': spinnerConfig, 'disableSpins': disableSpins })
 return globalSpinnerInstance
}

const x = spinnerInstance(false)

const startSpin = (id, text) => { x.add(id, { 'text': text }) }

const upSpin = (id, text) => { x.update(id, { 'text': text }) }

const succspin = (id, text) => { x.succeed(id, { 'text': text }) }

const failSpin = (id, text) => { x.fail(id, { 'text': text }) }

module.exports = {
	color,
	bgcolor,
	startSpin,
	upSpin,
	succspin,
	failSpin
}
