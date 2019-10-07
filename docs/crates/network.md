---
id: network
title: 网络
custom_edit_url: https://github.com/deltanet-lab/libra-website-cn/edit/master/network/README.md
---


The network component provides peer-to-peer communication primitives to other
components of a validator.

网络组件向其他验证器的组件提供对等通信原语。

## 概览

The network component is specifically designed to facilitate the consensus and
shared mempool protocols. Currently, it provides these consumers with two
primary interfaces:
* RPC, for Remote Procedure Calls; and
* DirectSend, for fire-and-forget style message delivery to a single receiver.

网络组件是专门设计用来促进共识和共享内存池协议。目前，它为消费者提供了两个
主要接口：
* RPC，用于远程过程调用；和
* DirectSend，用于将即发即弃式消息传递到单个接收器。

The network component uses:
* [Multiaddr](https://multiformats.io/multiaddr/) scheme for peer addressing.
* TCP for reliable transport.
* [Noise](https://noiseprotocol.org/noise.html) for authentication and full
 end-to-end encryption.
* [Yamux](https://github.com/hashicorp/yamux/blob/master/spec.md) for
multiplexing substreams over a single connection.
* Push-style [gossip](https://en.wikipedia.org/wiki/Gossip_protocol) for peer
discovery.

网络组件使用了：
* [Multiaddr](https://multiformats.io/multiaddr/)方案，用于对等寻址。
* 使用TCP实现可靠传输。
* [Noise](https://noiseprotocol.org/noise.html)，用于身份验证和完整端到端加密。
* [Yamux](https://github.com/hashicorp/yamux/blob/master/spec.md)，用于通过单个连接多路复用子流。
* 对等体的推式[gossip](https://en.wikipedia.org/wiki/Gossip_protocol)，用于对端发现。

Each new substream is assigned a *protocol* supported by both the sender and
the receiver. Each RPC and DirectSend type corresponds to one such protocol.

每个新的子流都分配有一个由发送者和收件人。每种RPC和DirectSend类型都对应一个这样的协议。

Only eligible members are allowed to join the inter-validator network. Their
identity and public key information is provided by the consensus
component at initialization and on updates to system membership. A new
validator also needs the network addresses of a few *seed* peers to help it
bootstrap connectivity to the network. The seed peers first authenticate the
joining validator as an eligible member and then share their network state
with it.

Each member of the network maintains a full membership view and connects
directly to any validator it needs to communicate with. A validator that cannot
be connected to directly is assumed to fall in the quota of Byzantine faults
tolerated by the system.

Validator health information, determined using periodic liveness probes, is not
shared between validators; instead, each validator directly monitors its peers
for liveness.

This approach should scale up to a few hundred validators before requiring
partial membership views, sophisticated failure detectors, or network overlays.


仅允许合格成员加入验证者间网络。其
身份和公共密钥信息由共识提供
组件在初始化和系统成员资格更新时使用。一个新的
验证程序还需要几个*seed*对等方的网络地址来帮助它
引导到网络的连接。种子对等方首先对
作为合格成员加入验证者，然后共享其网络状态
用它。

网络的每个成员都维护完整的成员资格视图并进行连接
直接与需要与之通信的任何验证器。验证者不能
假定直接连接属于拜占庭式断层
被系统所容忍。

使用定期活动性探针确定的验证者健康信息不是
验证者之间共享；取而代之的是，每个验证器直接监视其对等项
为了活泼。

在要求之前，此方法应扩展到数百个验证器
部分成员资格视图，复杂的故障检测器或网络覆盖。

## 实现细节

### 系统架构

                                 +---------------------+---------------------+
                                 |      Consensus      |       Mempool       |
                                 +---------------------+---------------------+
                                 |            Validator Network              |
                                 +---------------------+---------------------+
                                 |            NetworkProvider                |
    +------------------------------------------------+-----------------+     |
    | Discovery, health, etc     |            RPC    |  DirectSend     |     |
    +--------------+---------------------------------------------------------+
    |                                         Peer Manager                   |
    +------------------------------------------------------------------+-----+

The network component is implemented in the
[Actor](https://en.wikipedia.org/wiki/Actor_model) programming model &mdash;
i.e., it uses message-passing to communicate between different subcomponents
running as independent "tasks." The [tokio](https://tokio.rs/) framework is
used as the task runtime. The different subcomponents in the network component
are:

网络组件的实现使用了
[Actor](https://en.wikipedia.org/wiki/Actor_model)编程模型，例如，它使用消息传递在不同子组件之间进行通信
作为独立的“任务”运行。 [tokio](https://tokio.rs/)框架被用作任务运行时。 网络组件中包括如下子组件：

* **NetworkProvider** &mdash; Exposes network API to clients. It forwards
requests from upstream clients to appropriate downstream components and sends
incoming RPC and DirectSend requests to appropriate upstream handlers.
* **Peer Manager** &mdash; Listens for incoming connections and dials other
peers on the network. It also notifies other components about new/lost
connection events and demultiplexes incoming substreams to appropriate protocol
handlers.
* **Connectivity Manager** &mdash; Ensures that we remain connected to a node
if and only if it is an eligible member of the network. Connectivity Manager
receives addresses of peers from the Discovery component and issues
dial/disconnect requests to the Peer Manager.
* **Discovery** &mdash; Uses push-style gossip for discovering new peers and
updates to addresses of existing peers. On every *tick*, it opens a new
substream with a randomly selected peer and sends its view of the network to
this peer. It informs the connectivity manager of any changes to the network
detected from inbound discovery messages.
* **Health Checker** &mdash; Performs periodic liveness probes to ensure the
health of a peer/connection. It resets the connection with the peer if a
configurable number of probes fail in succession. Probes currently fail on a
configurable static timeout.
* **Direct Send** &mdash; Allows sending/receiving messages to/from remote
peers. It notifies upstream handlers of inbound messages.
* **RPC** &mdash; Allows sending/receiving RPCs to/from other peers. It notifies
upstream handlers about inbound RPCs. The upstream handler is passed a channel
through which can send a serialized response to the caller.

In addition to the subcomponents described above, the network component
consists of utilities to perform encryption, transport multiplexing, protocol
negotiation, etc.

* **NetworkProvider**：向客户端公开网络API。它转发上游客户端对适当的下游组件的请求并发送传入RPC和DirectSend请求到适当的上游处理程序。
* **Peer Manager**：监听传入的连接并连接网络上其他的对等体。它还会通知其他组件有关新的/断开连接的事件并将输入的子流多路分解到适当的协议处理程序。
* **Connectivity Manager**：确保我们保持与节点的连接当且仅当它是网络的合格成员时。连接管理器从Discovery组件接收对等方的地址并发出连接/断开对等方管理器的请求。
* **Discovery**：使用推送式八卦协议来发现新的对等方并更新现有对等方的地址。在每一个*tick*上，都会打开一个新的带有随机选择的对等点的子流，并将其网络视图发送到这个对等方。它将从入站发现消息中检测到的对网络的任何更改通知给连接管理器。
* **Health Checker**：执行定期的活动探测以确保对等体/连接的运行状况。如果出现以下情况，它将重置与对等方的连接：可配置数量的探测连续失败。目前的探测失败为可配置的静态超时。
* **Direct Send**：允许向/从远程对等方发送/接收消息。它将入站消息通知给上游处理程序。
* **RPC**：允许向其他对等方发送/接收RPC。通知上游处理程序有关入站RPC，上游处理程序通过一个通道向调用者发送序列化的响应。

除了上述子组件，网络组件还包含执行加密的工具，传输的多路复用，握手协议等。

## 模块的代码组织

    network
    ├── benches                       # network benchmarks
    ├── memsocket                     # In-memory transport for tests
    ├── netcore
    │   └── src
    │       ├── multiplexing          # substream multiplexing over a transport
    │       ├── negotiate             # protocol negotiation
    │       └── transport             # composable transport API
    ├── noise                         # noise framework for authentication and encryption
    └── src
        ├── channel                    # mpsc channel wrapped in IntGauge
        ├── connectivity_manager       # component to ensure connectivity to peers
        ├── interface                  # generic network API
        ├── peer_manager               # component to dial/listen for connections
        ├── proto                      # protobuf definitions for network messages
        ├── protocols                  # message protocols
        │   ├── direct_send            # protocol for fire-and-forget style message delivery
        │   ├── discovery              # protocol for peer discovery and gossip
        │   ├── health_checker         # protocol for health probing
        │   └── rpc                    # protocol for remote procedure calls
        ├── sink                       # utilities over message sinks
        └── validator_network          # network API for consensus and mempool
