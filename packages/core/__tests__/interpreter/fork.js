import { createStore, applyMiddleware } from 'redux'
import sagaMiddleware from '../../src'
import * as io from '../../src/effects'

describe('should not interpret returned effect. issue #1130', () => {
  it('fork(() => effectCreator())', () => {
    const middleware = sagaMiddleware()
    createStore(() => ({}), {}, applyMiddleware(middleware))
    const fn = () => null

    function* genFn() {
      const task = yield io.fork(() => io.call(fn))
      return task.toPromise()
    }

    return middleware
      .run(genFn)
      .toPromise()
      .then(actual => {
        expect(actual).toEqual(io.call(fn))
      })
  })
  it("yield fork(takeEvery, 'pattern', fn)", () => {
    const middleware = sagaMiddleware()
    createStore(() => ({}), {}, applyMiddleware(middleware))
    const fn = () => null

    function* genFn() {
      const task = yield io.fork(io.takeEvery, 'pattern', fn)
      return task.toPromise()
    }

    return middleware
      .run(genFn)
      .toPromise()
      .then(actual => {
        expect(actual).toEqual(io.takeEvery('pattern', fn))
      })
  })
})

describe('should interpret returned promise or iterator', () => {
  it('fork(() => promise)', () => {
    const middleware = sagaMiddleware()
    createStore(() => ({}), {}, applyMiddleware(middleware))

    function* genFn() {
      const task = yield io.fork(() => Promise.resolve('a'))
      return task.toPromise()
    }

    return middleware
      .run(genFn)
      .toPromise()
      .then(actual => {
        expect(actual).toEqual('a')
      })
  })
  it('fork(() => iterator)', () => {
    const middleware = sagaMiddleware()
    createStore(() => ({}), {}, applyMiddleware(middleware))

    function* genFn() {
      const task = yield io.fork(function*() {
        yield 1
        return 'b'
      })
      return task.toPromise()
    }

    return middleware
      .run(genFn)
      .toPromise()
      .then(actual => {
        expect(actual).toEqual('b')
      })
  })
})
