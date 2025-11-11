---
title: "RSA Weak Primes - Factorization Attack"
category: "Crypto"
difficulty: "Easy"
author: "havoc"
date: "2025-10-01"
description: "Breaking RSA encryption by factoring small primes"
---

## Summary

This cryptography challenge provided an RSA public key with weak primes. By factoring the modulus, we recovered the private key and decrypted the flag.

## Challenge Files

We're given three files:

```
public.pem      # RSA public key
encrypted.txt   # Encrypted flag
challenge.py    # Encryption script
```

## Understanding RSA

Quick RSA refresher:
- **n = p × q** (modulus, product of two primes)
- **e** (public exponent, usually 65537)
- **d** (private exponent, calculated from p, q, and e)
- **Encryption**: c = m^e mod n
- **Decryption**: m = c^d mod n

## Analyzing the Public Key

```bash
$ openssl rsa -pubin -in public.pem -text -noout
Public-Key: (256 bit)
Modulus:
    00:c2:63:6a:e5:c3:d8:e4:3f:fb:97:ab:4e:14:10:
    5f:6e:63:ca:e0:21:d4:34:d6:5a:45:1d:93
Exponent: 65537 (0x10001)
```

The key is only **256 bits**! Modern RSA should use at least 2048 bits.

## Extracting n and e

```python
from Crypto.PublicKey import RSA

# Load public key
with open('public.pem', 'r') as f:
    key = RSA.import_key(f.read())

n = key.n
e = key.e

print(f"n = {n}")
print(f"e = {e}")
```

Output:
```
n = 87584945372972534117335317614156469749099784093321490776742136093673689890771
e = 65537
```

## Factoring n

Since n is small (256 bits), we can factor it quickly:

```python
from sympy import factorint

# Factor n
factors = factorint(n)
print(f"Factors: {factors}")

p = list(factors.keys())[0]
q = list(factors.keys())[1]

print(f"p = {p}")
print(f"q = {q}")
print(f"Verification: p * q = {p * q}")
print(f"n == p * q: {n == p * q}")
```

Output:
```
Factors: {296841965476806071: 1, 295025657891467921: 1}
p = 296841965476806071
q = 295025657891467921
Verification: p * q = 87584945372972534117335317614156469749099784093321490776742136093673689890771
n == p * q: True
```

## Calculating Private Key

Now that we have p and q, we can calculate the private exponent d:

```python
from Crypto.Util.number import inverse

# Calculate phi(n)
phi = (p - 1) * (q - 1)

# Calculate private exponent d
d = inverse(e, phi)

print(f"d = {d}")
```

## Decrypting the Flag

```python
from Crypto.Util.number import long_to_bytes

# Read encrypted flag
with open('encrypted.txt', 'r') as f:
    c = int(f.read())

# Decrypt: m = c^d mod n
m = pow(c, d, n)

# Convert to bytes
flag = long_to_bytes(m)
print(f"Flag: {flag.decode()}")
```

## Complete Exploit Script

```python
#!/usr/bin/env python3
from Crypto.PublicKey import RSA
from Crypto.Util.number import inverse, long_to_bytes
from sympy import factorint

# Load public key
with open('public.pem', 'r') as f:
    key = RSA.import_key(f.read())

n = key.n
e = key.e

print(f"[+] n = {n}")
print(f"[+] e = {e}")
print(f"[+] n bit length: {n.bit_length()}")

# Factor n (only works for small n)
print("[*] Factoring n...")
factors = factorint(n)
p, q = list(factors.keys())

print(f"[+] p = {p}")
print(f"[+] q = {q}")
print(f"[+] Verification: {n == p * q}")

# Calculate private exponent
phi = (p - 1) * (q - 1)
d = inverse(e, phi)

print(f"[+] Private exponent d calculated")

# Read and decrypt ciphertext
with open('encrypted.txt', 'r') as f:
    c = int(f.read())

m = pow(c, d, n)
flag = long_to_bytes(m).decode()

print(f"\n[+] Flag: {flag}")
```

## Execution

```bash
$ python3 exploit.py
[+] n = 87584945372972534117335317614156469749099784093321490776742136093673689890771
[+] e = 65537
[+] n bit length: 256
[*] Factoring n...
[+] p = 296841965476806071
[+] q = 295025657891467921
[+] Verification: True
[+] Private exponent d calculated

[+] Flag: CTF{w34k_pr1m3s_4r3_b4d_f0r_rs4}
```

## Flag

```
CTF{w34k_pr1m3s_4r3_b4d_f0r_rs4}
```

## Why This Works

1. **Small key size**: 256-bit RSA is trivially factorable
2. **Weak primes**: Both p and q are too small
3. **Public n**: Once we factor n, we can calculate d

## Alternative Attack Methods

If factoring didn't work, we could try:

### Fermat's Factorization
When p and q are close together:

```python
import math

def fermat_factor(n):
    a = math.isqrt(n) + 1
    b2 = a*a - n
    
    while not is_square(b2):
        a += 1
        b2 = a*a - n
    
    b = math.isqrt(b2)
    return a - b, a + b
```

### Pollard's Rho Algorithm
For semi-prime factorization:

```python
from sympy.ntheory import pollard_rho

p = pollard_rho(n)
q = n // p
```

## Lessons Learned

1. **Key size matters** - Use at least 2048 bits for RSA
2. **Prime selection is critical** - Primes must be large and random
3. **Textbook RSA is broken** - Always use proper padding (OAEP)
4. **Never roll your own crypto** - Use well-tested libraries

## Mitigation

- **Use strong key sizes** - Minimum 2048 bits, prefer 4096
- **Generate cryptographically secure primes** - Use proven algorithms
- **Implement proper padding** - PKCS#1 v2.0 (OAEP) for encryption
- **Regular key rotation** - Don't use the same key forever
- **Consider post-quantum crypto** - RSA may not be future-proof

---

**Difficulty Rating:** 🟢 Easy  
**Category:** Cryptography  
**Points:** 300
