"use strict"

const express = require('express');
const bodyParser = require('body-parser');
const grpc = require('grpc')
const {RNode, RHOCore, keyPair, h2b, b2h, verify, SignDeployment} = require("rchain-api")

// Parse command-line arguments
var host   = process.argv[2] ? process.argv[2] : "localhost"
var port   = process.argv[3] ? process.argv[3] : 40401
var uiPort = process.argv[4] ? process.argv[4] : 8080


// Configure the express app and RNode connection
var myNode = RNode(grpc, {host, port})
var app = express()
var isUsing = false
app.use(bodyParser.json())
app.use(express.static(__dirname))

// Start the express app
app.listen(uiPort, () => {
  console.log("OldHen Dapp server started.")
  console.log(`Connected to RNode at ${host}:${port}.`)
  console.log(`started on ${uiPort}`)

})

app.post('/bs',(req, res) => {
  console.log('isUsing',isUsing)
  if(!isUsing){
    res.end(JSON.stringify(
      {success: false
    }))
    isUsing = true
    return
  }
  else {
    res.end(JSON.stringify(
      {success: true
    }))
    return
  }
})  

app.post('/call', (req, res) => {
  isUsing = true
  let ack = "r" + Math.random().toString(36).substring(7)
  let dCh = "r" + Math.random().toString(36).substring(7)
  console.log(dCh)
  let code = `new ${dCh},  
        lookup(\`rho:registry:lookup\`),
        stdout(\`rho:io:stdout\`) in {
            lookup!(\`rho:id:gdtbab98a51nkks5ruktic6qgt4tnh1kaa9uopo6dfmgu5bqbdhjc5\`, *${dCh}) |
            for( oldHen <- ${dCh}) {
                oldHen!( "${ack}" )
            }
        }`

  let de = {term: code,
    timestamp: new Date().valueOf(),
    phloLimit: 9999999,
    phloPrice: 1
  }
  const defaultSec = h2b('3b99eaac3200f07f99f7d5cc1b12cb507b47a42d418653e76a1ab469e5239e02')
  const deployData=SignDeployment.sign(keyPair(defaultSec), de)

  myNode.doDeploy(deployData).then(_ => {
    return myNode.createBlock()
  }).then(_ => {
    return myNode.listenForDataAtPublicName(ack)
  }).then((blockResults) => {
    isUsing = false
    console.log(blockResults)
    if(blockResults.length === 0){
      res.end(JSON.stringify({success: false}))
      return
    }
    var lastBlock = blockResults.slice(-1).pop()
    var lastDatum = lastBlock.postBlockData.slice(-1).pop()
    var temp1 = JSON.stringify(lastDatum)
    var temp = temp1.slice(23, -5)
    console.log(`temp: ${temp}`)
    res.end(JSON.stringify(
      {success: true,
      message: temp,
    }))
  }).catch(oops => {
  console.log(oops)
  isUsing = false})
})