---
id: crypto
title: 加密
custom_edit_url: https://github.com/libra/libra/edit/master/crypto/crypto/README.md
---

The crypto component hosts all the implementations of cryptographic primitives we use in Libra: hashing, signing, and key derivation/generation. The parts of the library usig traits.rs contain the crypto API enforcing type safety, verifiable random functions, EdDSA & BLS signatures.

加密组件承载了我们在Libra中使用的所有加密原语的实现：散列、签名和密钥派生/生成。使用“traits.rs”的部分库包含强制类型安全的加密API、可验证的随机函数（VRF）、EdDSA和BLS签名。

## 概览

Libra makes use of several cryptographic algorithms:

* SHA-3 as the main hash function. It is standardized in [FIPS 202](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf). It is based on the [tiny_keccak](https://docs.rs/tiny-keccak/1.4.2/tiny_keccak/) library.
* HKDF: HMAC-based Extract-and-Expand Key Derivation Function (HKDF) based on [RFC 5869](https://tools.ietf.org/html/rfc5869). It is used to generate keys from a salt (optional), seed, and application-info (optional).
* traits.rs introduces new abstractions for the crypto API.
* Ed25519 performs signatures using the new API design based on [ed25519-dalek](https://docs.rs/ed25519-dalek/1.0.0-pre.1/ed25519_dalek/) library with additional security checks (e.g. for malleability).
* BLS12381 performs signatures using the new API design based on [threshold_crypto](https://github.com/poanetwork/threshold_crypto) library. BLS signatures currently undergo a [standardization process](https://tools.ietf.org/html/draft-boneh-bls-signature-00).
* ECVRF implements a verifiable random function (VRF) according to [draft-irtf-cfrg-vrf-04](https://tools.ietf.org/html/draft-irtf-cfrg-vrf-04) over curve25519.
* SLIP-0010 implements universal hierarchical key derivation for Ed25519 according to [SLIP-0010](https://github.com/satoshilabs/slips/blob/master/slip-0010.md).
* X25519 to perform key exchanges. It is used to secure communications between validators via the [Noise Protocol Framework](http://www.noiseprotocol.org/noise.html). It is based on the x25519-dalek library.

Libra使用了如下几种密码学算法：

* SHA-3作为主散列函数。它在[FIPS 202](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf)中标准化。它基于[tiny_keccak](https://docs.rs/tiny-keccak/1.4.2/tiny_keccak/)。
* HKDF：基于HMAC的[rfc5869](https://tools.ietf.org/html/rfc5869)的密钥派生函数（hkdf）的提取和扩展。它用于从salt（可选）、seed和application info（可选）生成密钥。
* traits.rs为crypto api引入了新的抽象。
* Ed25519用于执行签名，其基于[ed25519-dalek](https://docs.rs/ed25519-dalek/1.0.0-pre.1/ed25519_dalek/)的新api设计库和额外的安全检查（例如延展性）。
* BLS12381使用基于[threshold_crypto](https://github.com/poanetwork/threshold_crypto)库的新api设计执行签名。BLS签名正在被[标准化](https://tools.ietf.org/html/draft-boneh-bls-signature-00)。
* ECVRF根据[draft-irtf-cfrg-vrf-04](https://tools.ietf.org/html/draft-irtf-cfrg-vrf-04)在curve25519上实现了可验证随机函数（VRF）。
* SLIP-0010根据[SLIP-0010](https://github.com/satoshilabs/slips/blob/master/slip-0010.md)实现ED25519的通用分层密钥派生。
* 用于执行密钥交换的X25519：它通过[Noise协议框架](http://www.noiseprotocol.org/noise.html)保护验证器之间的通信。它基于x25519-dalek库进行开发。

## 模块的代码组织
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
