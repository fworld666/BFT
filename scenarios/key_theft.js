const Node = require("../node");
const Simulator = require("../simulator");

const {
    stealKey,
    forgeVote
} = require("../attacks");

const nodes = [
    new Node("A"),
    new Node("B"),
    new Node("C"),
    new Node("D")
];

// Steal node A's secret.
const stolenSecret = stealKey(nodes[0]);

// Forge a vote pretending to be node A.
const forgedVote = forgeVote(
    "A",
    stolenSecret,
    50
);

console.log("Forged vote:");
console.log(forgedVote);

// Replace A's normal voting behaviour with the forged vote.
nodes[0].vote = () => forgedVote;

// Run the existing consensus simulation.
const sim = new Simulator(nodes);
sim.runConsensus(100);