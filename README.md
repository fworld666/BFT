# BFT
# BFT Workshop: Parts 6–8

## Overview

This project extends the original Byzantine Fault Tolerance (BFT) simulator through three stages:

- **Part 6 – Quorum Reasoning and Safety:** Investigate how weakening quorum rules can violate consensus safety.
- **Part 7 – Breaking BFT:** Run attack scenarios to demonstrate weaknesses in validator behaviour, key protection, and quorum configuration.
- **Part 8 – Hardening a BFT System:** Add defensive mechanisms for equivocation detection, validator revocation, Sybil prevention, quorum validation, and commit certificates.

The project is an educational simulator. It demonstrates BFT security concepts and defensive techniques in a simplified JavaScript environment.

## Part 6 – Quorum Reasoning and Safety

### Changes

The existing quorum logic and `scenarios/quorum_tampering.js` were examined to compare normal consensus with a weakened quorum configuration.

The normal configuration requires three votes in a four-validator system. The tampered scenario reduces the quorum requirement to two votes.

### Functionality and Results

In the normal scenario, all four validators vote for `100`. The simulator requires three votes and successfully commits `100`.

In the tampered scenario, validators A and B vote for `100`, while C and D vote for `50`. Both values receive two votes and satisfy the weakened quorum requirement. The simulator reports `SAFETY VIOLATION!` because two conflicting values reach quorum simultaneously.

This experiment demonstrates that an incorrectly configured quorum can undermine BFT safety. Quorum rules must be designed so that conflicting decisions cannot both be accepted under the protocol's fault assumptions.

## Part 7 – Breaking BFT

Part 7 uses the original attack scenarios to observe how Byzantine behaviour and incorrect security assumptions affect consensus. These scenarios are kept separate so that attacks can be examined independently.

### Byzantine Behaviour

**File:** `scenarios/byzantine.js`

This scenario introduces a validator that votes for a different value from the other validators.

In the tested run, three validators vote for `100` and one votes for `50`. With a quorum of three, the simulator commits `100`.

The result demonstrates that a single incorrect vote does not necessarily prevent consensus when the remaining validators provide sufficient agreement.

### Equivocation

**File:** `scenarios/equivocation.js`

The scenario configures validator D to send different values to different recipients:

- D sends `100` to A.
- D sends `50` to B.
- D sends `75` to C.

This demonstrates equivocation: one validator presents conflicting information to different participants during the same round.

The attack scenario generates the conflicting messages. Detection and evidence logging are implemented separately in Part 8.1.

### Key Theft

**File:** `scenarios/key_theft.js`

This scenario simulates the compromise of a validator's secret key and the creation of a forged vote.

It demonstrates that an attacker who obtains a validator's credentials may be able to impersonate that validator. Consensus alone does not guarantee that a compromised identity can be trusted.

The scenario motivates the validator-revocation mechanism introduced in Part 8.2.

### Sybil Attack

**File:** `scenarios/sybil.js`

This scenario examines the risk of introducing additional attacker-controlled validator identities.

If unauthorised identities are admitted into the validator set, an attacker may gain additional voting power and influence the quorum calculation.

This demonstrates why validator membership must be controlled independently of the consensus mechanism.

### Quorum Tampering

**File:** `scenarios/quorum_tampering.js`

This scenario weakens the quorum requirement and allows conflicting values to reach quorum simultaneously.

The observed result is a safety violation, illustrating why quorum configuration must be protected against unsafe changes.

## Part 8 – Hardening a BFT System

### 8.1 Detect Equivocation

**Files:** `scenarios/equivocation.js` and `equivocation_detector.js`

The equivocation scenario was used to generate conflicting messages from validator D. An equivocation detector was added to identify conflicting values associated with the same validator and round.

The detector reports `EQUIVOCATION DETECTED` when conflicting messages are found. Its evidence log records information about the conflicting values and their recipients.

The tested scenario detected D sending `100` to A, `50` to B, and `75` to C in round 1.

This improvement makes equivocation visible and provides evidence that can be used for further investigation.

### 8.2 Strengthen Key Protection

**Files:** `simulator.js` and `scenarios/key_revocation.js`

The simulator was extended with a `revokedValidators` set and a `revoke(nodeId)` method.

When a validator is revoked, subsequent votes from that validator are rejected during consensus processing. The simulator also reports when a revoked validator attempts to participate.

The key-revocation scenario demonstrates a response to compromised validator credentials: revoke the affected validator and allow the remaining eligible validators to participate.

This is a simplified revocation mechanism. It does not implement a complete production-grade key rotation system or secure key storage.

### 8.3 Prevent Sybil Attacks

**Files:** `simulator.js` and `scenarios/sybil_hardening.js`

The simulator was extended with an `approvedValidators` allowlist. Only identities included in the approved set may contribute votes.

The vote-processing logic also rejects duplicate votes from the same validator identity within a consensus round.

