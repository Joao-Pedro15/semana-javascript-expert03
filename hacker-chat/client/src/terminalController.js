import ComponentsBuilder from "./components.js"
import { constants } from "./constants.js"

ComponentsBuilder
export default class TerminalController {
  #usersCollor = new Map()
  constructor() {}

  #pickCollor() {
    return `#` + ((1 << 24) * Math.random() | 0).toString(16) + '-fg' 
  }

  #getUserCollor(userName) {
    if(this.#usersCollor.has(userName)){
      return this.#usersCollor.get(userName)
    }
    const collor = this.#pickCollor()
    this.#usersCollor.set(userName, collor)
    return collor
  }

  #onInputReceived(eventEmitter) {
    return function() {
      const message = this.getValue()
      console.log(message)
      this.clearValue()
    }
  }

  #onMessageReceived({ screen, chat }) {
    return msg => {
      const { userName, message } = msg
      const collor = this.#getUserCollor(userName)
      chat.addItem(`{${collor}}{bold}${userName}{/}: ${message}`)
      screen.render()
    }
  }

  #onLogChanged({ screen, activityLog }) {

    return msg => {
      // joao left
      // joao join
  
      const [userName] = msg.split(/\s/)
      const collor = this.#getUserCollor(userName)
      activityLog.addItem(`{${collor}}{bold}${msg.toString()}{/}`)
      screen.render()
    }
  }

  #onStatusChanged({ screen, status }) {
    // ['joao', 'mariazinha']
    return users => {
      // vamos pegar o primeiro elemento da lista
      const { content } = status.items.shift()
      status.clearItems()
      status.addItem(content)
      users.forEach(userName => {
        const collor = this.#getUserCollor(userName)
        status.addItem(`{${collor}}{bold}${userName}{/}`)
      })
      screen.render()
    }
  }

  #registerEvents(eventEmitter, components) {
    eventEmitter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(components))
    eventEmitter.on(constants.events.app.ACTIVITYLOG_UPDATED, this.#onLogChanged(components))
    eventEmitter.on(constants.events.app.STATUS_UPDATED, this.#onStatusChanged(components))
  }

  async initializeTable(eventEmitter) {
    const components = new ComponentsBuilder()
    .setScreen({ title: 'HackerChat - João Monteiro' })
    .setLayoutComponent()
    .setInputComponent(this.#onInputReceived(eventEmitter))
    .setChatComponent()
    .setActivityLogComponent()
    .setStatusComponent()
    .build()

    this.#registerEvents(eventEmitter, components)
    components.input.focus()
    components.screen.render()
  }
}