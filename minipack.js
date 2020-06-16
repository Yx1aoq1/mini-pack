const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')

let ID = 0

function createAsset (filename) {
  // 读取文件
  const content = fs.readFileSync(filename, 'utf-8')
  // 我们通过 babylon 这个 javascript 解析器来理解 import 进来的字符串 
  const ast = parser.parse(content, {
    sourceType: 'module'
  })
  // 该模块所依赖的模块的相对路径
  const dependencies = []
  // import声明 
  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value)
    }
  })
  // 递增设置模块ID 
  const id = ID++
  // AST -> ES5
  const { code } = transformFromAst(ast, null, {
    presets: ['@babel/env'],
  })

  return {
    id,
    filename,
    dependencies,
    code
  }
}

function createGraph (entry) {
  // 从第一个文件开始,首先解析index文件 
  const mainAsset = createAsset(entry)
  // 定义一个依赖队列，一开始的时候只有入口文件 
  const queue = [mainAsset]
  // 遍历 queue，广度优
  for (const asset of queue) {
    asset.mapping = {}

    const dirname = path.dirname(asset.filename)

    // 遍历依赖数组，解析每一个依赖模块
    asset.dependencies.forEach(relativePath => {
      const absolutePath = path.join(dirname, relativePath) + '.js'
      // 解析
      const child = createAsset(absolutePath)
      // 子模块`路径-id`map
      asset.mapping[relativePath] = child.id
      queue.push(child)
    })
  }
  return queue
}

function bundle (graph) {
  let modules = ''
  graph.forEach(mod => {
    modules += `${mod.id}: [
      function (require, module, exports) {
        ${mod.code}
      },
      ${JSON.stringify(mod.mapping)}
    ],`
  })
  const result = `
(function (modules) {
  function require(id) {
    const [fn, mapping] = modules[id]
    function localRequire (name) {
      return require(mapping[name])
    }

    const module = { exports: {} }

    fn(localRequire, module, module.exports)

    return module.exports
  }

  require(0)
})({
  ${modules}
})
  `
  return result
}

const graph = createGraph('src\\index.js')
const result = bundle(graph)

console.log(result)