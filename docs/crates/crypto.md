---
id: crypto
title: 加密
custom_edit_url: https://github.com/deltanet-lab/libra-website-cn/edit/master/docs/crates/crypto.md
---

加密组件承载了我们在Libra中使用的所有加密原语的实现：散列、签名和密钥派生/生成。使用“traits.rs”的部分库包含强制类型安全的加密API、可验证的随机函数（VRF）、EdDSA和BLS签名。

## 概览

Libra使用了如下几种密码学算法：

* SHA-3作为主要的散列函数。它在[FIPS 202](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf)中标准化。它基于[tiny_keccak](https://docs.rs/tiny-keccak/1.4.2/tiny_keccak/)。
* HKDF：符合[rfc5869](https://tools.ietf.org/html/rfc5869)的HMAC的提取和扩展密钥派生函数（HKDF）。它用于从盐（可选）、种子和应用程序信息（可选）生成密钥。
* traits.rs为crypto API引入了新的抽象。
* Ed25519使用基于[ed25519-dalek](https://docs.rs/ed25519-dalek/1.0.0-pre.1/ed25519_dalek/)的新API设计执行签名，并进行了额外的安全检查（例如：可延展性）。
* BLS12381使用基于[threshold_crypto](https://github.com/poanetwork/threshold_crypto)库的新API来执行签名。BLS签名目前正在进行[标准化过程](https://tools.ietf.org/html/draft-boneh-bls-signature-00)。
* ECVRF根据Curve25519上的[draft-irtf-cfrg-vrf-04](https://tools.ietf.org/html/draft-irtf-cfrg-vrf-04)在实现了可验证随机函数（VRF）。
* SLIP-0010根据[SLIP-0010](https://github.com/satoshilabs/slips/blob/master/slip-0010.md)为ED25519实现了通用的层次密钥派生。
* 用于执行密钥交换的X25519：它通过[Noise协议框架](http://www.noiseprotocol.org/noise.html)保护验证者之间的通信。它基于x25519-dalek库进行开发。

## 模块的代码组织（How is this module organized?）
```
    crypto/src
    ├── hash.rs             # Hash function (SHA-3)
    ├── hkdf.rs             # HKDF implementation (HMAC-based Extract-and-Expand Key Derivation Function based on RFC 5869)
    ├── macros/             # Derivations for SilentDebug and SilentDisplay
    ├── utils.rs            # Serialization utility functions
    ├── lib.rs
    ├── bls12381.rs         # Bls12-381 implementation of the signing/verification API in traits.rs
    ├── ed25519.rs          # Ed25519 implementation of the signing/verification API in traits.rs
    ├── slip0010.rs         # SLIP-0010 universal hierarchical key derivation for Ed25519
    ├── x25519.rs           # X25519 keys generation
    ├── test_utils.rs
    ├── traits.rs           # New API design and the necessary abstractions
    ├── unit_tests/         # Tests
    └── vrf/
        ├── ecvrf.rs        # ECVRF implementation using curve25519 and SHA512
        ├── mod.rs
        └── unit_tests      # Tests
```
