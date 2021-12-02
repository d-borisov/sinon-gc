const createStubInstance = require('sinon').createStubInstance;

class SomeClass {
    constructor(id, dependency) {
        this.id = id;
        this.subDependency = dependency.getString();
    }
}

class Dependency {
    getString() {
        return 'real string';
    }
}

async function showcase() {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const dependencyMock = createStubInstance(Dependency);
    dependencyMock.getString.returns('string mock');

    let arr = [];
    arr.push(new SomeClass('withReal', new Dependency()));
    arr.push(new SomeClass('withMock', dependencyMock));
    console.log('array with objects');

    global.gc();
    console.log('gc() A');
    await sleep(10_000);

    arr = [];
    console.log('array cleared');

    global.gc();
    console.log('gc() B');
    await sleep(10_000);
}

showcase();