'use strict';

const Action = require('../action')

//
// get server config information
//
class ActionGetConfig extends Action {
  constructor (host, output, options) {
    super(...arguments)
    this.host = host
    this.output = output
    this.url = host + '/config'
    this.httpOptions = options.httpOptions
  }

  execute () {
    return this.httpGet(this.url, this.httpOptions).then(r => {
      return this.collectStats(r)
    }).then(config => {
      this.output(et => this.makeStatsLine(et, config))
      return config
    })
  }

  collectStats (r) {
    // collect the server config here
    const config = {}
    // agent must be set before calling wasSampled
    this.agent = r.data.appopticsVersion
    config.agent = this.agent

    config.bindings = r.data.bindingsVersion
    config.traceMode = r.data.traceMode
    config.sampleRate = r.data.sampleRate
    config.pid = r.data.pid
    config.key = r.data.config.serviceKey
    return config
  }

  makeStatsLine (et, config) {
    return [
      'agent: ', config.agent,
      ', bindings: ', config.bindings,
      ', mode: ', config.traceMode,
      ', rate: ', config.sampleRate,
      '\nservice name: ', config.key.split(':')[1],
      ', pid: ', config.pid,
    ].join('')

  }
}

module.exports = ActionGetConfig

