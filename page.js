"use strict"

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('call').addEventListener('click', call)
  document.getElementById('faucet').addEventListener('click', faucet)
  document.getElementById("rich").disabled = true
  var mText=""
  var blnc=0
  async function call(){  
    // let tt 
    if ( blnc < 1) {
      alertify.alert('Your balance is not enough!')
    }
    else {
      const tt = await makePost('/bs')
            .then(data => {
              return(data.success)
            })
            .then(function(result) {
              return(result)})
      console.log('tt',tt)

      if(tt){
        alertify.alert('OldHen is busy, wait a moment!')
        return
      }
      else {
        makePost('/call')
        .then(data => {
          console.log(data.message)
          displayPics(data.message)
        })

        blnc = blnc -1
        document.getElementById("balance").innerHTML = `Your wallet: ${blnc} REV`
        for (var i = 1; i < 13; i++) {
          document.getElementById("dice"+i).src=`views/img/rchain.png`
        }
        document.getElementById("call").disabled = true 
        mText="老母鸡开始下蛋了..."
        document.getElementById("mt").innerHTML = mText
        showInf()
      }
    }
  }

  function makePost(route){
    let request = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify()
    }
    return fetch(route, request)
    .then(res => {return res.json()})
    
  }

  async function displayPics(d_str){
    var array = d_str.split(" ")
    var dice = new Array()
    var arrP = new Array()
    var score1 = new Array()
    var score2 = new Array()
    var score = new Array()
    score[0]=0
    score[1]=0
    score[2]=0
    score[3]=0            
    for (var i = 0; i < array.length; i++){
      if (array[i] != "score") {
        arrP.push(array[i])
      }
      else {
        score1.push(i-score1.length) // store the position of score
      }
    }
    for (i=0; i < score1.length; i++) {
      score2.push(Math.ceil(score1[i] / 12))// store which ju it is located at
    }
    for (i=0; i<4; i++) {
      for (var j =0; j <score2.length; j++){
        if ( score2[j]==i+1) {
          score[i]++
        }
      }
    }
    console.log(score)
    for (i = 0; i < 12; i++) {
      dice.push("dice" + (i+1))
    }
    for (j =0; j < 3; j++) {
      for (i = 0; i < 12; i++) {
        document.getElementById(dice[i]).src=`views/img/${arrP[j*12+i]}.png`
        console.log(`views/img/${arrP[j*12+i]}.png`)
        if ((i+1) %4 ==0) {
          await sleep_(1000)            
        }
      
      }
      mText=`第 ${j+1} 局 得到 ${score[j]} REV...\n`+ mText
      document.getElementById("mt").innerHTML = mText
      blnc=blnc+score[j]
      document.getElementById("balance").innerHTML = `Your wallet: ${blnc} REV`

      console.log("ju"+(j+1))     
      await sleep_(5000)
      if (j < 2) {
        for (var i = 1; i < 13; i++) {
          document.getElementById("dice"+i).src=`views/img/rchain.png`
        }
      }
      await sleep_(1000)
    }
    document.getElementById("call").disabled = false
    await sleep_(1000)
    mText=`游戏结束...\n`+ mText    
    document.getElementById("mt").innerHTML = mText
    await sleep_(1000)
    mText=`没有发挥好？再来一局...\n`+ mText
    document.getElementById("mt").innerHTML = mText 
    }

  function sleep_(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function faucet(){
    document.getElementById("faucet").disabled = true
    blnc = Math.ceil(Math.random() * 10)
    document.getElementById("balance").innerHTML = `Your wallet: ${blnc} REV`   

  }

  async function showInf() {
    await sleep_(2000)
    mText=`尝试访问RChain测试网...\n`+ mText
    document.getElementById("mt").innerHTML = mText
    await sleep_(4000)
    mText=`向区块链部署本次智能合约...\n`+ mText
    document.getElementById("mt").innerHTML = mText
    await sleep_(2000)
    mText=`智能合约部署成功...\n`+ mText    
    document.getElementById("mt").innerHTML = mText   
    await sleep_(2000)
    mText=`向位于 \n“rho:id:anzabai897egdmtsxw6d7a8zsfrx54qnwesddcj7umc5kb3bdd1mky”
的主智能合约发送数据返回通道...\n`+ mText   
    document.getElementById("mt").innerHTML = mText
    await sleep_(4000)
    mText=`触发主智能合约运行...\n`+ mText   
    document.getElementById("mt").innerHTML = mText
    await sleep_(3000)
    mText=`开始产生随机数...\n`+ mText
    document.getElementById("mt").innerHTML = mText   
    await sleep_(4000)  
  }
})