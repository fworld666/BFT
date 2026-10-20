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

// Simulate two votes for 100 and two votes for 50.
nodes[0].vote = () => ({
    nodeId: "A",
    value: 100,
    signature: "test-signature-A"
});

nodes[1].vote = () => ({
    nodeId: "B",
    value: 100,
    signature: "test-signature-B"
});

nodes[2].vote = () => ({
    nodeId: "C",
    value: 50,
    signature: "test-signature-C"
});

nodes[3].vote = () => ({
    nodeId: "D",
    value: 50,
    signature: "test-signature-D"
});

const result = simulator.runConsensus(100);

// No value reaches the quorum of 3.
assert.strictEqual(result.certificate, null);

// No certificate should be saved without consensus.
assert.strictEqual(simulator.commitCertificates.length, 0);

console.log("\nPASS: No certificate was created without consensus.");
