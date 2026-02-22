import Provider from './plugin-adapters/provider.js'

function add(a: number, b: number): number {
    return a + b
}

export {
    add,
    Provider,
}