The Sybil-hardening scenario introduces an unapproved validator, `X1`. The simulator rejects X1, accepts votes from the approved validators A, B, C, and D, and reaches quorum with four votes for `100`.

This demonstrates how validator admission control can prevent unauthorised identities from increasing voting power.

### 8.4 Protect Quorum Rules

**Files:** `quorum.js` and `scenarios/test_quorum_validation.js`

The quorum engine was extended with input validation and a quorum-safety check.

The total number of validators must be a positive integer. The quorum requirement is calculated using:

`Math.floor((2 * totalNodes) / 3) + 1`

The engine rejects a quorum configuration that falls below the calculated minimum or exceeds the total number of validators.

The validation test supplies an unsafe quorum configuration for a four-validator system. The expected behaviour is to reject the configuration with an `Unsafe quorum size` error.

This change helps prevent unsafe quorum settings from being accepted silently.

The validation checks the configured quorum size; it is not a formal proof of every BFT safety property.

### 8.5 Build a Commit Certificate

**Files:** `simulator.js`, `scenarios/test_commit_certificate.js`, and `scenarios/test_no_commit_certificate.js`

The simulator was extended to generate a commit certificate when a value reaches quorum.

The certificate records the committed value and the supporting validators' identities and signature values. It is printed to the terminal and stored in the `commitCertificates` array for later inspection.

A certificate has the following conceptual structure:

```javascript
{
    value: "100",
    signatures: [
        {
            nodeId: "A",
            signature: "..."
        }
    ]
}
```

The successful-consensus test was run and passed. All four validators voted for `100`, the quorum requirement was three, and the simulator generated a commit certificate containing A, B, C, and D.

The no-consensus test was also run and passed. A and B voted for `100`, while C and D voted for `50`. Neither value reached the required quorum of three. The simulator reported `NO CONSENSUS` and did not create or store a commit certificate.

These tests demonstrate that the certificate is created when consensus is reached and is not created when consensus fails.

**Cryptographic limitation:** The current `crypto.js` uses a simplified SHA-256-based construction involving a shared secret. It is not a production-grade asymmetric digital signature scheme. The commit-certificate tests verify certificate creation and storage, not independent cryptographic verification of every signature.

## Main Implementation Changes

### `simulator.js`

The simulator was extended to:

- Maintain an allowlist of approved validators.
- Reject votes from revoked or unapproved validators.
- Reject duplicate votes from the same validator identity.
- Count votes and determine whether a value reaches quorum.
- Report successful commits, failed consensus, and multiple values reaching quorum.
- Generate and store commit certificates when consensus is reached.

### `quorum.js`

The quorum engine validates the total validator count, calculates the quorum requirement, and rejects unsafe quorum sizes.

### `equivocation_detector.js`

The detector identifies conflicting values from the same validator and records evidence about the observed messages.

### Additional Scenario and Test Files

The following files were added for hardening or testing:

- `scenarios/key_revocation.js` demonstrates validator revocation.
- `scenarios/sybil_hardening.js` demonstrates rejection of an unapproved validator.
- `scenarios/test_quorum_validation.js` tests unsafe quorum rejection.
- `scenarios/test_commit_certificate.js` tests certificate creation and storage.
- `scenarios/test_no_commit_certificate.js` tests the absence of a certificate when consensus is not reached.

The existing attack scenarios, including `byzantine.js`, `equivocation.js`, `key_theft.js`, `sybil.js`, and `quorum_tampering.js`, provide the baseline for comparing attacks with defensive measures.

No intentional deletion of original project files is documented in these changes.

## Running the Scenarios

Run the commands from the project root directory.

### Part 6: Quorum Reasoning

```bash
node scenarios/honest.js
node scenarios/quorum_tampering.js
```

### Part 7: Attack Scenarios

```bash
node scenarios/byzantine.js
node scenarios/equivocation.js
node scenarios/key_theft.js
node scenarios/sybil.js
node scenarios/quorum_tampering.js
```

### Part 8: Hardening and Tests

```bash
node equivocation_detector.js
node scenarios/key_revocation.js
node scenarios/sybil_hardening.js
node scenarios/test_quorum_validation.js
```

### Commit Certificate Tests

```bash
node --check simulator.js
node --check scenarios/test_commit_certificate.js
node scenarios/test_commit_certificate.js

node --check scenarios/test_no_commit_certificate.js
node scenarios/test_no_commit_certificate.js
```

The commit-certificate tests cover two outcomes: successful consensus with a certificate, and failed consensus without a certificate.

## Conclusion

Parts 6–8 demonstrate the progression from understanding BFT safety assumptions, to exploring attacks, and finally to implementing defensive mechanisms.

The main lessons are that quorum rules must preserve consensus safety, validator identities and credentials require protection, equivocation should be detected, and consensus decisions should be accompanied by evidence.

The resulting project is an educational prototype for investigating BFT attacks, defensive mechanisms, and the relationship between consensus and auditable evidence.
