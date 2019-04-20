# 会反射的老母鸡 RChain Slot Machine
这是一个DEMO项目，fork自The Nth Caller Game。原作者是Joshy Orndorff，我把它略加修改变成一个老虎机类的游戏。通过这个游戏，大家可以提前感受一下[RChain区块链](https://www.rchain.coop)。

RNode Version: [0.9.3](https://github.com/rchain/rchain/releases/tag/v0.9.3)

## 目的
RChain测试网已经上线，到底能够提供什么样的性能，相比于以太坊有什么惊艳的地方？试了才知道。

1. 学习Rholang的基本语法
2. 实践RChain API的基本使用方法
3. 实现随机数产生和多层循环
4. 通过GRPC接口部署Rholang智能合约
5. 在RChain节点上注册和查询智能合约


## 游戏规则

1. 点击水龙头，领取REV。该功能并没有实现对接REV测试币，因为相应的REV钱包还在开发中。预计5月6号以后的测试网第二版可能体验到REV测试币
2. 点击one REV，开始游戏
3. 每人三局，三局依次自动进行
4. 每一行中，出现三个一样的玩偶时中奖，得到1 REV
由于需要与区块链互动，游戏速度较慢，当遇到系统繁忙时，需等待

## 实现方法
主智能合约oldhen.rho手动部署到节点上，得到rho:id，写入server.js。游戏server跑起来后，当游戏开始，会自动部署lookup智能合约到节点上，lookup智能合约通过向rho:id发送信息触发主智能合约运行，产生随机数并返回结果。Server得到结果后向page.js返回，随后完成前端交互。

RNode 0.9.2版后，在部署智能合约时加入了私钥签名过程，相应的RChain API还在开发中，所以大家如果直接安装[官网API](https://github.com/rchain/rchain-api)，并不能正常运行。


# 随机数生成
利用Rholang的并行特性可以很轻松的产生随机数，下面是一个例子：
```scala
contract diceBox( ack ) = {
  new dice in {
    dice!(1)|
    for ( _ <= dice) {
        stdout!("1")
    }|
    for ( _ <= dice) {
        stdout!("2")
    }|
    for ( _ <= dice) {
        stdout!("3")
    }|
    for ( _ <= dice) {
        stdout!("4")
    }
  }
}    
```

## 双重循环
并行特性不好驾驭。在需要严格执行串行的情况时，一定要倍加小心。代码库里另有一个坏例子，表面看起来实现了双重循环，实际运行起来远非如此。

```scala
new oldHen, round, counter, stdout(`rho:io:stdout`) in {

      contract oldHen ( ack ) = {

        round!(1)|
        counter!(1)|
        for (@round_ <= round; @counter_ <= counter) {
            if(round_ < 4) {
                if(counter_ < 4 ){
                        counter!( counter_ + 1 )|
                        round!( round_ )|
                        stdout!(["counter",counter_ + 1])                    
                }    
                else {
                    round!( round_ + 1)|
                    counter!( 1 )|
                    stdout!(["round", round_ + 1])                
                }
            }    
                
        }
    }|
    oldHen!(1)

}
```



## 链上注册和查询
只有在链上注册了的智能合约才能被再次访问到。所以需要执行注册和查询程序。成功注册的rho程序会返回一个rho:id, 下例是一个lookup程序，给定rho:id，返回对应程序的unforgeable name.
```scala
new dCh, lookup(`rho:registry:lookup`),
stdout(`rho:io:stdout`) in {
  lookup!(\`rho:id:gdtbab98a51nkks5ruktic6qgt4tnh1kaa9uopo6dfmgu5bqbdhjc5\`, *dCh) |
  for( oldHen <- $dCh) {
    oldHen!( "ack" )
  }
}
```

## 未来计划

1. 目前智能合约部署在单个节点上，原因是目前的第一期测试网没有开放外部节点部署智能合约的功能。虽然通过连接远端官方节点手动成功部署了主智能合约，但在每次游戏程序自动部署lookup智能合约时必须通过GRPC端口，过程受阻。测试网第二期开始后，将开放社区Validator参与，届时我将把智能合约部署到测试网。
2. 重构随机数生成，去掉在智能合约端的分数判断功能，减轻对区块链的压力，加快数据返回速度。
3. 修改游戏规则，让游戏变得更好玩
4. 实现水龙头功能
5. 实现排行榜功能

## 反馈
希望通过这个游戏大家对RChain能有更直观的认识。欢迎大家加入RChain社区，为区块链技术的发展出一份力。加入[Rholang中国社区](https://rholang-china.org)一起学习研究Rholang。我是`愁虫Dimworm`。