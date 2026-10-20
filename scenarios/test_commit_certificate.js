const assert = require("assert");
const Node = require("../node");
const Simulator = require("../simulator");

const nodes = [
    new Node("A"),
    new Node("B"),
    new Node("C"),
    new Node("D")
];

const simulator = new Simulator(nodes);
const result = simulator.runConsensus(100);

// A certificate must exist after successful consensus.
assert.notStrictEqual(result.certificate, null);

// The certificate must record the committed value.
assert.strictEqual(result.certificate.value, "100");

// All four accepted votes support value 100.
assert.strictEqual(result.certificate.signatures.length, 4);

// Each entry must contain a node ID and signature.
for (const evidence of result.certificate.signatures) {
    assert.ok(evidence.nodeId);
    assert.ok(evidence.signature);
}

// The certificate must also be retained by the simulator.
assert.strictEqual(simulator.commitCertificates.length, 1);

console.log("\nPASS: Commit certificate tests passed.");
