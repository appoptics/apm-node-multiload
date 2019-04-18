const Action = require('../action')

//
// class-based get todos implementation
//
class ActionDelete extends Action {
  constructor (host, output, options) {
    super(...arguments)
    this.host = host
    this.output = output
    this.url = host + '/api/todos'
    this.httpOptions = options.httpOptions
    this.queued = 0
    this.deleted = 0
    this.errors = 0
    this.count = 0
    this.sampled = 0
  }

  execute() {
    return axios.get(this.url, this.httpOptions).then(r => {
      let outstanding = []
      let todosToDelete = r.data
      while (todosToDelete.length) {
        let todo = todosToDelete.shift()
        // small delay so not all requests are queued before yielding
        // to the event loop.
        let p = Action.wait(250).then(() => {
          this.queued += 1
          //return Promise.resolve()
          return axios.delete(this.url + '/' + todo._id, this.httpOptions)
        })
        // non-errors count as 1
        outstanding.push(p.then(r => {
          this.queued -= 1
          this.deleted += 1
          this.output(et => this.makeStatsLine(et))
          return 1
        }).catch(e => {
          this.errors += 1
          return 0
        }))
      }
      return outstanding
    }).then(outstanding => {
      return this.deleted
    })

  }

  makeStatsLine (et) {
    return [
      'todo deletes queued: ', this.queued,
      ', deleted: ', this.deleted,
      ', errors: ', this.errors
    ].join('');
  }
}

module.exports = ActionDelete