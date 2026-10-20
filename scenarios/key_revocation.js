const Node = require("../node");
const Simulator = require("../simulator");
const { stealKey, forgeVote } = require("../attacks");

const nodes = [
    new Node("A"),
    new Node("B"),
    new Node("C"),
    new Node("D")
];

const simulator = new Simulator(nodes);

// Attacker steals Node A's secret key.
const stolenSecret = stealKey(nodes[0]);

// Attacker creates a forged vote claiming to be from A.
const forgedVote = forgeVote("A", stolenSecret, 50);

// Replace A's vote with the forged vote.
nodes[0].vote = () => forgedVote;

console.log("\nBefore revocation:");
console.log("Attacker has forged a vote claiming to be from A.");

// Revoke Node A before the consensus round.
simulator.revoke("A");

console.log("\nConsensus after revocation:");
simulator.runConsensus(100);

