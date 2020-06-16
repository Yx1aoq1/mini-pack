import helloWorld from './helloWorld'

const node = document.createElement("div") 
node.innerHTML = helloWorld + 'loading...'

import(/* webpackChunkName: "async" */ './lazy')
  .then(({ default: lazy }) => {     
    node.innerHTML = helloWorld + lazy     
  }) 

document.body.appendChild(node)