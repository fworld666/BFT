const Node = require("../node");
const Simulator = require("../simulator");

const nodes = [
    new Node("A"),
    new Node("B"),
    new Node("C"),
    new Node("D"),
    new Node("X1")
];

// Only the four original validators are approved.
const approvedValidators = ["A", "B", "C", "D"];

const simulator = new Simulator(
    nodes,
    null,
    approvedValidators
);

simulator.runConsensus(100);
