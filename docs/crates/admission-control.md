---
id: admission-control
title: 准入控制
custom_edit_url: https://github.com/deltanet-lab/libra-website-cn/edit/master/docs/crates/admission_control.md
---

准入控制（AC）是Libra的公共API端点，它接受来自客户端的公共gRPC请求。

## 概览

准入控制（AC）服务于来自客户端的两种类型的请求：
1. SubmitTransaction - 将交易提交给关联的验证器。
2. UpdateToLatestLedger - 查询存储，以获得例如帐户状态、事务日志、证据等信息。

## 实现细节

准入控制（AC）实现两个公共API：
1. SubmitTransaction（SubmitTransactionRequest）
    * 将对请求执行多个验证：
        * 首先检查事务签名。如果此检查失败，将向客户端返回：AdmissionControlStatus::Rejected。
        * 然后由 vm_validator 验证事务。如果失败，则将相应的 VMStatus 返回给客户端。
    * 当事务通过所有验证时，AC查询发送者的帐户余额和来自存储的最新序列号，并将它们连同客户端请求一起发送到内存池组件。
    * 如果内存池组件返回 MempoolAddTransactionStatus::Valid，则向客户端返回： AdmissionControlStatus::Accepted，表示提交成功。否则，会将相应的 AdmissionControlStatus 返回给客户端。

2. UpdateToLatestLedger（UpdateToLatestLedgerRequest）。在AC中不执行额外的处理。
* 请求直接传递到存储器进行查询。


## 模块代码组织
```
    .
    ├── README.md
    ├── admission_control_proto
    │   └── src
    │       └── proto                           # Protobuf definition files
    └── admission_control_service
        └── src                                 # gRPC service source files
            ├── admission_control_node.rs       # Wrapper to run AC in a separate thread
            ├── admission_control_service.rs    # gRPC service and main logic
            ├── main.rs                         # Main entry to run AC as a binary
            └── unit_tests                      # Tests
```

## 该模块与如下模块产生交互:

1. 内存池组件，用于提交来自客户端的事务。
2. 存储组件，用于查询验证器存储。
