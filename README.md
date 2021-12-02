# sinon-gc

Showcase to understand nuances on how sinonjs affects V8 GC

# description

I found that sinon affects garbage collection mechanism in NodeJS. Objects that have interacted with sinon's mock 
objects are not removed by GC.

My local setup is:

```shell script
$ uname -a
Linux dborisov-laptop 4.15.0-163-generic #171-Ubuntu SMP Fri Nov 5 11:55:11 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux

$  cat /etc/os-release
NAME="Ubuntu"
VERSION="18.04.3 LTS (Bionic Beaver)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 18.04.3 LTS"
VERSION_ID="18.04"
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
VERSION_CODENAME=bionic
UBUNTU_CODENAME=bionic

$ node -v
v16.13.0

$ npm -v
8.1.0
```


# steps to reproduce

Just run `test` npm script


```shell script
$ npm run-script test

> @dborisov/sinon-gc@1.0.0 test
> node --inspect-brk --expose-gc --trace-gc index.js

Debugger listening on ws://127.0.0.1:9229/98df6527-f3c7-4109-96eb-590490d43dc3
For help, see: https://nodejs.org/en/docs/inspector         <-- LABEL_1
Debugger attached.
array with objects
gc() A       <-- LABEL_2
array cleared
gc() B       <-- LABEL_3
Waiting for the debugger to disconnect...
```

When you get a string labeled as `LABEL_1` from stdout please connect to the application with debugger. I use 
Google Chrome DevTools (chrome://inspect).

When you get a string labeled as `LABEL_2` make a heapdump. I've uploaded mine - see [heapdump_1](heapsdumps/heapdump-1.heapsnapshot).

When you get a string labeled as `LABEL_3` make one more heapdump. I've uploaded mine - see [heapdump_2](heapsdumps/heapdump-2.heapsnapshot).

Now search for object of `SomeClass` in dumps. 

First heapdump
![heapdump_1 screeshot](heapsdumps/heapdump-1.png?raw=true "heapdump_1 screeshot")

Second heapdump
![heapdump_2 screeshot](heapsdumps/heapdump-2.png?raw=true "heapdump_2 screeshot")


One can see that behavior for the same objects differs depending on sinon.

1. Object that was identified as `this.id = 'withReal'` exists in the first dump but not in the second. This is correct,
there is no active link to the object because an array that had a link to the object was replaced with empty one.

2. Object that was identified as `this.id = 'withMock'` exists in both dumps which seems incorrect. This object
has passed the same algorithm as the first object and I expect that mock-object should be swept out by GC as well.
